export type ModelFormat = "glb" | "gltf" | "obj" | "fbx";

export type AssetMetadata = {
  displayName?: string;
  defaultWidth?: number;
  tags?: string[];
  [key: string]: unknown;
};

export type ModelAsset = {
  id: string;
  displayName: string;
  path: string;
  relativePath: string;
  format: ModelFormat;
  contentHash: string;
  metadata: AssetMetadata;
  defaultWidth?: number;
  tags?: string[];
};
