# 3D Scene Editor Usage

Run `npm run dev`, scroll to the desk, and choose **Edit scene**. The editor is omitted from production UI.

## Objects

The Objects panel lists configured instances and supports hierarchy search, registered-model search/add, selection, duplication, deletion, rename, enabled/visible toggles, shadow flags, reset, and numeric or gizmo transforms. Multiple instances may reference the same registered asset. Duplicates begin with a small X offset.

Choose translate, rotate, or scale, select world/local coordinates, and optionally enable gizmo snapping. Rotation fields use degrees; the Three.js gizmo converts its rotation back to degrees when the gesture ends.

## Lights and environment

The Lights panel supports ambient, hemisphere, directional, point, spot, and rectangular-area lights. Select, add, duplicate, delete, rename, enable/hide, and configure their type-specific fields. The Environment panel controls background, fog, shadows, tone mapping, exposure, environment intensity, and the pixel-ratio cap.

Scene shadows default off. Enable them only when the scene needs them; object shadow flags and light shadow flags take effect only when global shadows are enabled.

## Camera and configuration

The Camera panel edits each existing scroll stop's progress, position, and target. Progress is kept between adjacent stops to preserve the camera interpolation order.

The Config panel can copy or download the complete JSON configuration, import a JSON file or pasted JSON, and save/load named presets in browser local storage. Use **Load saved presets** to refresh the list. Invalid imports show validation errors and do not replace the current scene. The scene configuration's enabled checkbox switches between the edited configuration and the original default scene while retaining edits.

Undo and redo apply to scene configuration edits, with a maximum of 50 saved states. Reset restores the original scene configuration and camera path.

## Editing the source defaults

To make an edited layout the source default:

1. Copy the complete configuration from the Config panel.
2. Replace `defaultSceneConfiguration` in `src/components/three/config/defaultScene.ts` with the exported object.
3. Keep its `version: 1`, asset IDs, and required fields; run `npm run 3d:scan:check`, `npx tsc --noEmit`, and `npm run build`.

The scene can be used without the editor by rendering `ConfiguredSceneRuntime` inside a React Three Fiber Canvas and passing the same validated `SceneConfiguration`.
