# 3D Scene Configuration

The canonical configuration is `defaultSceneConfiguration` from `src/components/three/config/defaultScene.ts`. It is plain serializable data; Three.js objects, materials, geometry, loaders, and renderer instances are never serialized.

## Shape

- Scene: `id`, `name`, schema `version`, global `enabled`.
- Objects: unique instance `id`, registered `assetId`, display `name`, `enabled`, `visible`, shadow flags, and a position/rotation/scale transform.
- Object interactions: optional `interactions` with `enabled`, the `click` trigger, and ordered JSON-safe actions. Supported actions are `playAudio`, `stopAudio`, `playAnimation`, `openModal`, `openUrl`, `showInformation`, `focusObject`, and `customAction`.
- Objects may use a registered `assetId` or an inline `geometry` primitive (`box`, `sphere`, `cylinder`, `plane`, `cone`, `torus`, `capsule`, `circle`, or `ring`). Primitives use serializable geometry parameters.
- Optional `material` controls base/emissive color, roughness, metalness, opacity, transparency, wireframe and face side. Optional `glow` can emit a point light from the object.
- Optional `animations` contains embedded GLB clip or custom preset definitions; `defaultAnimationId` selects the animation that runs by default. Custom presets are `pulse`, `bounce`, `rotate`, and `violin-sway`.
- Lights: unique ID, type, name, enabled/visible flags, color and intensity, plus only the properties supported by that light type.
- Environment: background, environment intensity, global shadows, fog, tone mapping, exposure, and pixel-ratio cap.
- Camera: ordered scroll stops with progress, view, position, and target.

Supported light types are `ambient`, `hemisphere`, `directional`, `point`, `spot`, and `rectArea`. Angles and object rotations are stored in degrees in the editor/config; the runtime converts rotations to radians.

## Validation and migration

`parseSceneConfiguration` parses JSON and validates it before applying it. Validation checks schema version, IDs, asset references, finite vectors and numbers, light-specific properties, colors, fog distances, and strictly increasing camera progress. Unknown properties on a light are rejected so a serialized light does not contain fields its Three.js type cannot use.

Version 1 imports receive safe defaults for optional object, light, environment, fog, and camera fields. Version 0 is migrated to version 1 before validation. Unsupported future versions and invalid asset references produce explicit errors.

## React Three Fiber API

Render the runtime inside the existing Fiber Canvas:

```tsx
<Canvas>
  <ConfiguredSceneRuntime
    configuration={defaultSceneConfiguration}
    onObjectRef={registerObject}
  />
</Canvas>
```

In the portfolio, `DeskStage` owns configuration activation and sends the original default configuration to the runtime when the editable configuration is disabled. A standalone caller may use `enabled` to suppress the configured scene; it should choose its own fallback.

In editing mode, the scene-object selector, hierarchy list, and canvas clicks share the same selection. The room remains in the scene but is excluded from selection. Inspector changes update that selected object's configuration and runtime immediately.

JSON copied by the editor is ready to paste as a JavaScript object. Replacing the default object in source lets the existing `DeskStage` continue to own the camera, loading lifecycle, Canvas, and violin interaction.
