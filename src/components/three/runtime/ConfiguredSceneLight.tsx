"use client";

import { useMemo } from "react";
import { Object3D } from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import type { SceneLight } from "../config/sceneTypes";

RectAreaLightUniformsLib.init();

export function ConfiguredSceneLight({
  light,
  shadowsEnabled,
}: {
  light: SceneLight;
  shadowsEnabled: boolean;
}) {
  const target = useMemo(
    () => (light.type === "directional" || light.type === "spot" ? new Object3D() : null),
    [light.type],
  );
  if (!light.enabled || !light.visible) return null;

  switch (light.type) {
    case "ambient":
      return <ambientLight color={light.color} intensity={light.intensity} />;
    case "hemisphere":
      return (
        <hemisphereLight
          color={light.color}
          groundColor={light.groundColor}
          intensity={light.intensity}
        />
      );
    case "directional":
      return (
        <group>
          <directionalLight
            color={light.color}
            intensity={light.intensity}
            position={light.position}
            target={target ?? undefined}
            castShadow={shadowsEnabled && light.shadows}
          />
          {target && <primitive object={target} position={light.target} />}
        </group>
      );
    case "point":
      return (
        <pointLight
          color={light.color}
          intensity={light.intensity}
          position={light.position}
          distance={light.distance}
          decay={light.decay}
          castShadow={shadowsEnabled && light.shadows}
        />
      );
    case "spot":
      return (
        <group>
          <spotLight
            color={light.color}
            intensity={light.intensity}
            position={light.position}
            target={target ?? undefined}
            angle={light.angle}
            penumbra={light.penumbra}
            distance={light.distance}
            decay={light.decay}
            castShadow={shadowsEnabled && light.shadows}
          />
          {target && <primitive object={target} position={light.target} />}
        </group>
      );
    case "rectArea":
      return (
        <rectAreaLight
          color={light.color}
          intensity={light.intensity}
          position={light.position}
          rotation={light.rotation.map((degrees) => (degrees * Math.PI) / 180) as [number, number, number]}
          width={light.width}
          height={light.height}
        />
      );
  }
}
