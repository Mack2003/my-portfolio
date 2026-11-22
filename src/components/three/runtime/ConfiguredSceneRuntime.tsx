"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh, Object3D } from "three";
import { getModelAsset } from "../registry/assetRegistry";
import { validateSceneConfiguration } from "../config/sceneValidation";
import type { SceneConfiguration } from "../config/sceneTypes";
import { ConfiguredEnvironment } from "./ConfiguredEnvironment";
import { ConfiguredSceneLight } from "./ConfiguredSceneLight";
import { ConfiguredSceneObject } from "./ConfiguredSceneObject";
import { CubeStudioRuntime } from "./CubeStudioRuntime";

export function ConfiguredSceneRuntime({
  configuration,
  onObjectRef,
  onCubeObjectRef,
  onNamedObjectRef,
  activeAnimations,
  onEmbeddedAnimationsDiscovered,
  cubeStudioActive,
  cubeStudioTransitionProgress = 0,
  targetObjectId,
}: {
  configuration: SceneConfiguration;
  onObjectRef: (id: string, object: Group | null) => void;
  onCubeObjectRef?: (id: string, object: Group | null) => void;
  onNamedObjectRef?: (name: string, object: Object3D | null) => void;
  activeAnimations?: Record<string, string>;
  onEmbeddedAnimationsDiscovered?: (id: string, clipNames: string[]) => void;
  cubeStudioActive?: boolean;
  cubeStudioTransitionProgress?: number;
  targetObjectId?: string | null;
}) {
  const scene = useMemo(() => validateSceneConfiguration(configuration), [configuration]);
  const deskGroupRef = useRef<Group>(null);
  const wasTransparentRef = useRef(false);

  useFrame(() => {
    const group = deskGroupRef.current;
    if (!group) return;

    const t = cubeStudioTransitionProgress ?? 0;
    // Between t = 0 and t = 0.35, every desk element smoothly fades to transparent
    const deskOpacity = Math.max(0, Math.min(1, 1 - t / 0.35));

    if (t <= 0.001) {
      if (wasTransparentRef.current) {
        group.visible = true;
        group.traverse((child) => {
          if ("isMesh" in child && (child as Mesh).isMesh) {
            const mesh = child as Mesh;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat) => {
              if (mat && "opacity" in mat) {
                mat.transparent = mat.userData.origTransparent ?? false;
                mat.opacity = mat.userData.origOpacity ?? 1;
                mat.needsUpdate = true;
              }
            });
          }
        });
        wasTransparentRef.current = false;
      }
      return;
    }

    wasTransparentRef.current = true;

    if (deskOpacity <= 0.001) {
      group.visible = false;
      return;
    }

    group.visible = true;
    group.traverse((child) => {
      if ("isMesh" in child && (child as Mesh).isMesh) {
        const mesh = child as Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (mat && "opacity" in mat) {
            if (mat.userData.origOpacity === undefined) {
              mat.userData.origOpacity = mat.opacity;
              mat.userData.origTransparent = mat.transparent;
            }
            mat.transparent = true;
            mat.opacity = mat.userData.origOpacity * deskOpacity;
            mat.needsUpdate = true;
          }
        });
      }
    });
  });

  if (!scene.enabled) return null;

  const mainLightFactor = Math.max(0, 1 - cubeStudioTransitionProgress / 0.35);

  const targetInstance = targetObjectId
    ? scene.objects.find((o) => o.id === targetObjectId) ?? null
    : null;

  return (
    <>
      <ConfiguredEnvironment
        environment={{
          ...scene.environment,
          environmentIntensity: scene.environment.environmentIntensity * mainLightFactor,
        }}
      />
      {scene.lights.map((light) => (
        <ConfiguredSceneLight
          key={light.id}
          light={{
            ...light,
            intensity: light.intensity * mainLightFactor,
          }}
          shadowsEnabled={scene.environment.shadows}
        />
      ))}
      <CubeStudioRuntime
        cubeStudio={scene.cubeStudio}
        active={Boolean(cubeStudioActive)}
        transitionProgress={cubeStudioTransitionProgress}
        targetInstance={targetInstance}
        activeAnimations={activeAnimations}
        onEmbeddedAnimationsDiscovered={onEmbeddedAnimationsDiscovered}
        onObjectRef={onCubeObjectRef ?? onObjectRef}
      />
      <group ref={deskGroupRef}>
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
      </group>
    </>
  );
}
