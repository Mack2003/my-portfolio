# 3D Scene Editor Architecture

The desk remains a React Three Fiber scene inside the portfolio's existing Next.js App Router page. The editor changes a serializable scene configuration; it does not own or recreate the WebGL renderer.

## Modules

- `src/components/three/registry/`: generated model manifest, runtime lookup, and hand-maintained metadata.
- `src/components/three/config/`: versioned scene types, original desk defaults, validation, migration defaults, and JSON serialization.
- `src/components/three/runtime/`: React Three Fiber renderers for configured objects, lights, environment, and the complete scene.
- `src/components/three/DeskSceneEditor.tsx`: development-only hierarchy, inspectors, transform controls, presets, undo/redo, and import/export UI.
- `src/components/sections/DeskStage.tsx`: owns the Canvas, scroll-driven camera, violin animation, visibility-triggered loading, and the editor's central undoable configuration state.
- `scripts/scan-models.mjs`: Node-only recursive asset discovery; browser code consumes the generated JSON and never reads the filesystem.

## Runtime and object lifetime

`ConfiguredSceneRuntime` validates the input configuration before rendering it. `ConfiguredSceneObject` selects the loader by registered file format. Drei's `useGLTF` and Fiber's `useLoader` cache loaded source assets; each instance gets a `SkeletonUtils.clone` of its object hierarchy, while immutable geometries and materials remain shared. Per-instance edits are transforms and visibility/shadow flags. If per-instance material editing is added later, clone the affected materials rather than mutating the shared source materials.

Removing or disabling an object unmounts its instance but does not dispose shared cached loader resources. This avoids breaking other instances that reference the same model. The current desk has a modest number of instances; instanced rendering should be measured before adding it.

## Renderer and fallback

The Canvas remains owned by `DeskStage`. Background/fog are scene children, while tone mapping and exposure are applied to the existing renderer in an effect; changes do not create another renderer. Pixel-ratio and shadow-map enablement are passed through the Canvas owner.

When `configuration.enabled` is false, `DeskStage` renders the immutable original default configuration. Edited data remains available and can be re-enabled. `ConfiguredSceneRuntime` itself renders nothing when called directly with a disabled configuration.

The editor and transform gizmo are rendered only when `NODE_ENV` is `development`. The desk's scroll camera and named violin bow animation continue to operate with the configured scene.

## Known boundaries

- Environment maps are not currently present in `public/`; environment intensity is retained in the configuration for later maps, but has no visible effect without one.
- There is no application-wide state library. The desk editor owns one reducer-backed configuration with a bounded 50-step undo/redo history.
- Shared model geometries/materials remain loader-owned; do not dispose them per instance.
