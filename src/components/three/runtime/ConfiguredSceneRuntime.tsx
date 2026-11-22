"use client";

import type { Group, Object3D } from "three";
import { getModelAsset } from "../registry/assetRegistry";
import { validateSceneConfiguration } from "../config/sceneValidation";
import type { SceneConfiguration } from "../config/sceneTypes";
import { ConfiguredEnvironment } from "./ConfiguredEnvironment";
import { ConfiguredSceneLight } from "./ConfiguredSceneLight";
import { ConfiguredSceneObject } from "./ConfiguredSceneObject";

export function ConfiguredSceneRuntime({
  configuration,
  onObjectRef,
  onNamedObjectRef,
  activeAnimations,
  onEmbeddedAnimationsDiscovered,
}: {
  configuration: SceneConfiguration;
  onObjectRef: (id: string, object: Group | null) => void;
  onNamedObjectRef?: (name: string, object: Object3D | null) => void;
  activeAnimations?: Record<string, string>;
  onEmbeddedAnimationsDiscovered?: (id: string, clipNames: string[]) => void;
}) {
  const scene = validateSceneConfiguration(configuration);
  if (!scene.enabled) return null;

  return (
    <>
      <ConfiguredEnvironment environment={scene.environment} />
      {scene.lights.map((light) => (
        <ConfiguredSceneLight
          key={light.id}
          light={light}
          shadowsEnabled={scene.environment.shadows}
        />
      ))}
      {scene.objects
        .filter((instance) => instance.enabled)
        .map((instance) => {
          if (instance.geometry) {
            return (
              <ConfiguredSceneObject
                key={instance.id}
                instance={instance}
                onObjectRef={onObjectRef}
                activeAnimationId={activeAnimations?.[instance.id]}
                onEmbeddedAnimationsDiscovered={onEmbeddedAnimationsDiscovered}
              />
            );
          }
          const asset = getModelAsset(instance.assetId);
          if (!asset) {
            throw new Error(
              `Scene object "${instance.name}" references unknown model asset "${instance.assetId}".`,
            );
          }
          return (
            <ConfiguredSceneObject
              key={instance.id}
              asset={asset}
              instance={instance}
              onObjectRef={onObjectRef}
              namedObjectNames={instance.id === "violin" ? ["Bow", "strings1"] : undefined}
              onNamedObjectRef={instance.id === "violin" ? onNamedObjectRef : undefined}
              activeAnimationId={activeAnimations?.[instance.id]}
              onEmbeddedAnimationsDiscovered={onEmbeddedAnimationsDiscovered}
            />
          );
        })}
    </>
  );
}
