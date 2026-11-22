# 3D Scene Editor Usage

Run `npm run dev`, scroll to the desk, and choose **Edit scene**. The editor is omitted from production UI.

## Objects

The Objects panel lists configured instances and supports hierarchy search, registered-model search/add, selection, duplication, deletion, rename, enabled/visible toggles, shadow flags, reset, and numeric or gizmo transforms. Multiple instances may reference the same registered asset. Duplicates begin with a small X offset.

Choose translate, rotate, or scale, select world/local coordinates, and optionally enable gizmo snapping. Rotation fields use degrees; the Three.js gizmo converts its rotation back to degrees when the gesture ends.

## Lights and environment

The Lights panel supports ambient, hemisphere, directional, point, spot, and rectangular-area lights. Select, add, duplicate, delete, rename, enable/hide, and configure their type-specific fields. The Environment panel controls background, fog, shadows, tone mapping, exposure, environment intensity, and the pixel-ratio cap.

Scene shadows default off. Enable them only when the scene needs them; object shadow flags and light shadow flags take effect only when global shadows are enabled.

## Animations and sequence loop

The Animations accordion on any selected object allows configuring both model-extracted animations and custom code presets:
- **Preset animations**: Choose from modular custom presets including **Pulse**, **Bounce**, **Rotate**, **Violin sway**, **Floating hover**, and **Bow swinging** (with expressive musical voice note phrasing and full stroke amplitude).
- **Continue all animations in loop**: Toggles sequential loop playback. When enabled, the object plays all included animations in sequence from first to last, then loops back indefinitely.
- **Sequence reordering**: Use the **▲ Move Up** and **▼ Move Down** buttons on each animation card to adjust playback order (`#1`, `#2`, `#3`...).
- **Play in sequence checkbox**: Individual toggle (`enabledInSequence`) allowing animations to remain in the object's configuration without participating in the loop sequence.
- **Duration (s)**: Configurable duration per animation step. For embedded clips, defaults to clip duration divided by speed; for custom presets, defaults to 3 seconds.
- When the sequence loop is disabled, the dropdown and **Set Single / Active** button allow selecting a single active animation.

## Cube Studio view & unified scene editing

The editor provides seamless scene navigation between the main **Desk Scene** and the isolated **Cube Studio View** using the existing unified settings panel:
- **Scene switcher & navigation button**: At the top of the settings panel, an active scene banner and navigation button (**Preview Cube View** / **Exit to Desk View**) allows switching between the Desk Scene and Cube Studio View in edit mode.
- **Unified Objects tab**: When in Cube View, the standard **Objects** tab directly manages all objects inside `cubeStudio.objects` with identical editing controls (model search/add, primitives, transforms, materials, glow, animations, sequence loop, interactions, and 3D transform gizmo). When in Desk View, it manages `configuration.objects`.
- **Unified Lights tab**: When in Cube View, the standard **Lights** tab directly manages all lights inside `cubeStudio.lights` with identical light properties (ambient, directional, point, spot, rectArea, hemisphere, color, intensity, position, target, angle, penumbra, shadows). When in Desk View, it manages `configuration.lights`.
- **Environment & Camera tabs**: In Cube View, the **Environment** and **Camera** tabs control the cube enclosure dimensions, 3D position `[X, Y, Z]`, interior color, roughness, metalness, and camera framing (distance, height, transition duration).
- **Smooth transparent dissolve & dark void transition**: When entering Cube View, all desk scene elements dissolve their opacity to transparent ($t \in [0, 0.35]$) and become invisible, and the camera glides through the dark background void ($t \in [0.20, 0.90]$) into the distant cube enclosure positioned at `[0, 80, 0]` with zero overlap with desk elements.
- **Circular cross exit button (`✕`)**: In presentation mode or preview, clicking the top-right circular cross button smoothly animates the camera back to the desk view and restores standard lighting and desk elements.

## Camera and configuration

The Camera panel edits each existing scroll stop's progress, position, and target. Progress is kept between adjacent stops to preserve the camera interpolation order.

The Config panel can copy or download the complete JSON configuration, import a JSON file or pasted JSON, and save/load named presets in browser local storage. Use **Load saved presets** to refresh the list. Invalid imports show validation errors and do not replace the current scene. The scene configuration's enabled checkbox switches between the edited configuration and the original default scene while retaining edits.

Undo and redo apply to scene configuration edits, with a maximum of 50 saved states. Reset restores the original scene configuration and camera path.

## Editing the source defaults

To make an edited layout the source default:

1. Copy the complete configuration from the Config panel (**Copy configuration** or **Download JSON**).
2. Open `src/components/three/config/defaultScene.json`, select all, and paste the copied JSON directly into it.
3. The runtime and `defaultScene.ts` will automatically load, validate, and extract all objects, transforms, materials, lights, environment, and camera stops from `defaultScene.json`.
4. Run `npx tsc --noEmit` and `npm run build` to verify.

The scene can be used without the editor by rendering `ConfiguredSceneRuntime` inside a React Three Fiber Canvas and passing the same validated `SceneConfiguration`.
