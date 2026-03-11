# 3D Character Models

This directory should contain the 3D character models for the cyberpunk chat scene.

## Required Models

Place the following GLB files in this directory:

- `hacker.glb` - Cyberpunk hacker character
- `android.glb` - Android/robot character
- `cyborg.glb` - Half-mechanical cyborg character
- `runner.glb` - Parkour/runner character
- `netizen.glb` - Digital citizen character

## Model Requirements

### Technical Specs
- **Format**: GLB (GLTF binary)
- **Polygon count**:
  - Desktop: < 10,000 polygons
  - Mobile: < 5,000 polygons (will be downsampled automatically)
- **Height**: Approximately 1.7 units (human height)
- **Origin**: Model bottom center (feet at y=0)
- **Texture size**: < 2048x2048 per texture
- **File size**: < 2MB per model

### Style Guidelines
- **Aesthetic**: Cyberpunk, futuristic, neon-accented
- **Materials**: Should support PBR (Physically Based Rendering)
- **Animations**: Optional idle animation (will be played if available)
- **Rigging**: Not required, but idle animation recommended

## Recommended Sources

### Free Model Libraries
1. **Sketchfab** - https://sketchfab.com/
   - Filter by "Downloadable" and "CC0" or "CC-BY"
   - Search terms: "cyberpunk character", "sci-fi character", "robot"

2. **Poly Pizza** - https://poly.pizza/
   - Formerly Google Poly
   - Free low-poly models

3. **Ready Player Me** - https://readyplayer.me/
   - Create customizable 3D avatars
   - Export as GLB

4. **Mixamo** - https://www.mixamo.com/
   - Free rigged characters with animations
   - Adobe account required

### Model Optimization
If you have high-poly models, optimize them using:
- **glTF-Transform** - https://gltf-transform.dev/
- **Blender** - Free 3D software for decimation and optimization

## Fallback Behavior

If a model file is not found, the system will display a placeholder geometry made of primitive shapes (capsules and spheres) in the brand colors. This allows you to test the functionality before adding proper models.

## Testing

After adding models:
1. Restart the dev server if it's running
2. Open the chat and switch to 3D mode
3. The character should load and be clickable
4. Hover should show a glow effect
5. Click should open the input bubble

## License Considerations

Ensure any models you use comply with their licenses:
- **CC0** - Public domain, no attribution required
- **CC-BY** - Attribution required
- **Commercial licenses** - Check if allowed for your use case

Add attribution in `public/models/characters/CREDITS.md` if required.
