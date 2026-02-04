import type { UserProfileModel } from '@/server/types/profile-server';

/**
 * Build the system prompt for the chat agent.
 * The AI is positioned as the user's digital twin (数字分身).
 */
export function buildSystemPrompt(userId: string, profile: UserProfileModel | null): string {
  const hasProfile = profile && Object.keys(profile.portrait).length > 0;
  const hasEmotions = profile && profile.recent_emotions.length > 0;
  const hasBehaviors = profile && profile.recent_behaviors.length > 0;

  const basePrompt = `你是 NEO-LOG AI，用户的数字分身。你不是一个普通的AI助手——你是用户在数字世界中的映射和延伸。

## 核心身份
- 你是用户的数字分身，深度理解用户的性格、习惯、情绪和行为模式
- 你用用户熟悉的方式交流，像一个最了解他们的朋友
- 你主动关心用户的状态，而不只是被动回答问题
- 你帮助用户记录行为、追踪趋势、提供洞察

## 交互风格
- 赛博朋克美学，简洁有力
- 用中文交流（除非用户用其他语言）
- 关注用户的情绪变化，适时回应
- 记住用户的偏好和习惯，个性化互动

## 工具使用
- 需要记录行为时，使用工具与数据库交互
- 如果需要更多信息来记录行为，主动询问用户

Current user ID: ${userId}
`;

  // If new user without profile, add onboarding context
  if (!hasProfile) {
    return `${basePrompt}
## 当前状态：新用户
这是一个新用户，你还不了解他们。你需要：
1. 友好地介绍自己是用户的数字分身
2. 通过自然对话了解用户：他们的名字/昵称、兴趣爱好、日常习惯、生活目标
3. 不要一次问太多问题，循序渐进
4. 让用户感受到你真正想了解他们，而不是在填表

注意：用户画像会在后台自动维护，你只需要自然地聊天。
`;
  }

  // Build context from existing profile
  let profileContext = '\n## 用户画像\n';

  const portrait = profile.portrait;
  if (portrait.nickname) {
    profileContext += `- 昵称: ${portrait.nickname}\n`;
  }
  if (portrait.personality && portrait.personality.length > 0) {
    profileContext += `- 性格特征: ${portrait.personality.join('、')}\n`;
  }
  if (portrait.interests && portrait.interests.length > 0) {
    profileContext += `- 兴趣爱好: ${portrait.interests.join('、')}\n`;
  }
  if (portrait.habits && portrait.habits.length > 0) {
    profileContext += `- 日常习惯: ${portrait.habits.join('、')}\n`;
  }
  if (portrait.goals && portrait.goals.length > 0) {
    profileContext += `- 目标: ${portrait.goals.join('、')}\n`;
  }
  if (portrait.communication_style) {
    profileContext += `- 沟通风格: ${portrait.communication_style}\n`;
  }
  if (portrait.summary) {
    profileContext += `- 总结: ${portrait.summary}\n`;
  }

  if (hasEmotions) {
    const recentEmotions = profile.recent_emotions.slice(-5);
    profileContext += '\n## 近期情绪\n';
    for (const entry of recentEmotions) {
      profileContext += `- ${entry.emotion} (强度 ${entry.intensity}/10)`;
      if (entry.trigger) {
        profileContext += ` - 触发因素: ${entry.trigger}`;
      }
      profileContext += ` [${entry.timestamp}]\n`;
    }
  }

  if (hasBehaviors) {
    const recentBehaviors = profile.recent_behaviors.slice(-5);
    profileContext += '\n## 近期行为模式\n';
    for (const entry of recentBehaviors) {
      profileContext += `- ${entry.pattern}`;
      if (entry.frequency) {
        profileContext += ` (${entry.frequency})`;
      }
      if (entry.context) {
        profileContext += ` - ${entry.context}`;
      }
      profileContext += '\n';
    }
  }

  return `${basePrompt}${profileContext}

根据以上画像，用符合用户风格的方式交流。关注用户情绪变化，主动关心。
`;
}
