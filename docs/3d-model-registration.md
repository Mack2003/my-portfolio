# 3D Model Registration

Models belong under `public/models/`. The scanner recursively discovers `.glb`, `.gltf`, `.obj`, and `.fbx` files and writes `src/components/three/registry/generatedAssetRegistry.json`.

## Refresh the registry

```sh
npm run 3d:scan
npm run 3d:scan:check
```

Optional watch mode is available with `npm run 3d:scan:watch`. Stop it with Ctrl+C. No browser-side filesystem access or additional package is used.

## IDs and metadata

An ID is derived from the normalized relative path without the extension. It is stable while that path remains stable; renaming a file creates a new ID. The scanner records a SHA-256 content hash to report possible renames, deleted files, and changed content. ID collisions stop the scan. Symbolic links and unsafe relative paths are not registered.

Put human-maintained overrides in `src/components/three/registry/assetMetadata.json`, keyed by asset ID. Supported fields are:

```json
{
  "skills-icons-react-logo-circle": {
    "displayName": "React",
    "defaultWidth": 0.4,
    "tags": ["skill-icon"]
  }
}
```

The generated manifest also retains the complete metadata object. Metadata for deleted models is reported and intentionally kept, so accidental deletion or a rename does not erase manual annotations.

The development editor's searchable model dropdown reads this registry. Adding a model there creates an instance in the scene configuration; it does not silently place every newly discovered file into the default portfolio layout.

Unsupported file extensions are reported and skipped. `.gltf` external files are resolved by GLTFLoader; OBJ/FBX models use the loaders shipped with the existing Three.js dependency. Any referenced sidecar assets must also be reachable under the corresponding public URL.
