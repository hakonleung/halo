# 3D 模型资源

## 推荐免费 3D 模型库

### 1. Sketchfab (推荐)
- **网址**: https://sketchfab.com
- **许可**: 搜索 "Downloadable" + "CC BY" 或 "CC0"
- **关键词**: "cyberpunk character", "sci-fi room", "futuristic desk", "hologram screen"
- **格式**: 下载 GLB/GLTF 格式

### 2. Poly Pizza
- **网址**: https://poly.pizza
- **许可**: CC0 (完全免费)
- **特点**: 低多边形风格，适合性能优化
- **关键词**: "robot", "character", "room", "computer"

### 3. Ready Player Me
- **网址**: https://readyplayer.me
- **许可**: 免费用于个人项目
- **特点**: 可自定义人物角色，支持导出 GLB
- **用途**: 创建自定义角色模型

### 4. Quaternius
- **网址**: http://quaternius.com
- **许可**: CC0
- **特点**: 大量低多边形模型，性能友好
- **用途**: 环境装饰、道具

## 推荐的赛博朋克风格资源

### 角色模型 (characters/)
搜索关键词：
- "cyberpunk character"
- "sci-fi hacker"
- "robot android"
- "futuristic person"
- "neon punk"

**要求**：
- 格式: GLB
- 多边形数: Desktop < 10k, Mobile < 5k
- 高度: 约 1.7 units
- 动画: 可选 idle 动画

### 房间装饰
搜索关键词：
- "cyberpunk room"
- "sci-fi desk"
- "futuristic computer"
- "neon sign"
- "hologram screen"

### 下载示例（Sketchfab）

1. 访问 https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&licenses=b9ddc40b93e34cdca1fc152f39b9f375&q=cyberpunk+character&sort_by=-pertinence&type=models

2. 选择合适的模型，点击 "Download 3D Model"

3. 选择格式: **glTF Binary (.glb)**

4. 放置到对应目录:
   ```
   public/models/characters/[preset-name].glb
   ```

## 当前模型配置

将下载的模型文件放置到以下位置：

```
public/models/characters/
├── hacker.glb      # 赛博黑客
├── android.glb     # 机器人
├── cyborg.glb      # 半机械人
├── runner.glb      # 跑酷者
└── netizen.glb     # 网民
```

## 性能优化建议

### 模型优化
- 使用 https://gltf.report/ 检查模型性能
- 使用 https://glb.vision/ 压缩模型
- 移除不必要的动画和纹理

### 多边形限制
- **Desktop**: < 10,000 polygons
- **Mobile**: < 5,000 polygons

### 纹理优化
- 分辨率: Desktop 1024x1024, Mobile 512x512
- 格式: 优先使用 WebP 或压缩的 JPEG
- 合并纹理图集减少 draw calls

## 替代方案

如果找不到合适的模型，可以：
1. 使用当前的 placeholder 几何体（已实现）
2. 使用 https://www.mixamo.com 下载带动画的角色
3. 使用 Blender 自己创建简单的低多边形模型
4. 购买付费资源包（如 Synty Studios 的赛博朋克资产包）

## 许可证注意事项

使用模型前请确认：
- ✅ CC0: 完全免费，无需署名
- ✅ CC BY: 免费，需署名原作者
- ❌ CC BY-NC: 禁止商业使用
- ❌ CC BY-ND: 禁止修改

**本项目使用**: 优先选择 CC0 或 CC BY 许可的模型
