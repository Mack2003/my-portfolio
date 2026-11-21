import generatedAssets from "./generatedAssetRegistry.json";
import type { ModelAsset, ModelFormat } from "./assetTypes";

const modelFormats = new Set<string>(["glb", "gltf", "obj", "fbx"]);
function isModelFormat(format: string): format is ModelFormat {
  return modelFormats.has(format);
}

export const assetRegistry: readonly ModelAsset[] = generatedAssets.map((asset) => {
  if (!isModelFormat(asset.format)) {
    throw new Error(`Generated registry contains unsupported format "${asset.format}".`);
  }
  return { ...asset, format: asset.format };
});

export function getModelAsset(assetId: string): ModelAsset | undefined {
  return assetRegistry.find((asset) => asset.id === assetId);
}
