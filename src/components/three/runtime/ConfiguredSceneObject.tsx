"use client";

import { Clone, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { AnimationClip, Box3, Group, Mesh, MeshStandardMaterial, Vector3, LoopOnce, LoopRepeat, type Object3D } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { ModelAsset } from "../registry/assetTypes";
import type { SceneObjectInstance } from "../config/sceneTypes";
import { FrontSide, BackSide, DoubleSide } from "three";

function FittedClone({
  source,
  width,
  instance,
  onObjectRef,
  namedObjectNames,
  onNamedObjectRef,
  animations,
  activeAnimationId,
  onEmbeddedAnimationsDiscovered,
}: {
  source: Object3D;
  width: number;
  instance: SceneObjectInstance;
  onObjectRef: (id: string, object: Group | null) => void;
  namedObjectNames?: readonly string[];
  onNamedObjectRef?: (name: string, object: Object3D | null) => void;
  animations?: AnimationClip[];
  activeAnimationId?: string;
  onEmbeddedAnimationsDiscovered?: (id: string, clipNames: string[]) => void;
}) {
  const model = useMemo(() => {
    const clone = cloneSkeleton(source);
    clone.updateMatrixWorld(true);

    const bounds = new Box3().setFromObject(clone);
    const size = bounds.getSize(new Vector3());
    if (!Number.isFinite(size.x) || size.x <= 0) {
      throw new Error(`Model "${source.name}" has no measurable width.`);
    }

    const scale = width / size.x;
    clone.scale.setScalar(scale);
    clone.position.set(-bounds.getCenter(new Vector3()).x * scale, -bounds.min.y * scale, -bounds.getCenter(new Vector3()).z * scale);
    clone.traverse((object) => {
      if ("isMesh" in object && object.isMesh) {
        const mesh = object as Mesh;
        mesh.castShadow = instance.castShadow;
        mesh.receiveShadow = instance.receiveShadow;
        if (instance.material) {
          const side =
            instance.material.side === "back"
              ? BackSide
              : instance.material.side === "double"
                ? DoubleSide
                : FrontSide;
          mesh.material = new MeshStandardMaterial({
            color: instance.material.color,
            roughness: instance.material.roughness,
            metalness: instance.material.metalness,
            emissive: instance.material.emissive,
            emissiveIntensity: instance.material.emissiveIntensity,
            transparent: instance.material.transparent,
            opacity: instance.material.opacity,
            wireframe: instance.material.wireframe,
            side,
          });
        }
      }
    });
    clone.updateMatrixWorld(true);
    return clone;
  }, [instance.castShadow, instance.receiveShadow, instance.material, source, width]);

  const groupRef = useRef<Group>(null);
  const basePosition = useRef(new Vector3(...instance.transform.position));
  const baseRotation = useRef(new Vector3(
    (instance.transform.rotation[0] * Math.PI) / 180,
    (instance.transform.rotation[1] * Math.PI) / 180,
    (instance.transform.rotation[2] * Math.PI) / 180,
  ));
  const presetMixer = useAnimations(animations ?? [], groupRef);
  const setObjectRef = useCallback(
    (object: Group | null) => {
      groupRef.current = object;
      onObjectRef(instance.id, object);
    },
    [instance.id, onObjectRef],
  );
  const rotation: [number, number, number] = [
    (instance.transform.rotation[0] * Math.PI) / 180,
    (instance.transform.rotation[1] * Math.PI) / 180,
    (instance.transform.rotation[2] * Math.PI) / 180,
  ];

  useEffect(() => {
    if (!namedObjectNames || !onNamedObjectRef) return;

    namedObjectNames.forEach((name) => {
      let match: Object3D | null = null;
      groupRef.current?.traverse((object) => {
        if (!match && object.name === name) match = object;
      });
      onNamedObjectRef(name, match);
    });

    return () => namedObjectNames.forEach((name) => onNamedObjectRef(name, null));
  }, [namedObjectNames, onNamedObjectRef]);

  useEffect(() => {
    if (onEmbeddedAnimationsDiscovered) {
      onEmbeddedAnimationsDiscovered(
        instance.id,
        (animations ?? []).map((clip) => clip.name),
      );
    }
  }, [animations, instance.id, onEmbeddedAnimationsDiscovered]);

  useEffect(() => {
    const selectedId = activeAnimationId ?? instance.defaultAnimationId;
    const definition = instance.animations?.find(
      (animation) => animation.id === selectedId,
    );
    if (!definition || definition.type !== "embedded") {
      Object.values(presetMixer.actions).forEach((action) => action?.stop());
      return;
    }
    const action = presetMixer.actions[definition.clipName ?? ""];
    if (!action) return;
    action
      .reset()
      .setEffectiveTimeScale(definition.timeScale)
      .setLoop(definition.loop ? LoopRepeat : LoopOnce, definition.loop ? Infinity : 1)
      .fadeIn(0.15)
      .play();
    return () => {
      action.fadeOut(0.15);
    };
  }, [activeAnimationId, instance.animations, instance.defaultAnimationId, presetMixer.actions]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const selectedId = activeAnimationId ?? instance.defaultAnimationId;
    const definition = instance.animations?.find(
      (animation) => animation.id === selectedId,
    );
    if (!definition || definition.type !== "preset") {
      group.position.set(
        basePosition.current.x,
        basePosition.current.y,
        basePosition.current.z,
      );
      group.rotation.set(
        baseRotation.current.x,
        baseRotation.current.y,
        baseRotation.current.z,
      );
      return;
    }
    const time = clock.elapsedTime * definition.timeScale;
    if (definition.preset === "pulse") {
      const pulse = 1 + Math.sin(time * 3) * 0.08;
      group.scale.set(instance.transform.scale[0] * pulse, instance.transform.scale[1] * pulse, instance.transform.scale[2] * pulse);
    } else if (definition.preset === "bounce") {
      group.position.set(basePosition.current.x, basePosition.current.y + Math.abs(Math.sin(time * 2.5)) * 0.18, basePosition.current.z);
    } else if (definition.preset === "rotate") {
      group.rotation.set(baseRotation.current.x, baseRotation.current.y + time, baseRotation.current.z);
    } else if (definition.preset === "violin-sway") {
      group.rotation.set(
        baseRotation.current.x,
        baseRotation.current.y + Math.sin(time * 2.2) * 0.08,
        baseRotation.current.z + Math.sin(time * 1.8) * 0.05,
      );
    }
  });

  return (
    <group
      ref={setObjectRef}
      position={instance.transform.position}
      rotation={rotation}
      scale={instance.transform.scale}
      visible={instance.visible}
    >
      <Clone object={model} />
      {instance.glow?.enabled && (
        <pointLight
          color={instance.glow.color}
          intensity={instance.glow.intensity}
          distance={Math.max(1, instance.glow.intensity * 2)}
          decay={2}
        />
      )}
    </group>
  );
}

function GltfObject(props: Omit<Parameters<typeof FittedClone>[0], "source"> & { asset: ModelAsset }) {
  const { scene, animations } = useGLTF(props.asset.path);
  return <FittedClone {...props} source={scene} animations={animations} />;
}

function ObjObject(props: Omit<Parameters<typeof FittedClone>[0], "source"> & { asset: ModelAsset }) {
  const object = useLoader(OBJLoader, props.asset.path);
  return <FittedClone {...props} source={object} />;
}

function FbxObject(props: Omit<Parameters<typeof FittedClone>[0], "source"> & { asset: ModelAsset }) {
  const object = useLoader(FBXLoader, props.asset.path);
  return <FittedClone {...props} source={object} />;
}

function PrimitiveObject({
  instance,
  onObjectRef,
  activeAnimationId,
}: {
  instance: SceneObjectInstance;
  onObjectRef: (id: string, object: Group | null) => void;
  activeAnimationId?: string;
}) {
  const groupRef = useRef<Group>(null);
  const basePosition = useRef(new Vector3(...instance.transform.position));
  const baseRotation = useRef(new Vector3(
    (instance.transform.rotation[0] * Math.PI) / 180,
    (instance.transform.rotation[1] * Math.PI) / 180,
    (instance.transform.rotation[2] * Math.PI) / 180,
  ));
  const setObjectRef = useCallback(
    (object: Group | null) => {
      groupRef.current = object;
      onObjectRef(instance.id, object);
    },
    [instance.id, onObjectRef],
  );
  const rotation: [number, number, number] = [
    (instance.transform.rotation[0] * Math.PI) / 180,
    (instance.transform.rotation[1] * Math.PI) / 180,
    (instance.transform.rotation[2] * Math.PI) / 180,
  ];
  const geometry = instance.geometry;
  const parameters = geometry?.parameters ?? {};
  const material = instance.material;
  const side =
    material?.side === "back"
      ? BackSide
      : material?.side === "double"
        ? DoubleSide
        : FrontSide;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const selectedId = activeAnimationId ?? instance.defaultAnimationId;
    const definition = instance.animations?.find((animation) => animation.id === selectedId);
    if (!definition || definition.type !== "preset") {
      group.position.set(basePosition.current.x, basePosition.current.y, basePosition.current.z);
      group.rotation.set(baseRotation.current.x, baseRotation.current.y, baseRotation.current.z);
      group.scale.set(instance.transform.scale[0], instance.transform.scale[1], instance.transform.scale[2]);
      return;
    }
    const time = clock.elapsedTime * definition.timeScale;
    if (definition.preset === "pulse") {
      const pulse = 1 + Math.sin(time * 3) * 0.08;
      group.scale.set(instance.transform.scale[0] * pulse, instance.transform.scale[1] * pulse, instance.transform.scale[2] * pulse);
    } else if (definition.preset === "bounce") {
      group.position.set(basePosition.current.x, basePosition.current.y + Math.abs(Math.sin(time * 2.5)) * 0.18, basePosition.current.z);
    } else if (definition.preset === "rotate") {
      group.rotation.set(baseRotation.current.x, baseRotation.current.y + time, baseRotation.current.z);
    } else if (definition.preset === "violin-sway") {
      group.rotation.set(baseRotation.current.x, baseRotation.current.y + Math.sin(time * 2.2) * 0.08, baseRotation.current.z + Math.sin(time * 1.8) * 0.05);
    }
  });

  const geometryNode = (() => {
    switch (geometry?.type) {
      case "sphere":
        return <sphereGeometry args={[parameters.radius ?? 0.5, parameters.widthSegments ?? 32, parameters.heightSegments ?? 16]} />;
      case "cylinder":
        return <cylinderGeometry args={[parameters.radiusTop ?? 0.5, parameters.radiusBottom ?? 0.5, parameters.height ?? 1, parameters.radialSegments ?? 32]} />;
      case "plane":
        return <planeGeometry args={[parameters.width ?? 1, parameters.height ?? 1]} />;
      case "cone":
        return <coneGeometry args={[parameters.radius ?? 0.5, parameters.height ?? 1, parameters.radialSegments ?? 32]} />;
      case "torus":
        return <torusGeometry args={[parameters.radius ?? 0.5, parameters.tube ?? 0.15, parameters.radialSegments ?? 16, parameters.tubularSegments ?? 48]} />;
      case "capsule":
        return <capsuleGeometry args={[parameters.radius ?? 0.35, parameters.length ?? 0.8, parameters.capSegments ?? 8, parameters.radialSegments ?? 16]} />;
      case "circle":
        return <circleGeometry args={[parameters.radius ?? 0.5, parameters.segments ?? 32]} />;
      case "ring":
        return <ringGeometry args={[parameters.innerRadius ?? 0.25, parameters.outerRadius ?? 0.5, parameters.thetaSegments ?? 32]} />;
      default:
        return <boxGeometry args={[parameters.width ?? 1, parameters.height ?? 1, parameters.depth ?? 1]} />;
    }
  })();

  useEffect(() => () => onObjectRef(instance.id, null), [instance.id, onObjectRef]);

  return (
    <group
      ref={setObjectRef}
      position={instance.transform.position}
      rotation={rotation}
      scale={instance.transform.scale}
      visible={instance.visible}
    >
      <mesh castShadow={instance.castShadow} receiveShadow={instance.receiveShadow}>
        {geometryNode}
        <meshStandardMaterial
          color={material?.color ?? "#ffffff"}
          roughness={material?.roughness ?? 0.65}
          metalness={material?.metalness ?? 0}
          emissive={material?.emissive ?? "#000000"}
          emissiveIntensity={material?.emissiveIntensity ?? 0}
          transparent={material?.transparent ?? false}
          opacity={material?.opacity ?? 1}
          wireframe={material?.wireframe ?? false}
          side={side}
        />
      </mesh>
      {instance.glow?.enabled && (
        <pointLight
          color={instance.glow.color}
          intensity={instance.glow.intensity}
          distance={Math.max(1, instance.glow.intensity * 2)}
          decay={2}
        />
      )}
    </group>
  );
}

export function ConfiguredSceneObject({
  asset,
  instance,
  onObjectRef,
  namedObjectNames,
  onNamedObjectRef,
  activeAnimationId,
  onEmbeddedAnimationsDiscovered,
}: {
  asset?: ModelAsset;
  instance: SceneObjectInstance;
  onObjectRef: (id: string, object: Group | null) => void;
  namedObjectNames?: readonly string[];
  onNamedObjectRef?: (name: string, object: Object3D | null) => void;
  activeAnimationId?: string;
  onEmbeddedAnimationsDiscovered?: (id: string, clipNames: string[]) => void;
}) {
  if (instance.geometry) {
    return <PrimitiveObject instance={instance} onObjectRef={onObjectRef} activeAnimationId={activeAnimationId} />;
  }
  if (!asset) throw new Error(`Scene object "${instance.name}" has no model asset or primitive geometry.`);
  const props = {
    asset,
    instance,
    width: asset.defaultWidth ?? 1,
    onObjectRef,
    namedObjectNames,
    onNamedObjectRef,
    activeAnimationId,
    onEmbeddedAnimationsDiscovered,
  };
  if (asset.format === "glb" || asset.format === "gltf") return <GltfObject {...props} />;
  if (asset.format === "obj") return <ObjObject {...props} />;
  if (asset.format === "fbx") return <FbxObject {...props} />;
  throw new Error(`Unsupported model format "${asset.format}" for ${asset.path}.`);
}
