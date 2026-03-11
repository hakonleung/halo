# 3D 模型下载指南

## 🚀 快速开始（5分钟）

### 步骤 1: 访问 Sketchfab
```
https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&q=low+poly+character&type=models
```

### 步骤 2: 选择模型
筛选条件：
- ✅ Downloadable
- ✅ License: CC0 或 CC BY
- ✅ Polygons: < 10k
- ✅ 风格: 低多边形、赛博朋克、科幻

### 步骤 3: 下载
1. 点击模型进入详情页
2. 点击右侧 "Download 3D Model" 按钮
3. 选择格式: **glTF Binary (.glb)**
4. 点击 Download

### 步骤 4: 放置文件
将下载的 `.glb` 文件重命名并放到：
```
public/models/characters/
├── hacker.glb
├── android.glb
├── cyborg.glb
├── runner.glb
└── netizen.glb
```

## 📦 推荐的具体模型

### 1. Hacker (黑客)
**搜索关键词**: "low poly hacker" 或 "cyberpunk character"
**推荐模型**:
- 任何低多边形人形角色
- 带有科技感的装备
- 颜色可通过代码自定义（不用担心原始颜色）

**示例搜索链接**:
```
https://sketchfab.com/search?q=low+poly+hacker&type=models&features=downloadable
```

### 2. Android (机器人)
**搜索关键词**: "low poly robot" 或 "simple robot"
**推荐**:
- Poly Pizza 上有很多简单机器人
- 方块风格机器人最适合

**Poly Pizza 链接**:
```
https://poly.pizza/?s=robot
```

### 3. Cyborg (半机械人)
**搜索关键词**: "cyborg" 或 "android character"

### 4. Runner (跑酷者)
**搜索关键词**: "low poly person" 或 "stylized character"

### 5. Netizen (网民)
**搜索关键词**: "simple character" 或 "low poly avatar"

## 🎯 最简单方案 - Poly Pizza

如果 Sketchfab 下载麻烦，直接用 Poly Pizza：

1. 访问: https://poly.pizza
2. 搜索: "robot" 或 "character"
3. 点击模型 → 右上角 Download → GLB
4. 全部 CC0 免费，无需注册

**推荐模型**:
- Robot #1 → 重命名为 `hacker.glb`
- Robot #2 → 重命名为 `android.glb`
- Character #1 → 重命名为 `runner.glb`
- 等等...

## ⚡ 临时测试方案

如果暂时不想下载模型，系统会自动使用 placeholder 几何体：
- 简单的胶囊体组成的人形
- 颜色会根据你的自定义设置变化
- 支持所有交互功能

**placeholder 已经可用**，下载模型只是为了更好的视觉效果！

## 🔍 验证模型

下载后验证：
1. 文件大小: 应该 < 5MB
2. 格式: `.glb` 扩展名
3. 刷新页面，模型应该加载成功
4. 如果失败，查看 Console 错误信息

## 📝 许可证说明

- **CC0**: 完全免费，可商用，无需署名
- **CC BY**: 免费，需在关于页面署名原作者
- **避免**: CC BY-NC (禁止商用), CC BY-ND (禁止修改)

## 💡 提示

1. **不用担心颜色**: 代码会自动应用你的自定义颜色
2. **不用担心大小**: 代码会自动缩放到合适尺寸
3. **不用担心动画**: 有动画就用，没有也不影响
4. **Placeholder 很好用**: 即使不下载模型也能正常使用所有功能

## 🆘 遇到问题？

如果模型加载失败：
1. 检查文件路径是否正确
2. 检查文件名是否匹配（区分大小写）
3. 检查文件格式是否为 `.glb`
4. 查看浏览器 Console 的错误信息
5. 尝试使用更简单的模型（更少多边形）
