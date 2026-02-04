import { profileService } from '@/server/services/profile-service';

import type { Database } from '@/server/types/database';
import type {
  UserProfileModel,
  UserPortrait,
  EmotionEntry,
  BehaviorSummary,
} from '@/server/types/profile-server';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Result from the profile agent analysis
 */
interface ProfileAnalysisResult {
  portrait_updates: Partial<UserPortrait> | null;
  new_emotions: EmotionEntry[];
  new_behaviors: BehaviorSummary[];
}

const ANALYSIS_PROMPT = `你是一个用户画像分析引擎。根据用户的最新消息和现有画像数据，分析并输出更新。

## 任务
1. **画像更新**: 从对话中提取用户的新信息（昵称、性格特征、兴趣、习惯、目标、沟通风格），与现有画像合并
2. **情绪识别**: 识别用户当前的情绪状态、强度(1-10)和可能的触发因素
3. **行为模式**: 识别用户提到的行为模式或活动

## 规则
- 只提取确定的信息，不要猜测
- 如果没有新信息可提取，对应字段返回 null 或空数组
- 情绪强度: 1=很微弱, 5=中等, 10=非常强烈
- 画像中的数组字段（personality, interests, habits, goals）应该是合并后的完整列表，不是增量
- 用中文输出

## 输出格式
严格输出 JSON，不要输出其他内容：
{
  "portrait_updates": {
    "nickname": "string or null",
    "personality": ["string array or null"],
    "interests": ["string array or null"],
    "habits": ["string array or null"],
    "goals": ["string array or null"],
    "communication_style": "string or null",
    "summary": "string or null"
  },
  "new_emotions": [
    {
      "emotion": "情绪名称",
      "intensity": 5,
      "trigger": "触发因素或null"
    }
  ],
  "new_behaviors": [
    {
      "pattern": "行为描述",
      "frequency": "频率或null",
      "context": "上下文或null"
    }
  ]
}`;

/**
 * Run the profile agent to analyze user input and update profile/emotions/behaviors.
 * This runs asynchronously after the main chat response - it does not block the response.
 */
export async function runProfileAgent(
  llm: BaseChatModel,
  supabase: SupabaseClient<Database>,
  userId: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  try {
    // 1. Get current profile
    const profile = await profileService.getOrCreateProfile(supabase, userId);

    // 2. Build analysis prompt with context
    const contextPrompt = buildAnalysisContext(profile, userMessage, assistantMessage);

    // 3. Call LLM for analysis
    const response = await llm.invoke([
      { role: 'system', content: ANALYSIS_PROMPT },
      { role: 'user', content: contextPrompt },
    ]);

    const responseText = response.content.toString().trim();

    // 4. Parse the JSON response
    const analysis = parseAnalysisResponse(responseText);
    if (!analysis) {
      console.warn('[ProfileAgent] Failed to parse analysis response');
      return;
    }

    // 5. Apply updates
    const now = new Date().toISOString();

    if (analysis.portrait_updates && Object.keys(analysis.portrait_updates).length > 0) {
      // Remove null values from portrait updates
      const cleanPortrait = removeNullValues(analysis.portrait_updates);
      if (Object.keys(cleanPortrait).length > 0) {
        await profileService.updatePortrait(supabase, userId, cleanPortrait);
      }
    }

    if (analysis.new_emotions.length > 0) {
      const emotions: EmotionEntry[] = analysis.new_emotions.map((e) => ({
        ...e,
        timestamp: now,
      }));
      await profileService.addEmotions(supabase, userId, emotions);
    }

    if (analysis.new_behaviors.length > 0) {
      const behaviors: BehaviorSummary[] = analysis.new_behaviors.map((b) => ({
        ...b,
        timestamp: now,
      }));
      await profileService.addBehaviors(supabase, userId, behaviors);
    }
  } catch (error) {
    // Profile agent errors should not break the main chat flow
    console.error('[ProfileAgent] Error:', error);
  }
}

function removeNullValues(obj: Partial<UserPortrait>): UserPortrait {
  const result: UserPortrait = {};
  if (obj.nickname !== null && obj.nickname !== undefined) result.nickname = obj.nickname;
  if (obj.personality !== null && obj.personality !== undefined)
    result.personality = obj.personality;
  if (obj.interests !== null && obj.interests !== undefined) result.interests = obj.interests;
  if (obj.habits !== null && obj.habits !== undefined) result.habits = obj.habits;
  if (obj.goals !== null && obj.goals !== undefined) result.goals = obj.goals;
  if (obj.communication_style !== null && obj.communication_style !== undefined)
    result.communication_style = obj.communication_style;
  if (obj.summary !== null && obj.summary !== undefined) result.summary = obj.summary;
  return result;
}

function buildAnalysisContext(
  profile: UserProfileModel,
  userMessage: string,
  assistantMessage: string,
): string {
  const hasPortrait = Object.keys(profile.portrait).length > 0;

  let context = '## 现有用户画像\n';
  if (hasPortrait) {
    context += JSON.stringify(profile.portrait, null, 2);
  } else {
    context += '（新用户，暂无画像）';
  }

  if (profile.recent_emotions.length > 0) {
    context += '\n\n## 近期情绪记录\n';
    context += JSON.stringify(profile.recent_emotions.slice(-5), null, 2);
  }

  if (profile.recent_behaviors.length > 0) {
    context += '\n\n## 近期行为记录\n';
    context += JSON.stringify(profile.recent_behaviors.slice(-5), null, 2);
  }

  context += `\n\n## 最新对话\n用户: ${userMessage}\nAI回复: ${assistantMessage}`;

  return context;
}

function parseAnalysisResponse(text: string): ProfileAnalysisResult | null {
  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const parsed = JSON.parse(jsonStr) as ProfileAnalysisResult;

    // Validate structure
    if (typeof parsed !== 'object' || parsed === null) return null;

    return {
      portrait_updates: parsed.portrait_updates ?? null,
      new_emotions: Array.isArray(parsed.new_emotions) ? parsed.new_emotions : [],
      new_behaviors: Array.isArray(parsed.new_behaviors) ? parsed.new_behaviors : [],
    };
  } catch {
    return null;
  }
}
