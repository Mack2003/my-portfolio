"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
  ACESFilmicToneMapping,
  CineonToneMapping,
  LinearToneMapping,
  NoToneMapping,
  ReinhardToneMapping,
} from "three";
import type { SceneEnvironment } from "../config/sceneTypes";

const toneMapping = {
  none: NoToneMapping,
  linear: LinearToneMapping,
  reinhard: ReinhardToneMapping,
  cineon: CineonToneMapping,
  aces: ACESFilmicToneMapping,
} as const;

export function ConfiguredEnvironment({ environment }: { environment: SceneEnvironment }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    // Renderer and scene are owned by the existing Canvas; update them without rebuilding it.
    // eslint-disable-next-line react-hooks/immutability
    gl.toneMapping = toneMapping[environment.toneMapping];
    gl.toneMappingExposure = environment.exposure;
    // eslint-disable-next-line react-hooks/immutability
    scene.environmentIntensity = environment.environmentIntensity;
  }, [environment.environmentIntensity, environment.exposure, environment.toneMapping, gl, scene]);

  return (
    <>
      <color attach="background" args={[environment.background]} />
      {environment.fog.enabled && (
        <fog attach="fog" args={[environment.fog.color, environment.fog.near, environment.fog.far]} />
      )}
    </>
  );
}
