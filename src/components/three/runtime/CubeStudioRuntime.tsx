"use client";

import { BackSide, type Group } from "three";
import type { CubeStudioConfiguration, SceneLight, SceneObjectInstance } from "../config/sceneTypes";
import type { ModelAsset } from "../registry/assetTypes";
import { getModelAsset } from "../registry/assetRegistry";
import { ConfiguredSceneLight } from "./ConfiguredSceneLight";
import { ConfiguredSceneObject } from "./ConfiguredSceneObject";

export function CubeStudioRuntime({
  cubeStudio,
  active,
  transitionProgress,
  targetInstance,
  activeAnimations,
  onEmbeddedAnimationsDiscovered,
  onObjectRef,
}: {
  cubeStudio?: CubeStudioConfiguration;
  active: boolean;
  transitionProgress: number;
  targetInstance?: SceneObjectInstance | null;
  activeAnimations?: Record<string, string>;
  onEmbeddedAnimationsDiscovered?: (id: string, clipNames: string[]) => void;
  onObjectRef?: (id: string, object: Group | null) => void;
}) {
  const targetAsset: ModelAsset | undefined = targetInstance?.assetId
    ? getModelAsset(targetInstance.assetId)
    : undefined;

  if (!cubeStudio || !cubeStudio.enabled) return null;
  if (!active && transitionProgress <= 0.001) return null;

  const cubeSize = cubeStudio.cubeSize || 36;
  const interiorColor = cubeStudio.interiorColor || "#050508";
  const roughness = cubeStudio.roughness ?? 0.95;
  const metalness = cubeStudio.metalness ?? 0.05;
  const studioPosition = cubeStudio.position ?? [0, 80, 0];

  // Studio lights fade in smoothly as the camera approaches and enters the distant cube
  const lightFactor = active ? 1 : Math.max(0, Math.min(1, (transitionProgress - 0.35) / 0.6));

  const handleObjectRef = onObjectRef ?? (() => {});

  const shouldRenderShowcase =
    targetInstance &&
    (!cubeStudio.objects || !cubeStudio.objects.some((o) => o.id === targetInstance.id));

  return (
    <group position={studioPosition}>
      {/* Giant interior-facing dark cube enclosure placed far away at isolated coordinate */}
      <mesh name="cube-environment">
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshStandardMaterial
          color={interiorColor}
          side={BackSide}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* Centered Showcase Object (if triggered by interaction from desk scene) */}
      {shouldRenderShowcase && targetInstance && (
        <group position={[0, 0, 0]}>
          <ConfiguredSceneObject
            key={`cube-studio-showcase-${targetInstance.id}`}
            instance={{
              ...targetInstance,
              id: targetInstance.id,
              transform: {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: targetInstance.transform.scale,
              },
            }}
            asset={targetAsset}
            onObjectRef={handleObjectRef}
            activeAnimationId={activeAnimations?.[targetInstance.id]}
            onEmbeddedAnimationsDiscovered={onEmbeddedAnimationsDiscovered}
          />
        </group>
      )}

      {/* Cube Studio objects */}
      {cubeStudio.objects
        ?.filter((obj) => {
          if (!targetInstance) return true;
          // When a targetInstance is actively showcased, avoid rendering another desk object or duplicate at [0, 0, 0]
          if (
            obj.id !== targetInstance.id &&
            (obj.id === "androidBug" || obj.interactions?.actions?.some((a) => a.type === "enterCubeView"))
          ) {
            return false;
          }
          return true;
        })
        .map((obj) => (
          <ConfiguredSceneObject
            key={`cube-studio-obj-${obj.id}`}
            instance={obj}
            asset={obj.assetId ? getModelAsset(obj.assetId) : undefined}
            onObjectRef={handleObjectRef}
            activeAnimationId={activeAnimations?.[obj.id]}
            onEmbeddedAnimationsDiscovered={onEmbeddedAnimationsDiscovered}
          />
        ))}

      {/* Cube Studio dedicated lights */}
      {cubeStudio.lights.map((light: SceneLight) => {
        const dimmedLight: SceneLight = {
          ...light,
          intensity: light.intensity * lightFactor,
        };
        return (
          <ConfiguredSceneLight
            key={`cube-studio-${light.id}`}
            light={dimmedLight}
            shadowsEnabled={Boolean("shadows" in light && light.shadows)}
          />
        );
      })}
    </group>
  );
}
