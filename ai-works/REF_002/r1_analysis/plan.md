# REF_002: 重构计划

> 纯技术重构，不改变功能行为

## 重构目标

1. **使用enum代替字面量类型** - 提升类型安全性和可维护性
2. **重构form组件** - 统一create/edit模式，整理到components/forms
3. **添加依赖分析工具** - 分析项目依赖图，找出未使用的代码
4. **Provider改为Zustand store** - 简化全局状态管理
5. **创建GlobalComponents统一入口** - 统一管理全局组件
6. **重命名ActionButton为ActionDrawer** - 更准确的命名，删除无用代码

## R1: 分析评估

### 1. 字面量类型分析

#### 需要改为enum的类型：

1. **Dashboard Range** (`src/types/dashboard-server.ts`)
   - 当前: `'today' | '7d' | '30d' | '90d' | 'custom'`
   - 改为: `enum DashboardRange`

2. **AI Provider** (`src/types/settings-server.ts`)
   - 当前: `'openai' | 'anthropic' | 'google'`
   - 改为: `enum AIProvider`

3. **Goal Category** (`src/components/goals/goal-form.tsx`, `src/types/goal-client.ts`)
   - 当前: 字符串字面量 `'health' | 'finance' | 'habit' | 'learning' | 'other'`
   - 改为: `enum GoalCategory`

4. **MetadataField Type** (`src/types/behavior-server.ts`)
   - 当前: 多个字面量联合类型
   - 保持现状（这些是类型系统的核心，改为enum会破坏类型推断）

5. **ActionDrawerTab** (`src/components/shared/action-drawer-context.tsx`)
   - 当前: `'record' | 'goal' | 'note'`
   - 改为: `enum ActionDrawerTab`

6. **DetailDrawerType** (`src/components/log/detail-drawer-provider.tsx`)
   - 当前: `'goal' | 'record' | 'definition' | 'note' | null`
   - 改为: `enum DetailDrawerType` (nullable)

### 2. Form组件分析

#### 当前状态：

1. **GoalForm** (`src/components/goals/goal-form.tsx`)
   - ✅ 已支持create和edit模式（通过initialData判断）
   - ❌ 位置：`components/goals/`，应移动到 `components/forms/`

2. **NoteForm** (`src/components/log/note-form.tsx`)
   - ✅ 已支持create和edit模式
   - ❌ 位置：`components/log/`，应移动到 `components/forms/`

3. **DefinitionForm** (`src/components/behaviors/definition-form.tsx`)
   - ✅ 已支持create和edit模式
   - ❌ 位置：`components/behaviors/`，应移动到 `components/forms/`

#### 重构计划：

- 创建 `src/components/forms/` 目录
- 移动三个form组件到新目录
- 更新所有import路径
- 确保create/edit模式复用逻辑正确

### 3. 依赖分析工具

#### 需求：

- 分析TypeScript/TSX文件的依赖关系
- 找出未被页面（app目录）依赖的变量/函数/类型
- 输出报告

#### 实现方案：

- 使用 `ts-morph` 或 `@typescript-eslint/typescript-estree` 解析AST
- 扫描所有 `.ts`/`.tsx` 文件
- 构建依赖图
- 从 `app/` 目录开始反向追踪依赖
- 找出未被引用的导出

### 4. Provider改为Zustand Store

#### 当前Provider：

1. **ActionDrawerProvider** (`src/components/shared/action-drawer-context.tsx`)
   - 状态：`isOpen`, `activeTab`
   - 方法：`openDrawer`, `closeDrawer`, `setActiveTab`

2. **DetailDrawerProvider** (`src/components/log/detail-drawer-provider.tsx`)
   - 状态：`drawerType`, `drawerId` (从URL query读取)
   - 方法：`closeDrawer`

#### 重构计划：

- 创建 `src/store/action-drawer-store.ts`
- 创建 `src/store/detail-drawer-store.ts`
- 将Provider逻辑迁移到store
- 更新所有使用Provider的组件
- 删除Provider文件

### 5. GlobalComponents统一入口

#### 当前全局组件：

- `ActionButton` (将重命名为 `ActionDrawer`)
- `DetailDrawers`
- `AnimatedBackground`

#### 重构计划：

- 创建 `src/components/global/global-components.tsx`
- 统一导出所有全局组件
- 在 `app/layout.tsx` 中使用统一入口

### 6. ActionButton重命名和清理

#### 当前问题：

- 组件名 `ActionButton` 不准确（实际是Drawer）
- 包含注释掉的按钮代码（无用代码）

#### 重构计划：

- 重命名为 `ActionDrawer`
- 删除注释掉的按钮代码
- 更新所有引用

## 重构步骤分解

### Step 1: 创建enum类型
1. 创建 `enum DashboardRange`
2. 创建 `enum AIProvider`
3. 创建 `enum GoalCategory`
4. 创建 `enum ActionDrawerTab`
5. 创建 `enum DetailDrawerType`
6. 更新所有使用这些类型的地方

### Step 2: 重构Form组件
1. 创建 `src/components/forms/` 目录
2. 移动 `GoalForm` 到 `components/forms/goal-form.tsx`
3. 移动 `NoteForm` 到 `components/forms/note-form.tsx`
4. 移动 `DefinitionForm` 到 `components/forms/definition-form.tsx`
5. 更新所有import路径
6. 验证create/edit模式正常工作

### Step 3: 添加依赖分析脚本
1. 安装依赖（如 `ts-morph`）
2. 创建 `scripts/analyze-dependencies.ts`
3. 实现依赖图构建逻辑
4. 实现未使用代码检测
5. 生成报告

### Step 4: Provider改为Zustand Store
1. 安装zustand（如未安装）
2. 创建 `src/store/action-drawer-store.ts`
3. 创建 `src/store/detail-drawer-store.ts`
4. 迁移状态和逻辑
5. 更新所有使用Provider的组件
6. 删除Provider文件
7. 更新 `app/layout.tsx`

### Step 5: 创建GlobalComponents
1. 创建 `src/components/global/global-components.tsx`
2. 导出所有全局组件
3. 更新 `app/layout.tsx` 使用统一入口

### Step 6: 重命名ActionButton
1. 重命名文件 `action-button.tsx` -> `action-drawer.tsx`
2. 重命名组件 `ActionButton` -> `ActionDrawer`
3. 删除注释掉的按钮代码
4. 更新所有引用

## 风险评估

### 高风险
- **Provider改为Store**: 可能影响全局状态管理，需要仔细测试
- **Form组件移动**: 需要更新大量import路径，容易遗漏

### 中风险
- **Enum类型替换**: 需要确保所有使用处都更新，可能影响运行时行为
- **依赖分析工具**: 新工具可能产生误报

### 低风险
- **ActionButton重命名**: 简单重命名，影响范围小
- **GlobalComponents创建**: 仅改变组织结构

## 验证计划

每个步骤完成后：
1. 运行 `pnpm tsc --noEmit` 检查类型错误
2. 运行 `pnpm lint --fix` 检查代码质量
3. 手动测试相关功能
4. 提交代码（小步提交）

## 预期收益

1. **类型安全**: Enum提供更好的类型检查和IDE支持
2. **代码组织**: Form组件统一管理，便于维护
3. **代码清理**: 依赖分析工具帮助发现未使用代码
4. **状态管理**: Zustand比Context更简洁高效
5. **代码可读性**: 统一入口和准确命名提升可维护性

