"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimationClip, AnimationMixer, Box3, Color, Group, Mesh, MeshStandardMaterial, Texture, Vector3, LoopOnce, LoopRepeat, type Material, type Object3D } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { ModelAsset } from "../registry/assetTypes";
import type { SceneObjectInstance } from "../config/sceneTypes";
import { FrontSide, BackSide, DoubleSide } from "three";
import { applyPresetAnimation } from "../animations";

type MaterialWithMaps = Material & {
  map?: Texture | null;
  normalMap?: Texture | null;
  roughnessMap?: Texture | null;
  metalnessMap?: Texture | null;
  aoMap?: Texture | null;
  alphaMap?: Texture | null;
  emissiveMap?: Texture | null;
  color?: Color;
};

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

          const applyMat = (origMat: Material): MeshStandardMaterial => {
            const orig = origMat as MaterialWithMaps;
            const preserve = Boolean(
              instance.material!.preserveTextureAndColor ??
              instance.material!.preserveOriginalTexture ??
              instance.material!.selfGlow,
            );
            const origMap = preserve && orig.map ? orig.map : (instance.material!.emissiveMapFromBase && orig.map ? orig.map : null);
            const origNormalMap = preserve && orig.normalMap ? orig.normalMap : null;
            const origRoughnessMap = preserve && orig.roughnessMap ? orig.roughnessMap : null;
            const origMetalnessMap = preserve && orig.metalnessMap ? orig.metalnessMap : null;
            const origAoMap = preserve && orig.aoMap ? orig.aoMap : null;
            const origAlphaMap = preserve && orig.alphaMap ? orig.alphaMap : null;

            // If the mesh has a base texture (material.map), assign that same texture to material.emissiveMap
            // so the surface details remain visible and glow naturally rather than washing out.
            const useBaseAsEmissive = Boolean(
              instance.material!.emissiveMapFromBase ?? (instance.material!.selfGlow || instance.material!.emissiveIntensity > 0),
            );
            const origEmissiveMap = orig.emissiveMap ?? (useBaseAsEmissive && orig.map ? orig.map : null);

            let color = instance.material!.color;
            if (
              preserve &&
              (!color || color.toLowerCase() === "#ffffff") &&
              orig.color &&
              typeof orig.color.getHexString === "function" &&
              !origMap
            ) {
              color = `#${orig.color.getHexString()}`;
            }

            const emissiveColor = instance.material!.selfGlow
              ? (instance.material!.emissive && instance.material!.emissive !== "#000000"
                ? instance.material!.emissive
                : (color && color.toLowerCase() !== "#ffffff" ? color : (orig.color ? `#${orig.color.getHexString()}` : "#ffffff")))
              : (instance.material!.emissive ?? "#000000");

            const emissiveIntensity = instance.material!.selfGlow
              ? (instance.material!.emissiveIntensity > 0 ? instance.material!.emissiveIntensity : 1.5)
              : (instance.material!.emissiveIntensity ?? 0);

            const converted = new MeshStandardMaterial({
              color: color ?? "#ffffff",
              map: origMap,
              normalMap: origNormalMap,
              roughnessMap: origRoughnessMap,
              metalnessMap: origMetalnessMap,
              aoMap: origAoMap,
              alphaMap: origAlphaMap,
              emissiveMap: origEmissiveMap,
              roughness: instance.material!.roughness,
              metalness: instance.material!.metalness,
              emissive: emissiveColor,
              emissiveIntensity: emissiveIntensity,
              transparent:
                instance.material!.transparent || (preserve && Boolean(orig.transparent)),
              opacity: instance.material!.opacity,
              wireframe: instance.material!.wireframe,
              side,
            });
            converted.needsUpdate = true;
            return converted;
          };

          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(applyMat);
          } else {
            mesh.material = applyMat(mesh.material);
          }
        }
      }
    });
    clone.updateMatrixWorld(true);
    return clone;
  }, [instance.castShadow, instance.receiveShadow, instance.material, source, width]);

  const groupRef = useRef<Group>(null);
  const basePosition = useRef(new Vector3(...instance.transform.position));
  const baseRotation = useRef(
    new Vector3(
      (instance.transform.rotation[0] * Math.PI) / 180,
      (instance.transform.rotation[1] * Math.PI) / 180,
      (instance.transform.rotation[2] * Math.PI) / 180,
    ),
  );
  const wasPresetActive = useRef(false);
  const mixerRef = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      mixerRef.current = null;
    };
  }, [model]);

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
    basePosition.current.set(...instance.transform.position);
    baseRotation.current.set(
      (instance.transform.rotation[0] * Math.PI) / 180,
      (instance.transform.rotation[1] * Math.PI) / 180,
      (instance.transform.rotation[2] * Math.PI) / 180,
    );
    const group = groupRef.current;
    if (group) {
      group.position.set(...instance.transform.position);
      group.rotation.set(
        (instance.transform.rotation[0] * Math.PI) / 180,
        (instance.transform.rotation[1] * Math.PI) / 180,
        (instance.transform.rotation[2] * Math.PI) / 180,
      );
      group.scale.set(...instance.transform.scale);
    }
  }, [instance.transform.position, instance.transform.rotation, instance.transform.scale]);

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

  const sequence = useMemo(
    () => (instance.animations ?? []).filter((anim) => anim.enabledInSequence !== false),
    [instance.animations],
  );
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const sequenceTimer = useRef(0);

  const activeSequenceAnim =
    instance.continueAllAnimationsInLoop && sequence.length > 0
      ? sequence[sequenceIndex % sequence.length]
      : null;

  const activeDefinition =
    activeSequenceAnim ??
    instance.animations?.find(
      (animation) => animation.id === (activeAnimationId ?? instance.defaultAnimationId),
    ) ??
    null;

  const currentDuration = useMemo(() => {
    if (!activeDefinition) return 3;
    if (typeof activeDefinition.duration === "number" && activeDefinition.duration > 0) {
      return activeDefinition.duration;
    }
    if (activeDefinition.type === "embedded" && animations) {
      const clip = animations.find(
        (c) =>
          c.name === activeDefinition.clipName ||
          c.name.trim() === activeDefinition.clipName?.trim(),
      );
      if (clip && clip.duration > 0) {
        const speed =
          typeof activeDefinition.timeScale === "number" && activeDefinition.timeScale > 0
            ? activeDefinition.timeScale
            : 1;
        return clip.duration / speed;
      }
    }
    return 3;
  }, [activeDefinition, animations]);

  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;

    if (!activeDefinition || activeDefinition.type !== "embedded" || !activeDefinition.clipName) {
      mixer.stopAllAction();
      return;
    }

    const clip = (animations ?? []).find(
      (item) =>
        item.name === activeDefinition.clipName ||
        item.name.trim() === activeDefinition.clipName?.trim(),
    );
    if (!clip) {
      mixer.stopAllAction();
      return;
    }

    mixer.stopAllAction();
    const action = mixer.clipAction(clip, model);
    const speed =
      typeof activeDefinition.timeScale === "number" && !isNaN(activeDefinition.timeScale)
        ? activeDefinition.timeScale
        : 1;

    action.reset();
    action.setEffectiveTimeScale(speed);
    action.setEffectiveWeight(1);
    action.setLoop(
      activeDefinition.loop ? LoopRepeat : LoopOnce,
      activeDefinition.loop ? Infinity : 1,
    );
    action.fadeIn(0.12);
    action.play();

    return () => {
      action.fadeOut(0.12);
    };
  }, [activeDefinition, animations, model]);

  useFrame(({ clock }, delta) => {
    mixerRef.current?.update(delta);

    if (instance.continueAllAnimationsInLoop && sequence.length > 1) {
      sequenceTimer.current += delta;
      if (sequenceTimer.current >= currentDuration) {
        sequenceTimer.current = 0;
        setSequenceIndex((prev) => (prev + 1) % sequence.length);
      }
    } else {
      sequenceTimer.current = 0;
    }

    const group = groupRef.current;
    if (!group) return;

    if (!activeDefinition || activeDefinition.type !== "preset" || !activeDefinition.preset) {
      if (wasPresetActive.current) {
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
        group.scale.set(
          instance.transform.scale[0],
          instance.transform.scale[1],
          instance.transform.scale[2],
        );
        const bowNode = group.getObjectByName("Bow");
        if (bowNode && bowNode.userData.basePosition) {
          const bp = bowNode.userData.basePosition as Vector3;
          const br = bowNode.userData.baseRotation as Vector3;
          bowNode.position.copy(bp);
          bowNode.rotation.set(br.x, br.y, br.z);
        }
        wasPresetActive.current = false;
      }
      return;
    }
    if (activeDefinition.preset !== "bow-swing" && activeDefinition.preset !== "bow-stroke") {
      const bowNode = group.getObjectByName("Bow");
      if (bowNode && bowNode.userData.basePosition) {
        const bp = bowNode.userData.basePosition as Vector3;
        const br = bowNode.userData.baseRotation as Vector3;
        bowNode.position.copy(bp);
        bowNode.rotation.set(br.x, br.y, br.z);
      }
    }
    wasPresetActive.current = true;
    applyPresetAnimation(activeDefinition.preset, {
      group,
      basePosition: basePosition.current,
      baseRotation: baseRotation.current,
      baseScale: instance.transform.scale,
      elapsedTime: clock.elapsedTime,
      timeScale: activeDefinition.timeScale || 1,
      delta,
    });
  });

  return (
    <group
      ref={setObjectRef}
      position={instance.transform.position}
      rotation={rotation}
      scale={instance.transform.scale}
      visible={instance.visible}
    >
      <primitive object={model} />
      {instance.glow?.enabled && (
        <pointLight
          position={[0, instance.glow.offsetY ?? 0, 0]}
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
  return <FittedClone {...props} source={object} animations={object.animations} />;
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
  const baseRotation = useRef(
    new Vector3(
      (instance.transform.rotation[0] * Math.PI) / 180,
      (instance.transform.rotation[1] * Math.PI) / 180,
      (instance.transform.rotation[2] * Math.PI) / 180,
    ),
  );
  const wasPresetActive = useRef(false);
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

  useEffect(() => {
    basePosition.current.set(...instance.transform.position);
    baseRotation.current.set(
      (instance.transform.rotation[0] * Math.PI) / 180,
      (instance.transform.rotation[1] * Math.PI) / 180,
      (instance.transform.rotation[2] * Math.PI) / 180,
    );
    const group = groupRef.current;
    if (group) {
      group.position.set(...instance.transform.position);
      group.rotation.set(
        (instance.transform.rotation[0] * Math.PI) / 180,
        (instance.transform.rotation[1] * Math.PI) / 180,
        (instance.transform.rotation[2] * Math.PI) / 180,
      );
      group.scale.set(...instance.transform.scale);
    }
  }, [instance.transform.position, instance.transform.rotation, instance.transform.scale]);

  const sequence = useMemo(
    () => (instance.animations ?? []).filter((anim) => anim.enabledInSequence !== false),
    [instance.animations],
  );
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const sequenceTimer = useRef(0);

  const activeSequenceAnim =
    instance.continueAllAnimationsInLoop && sequence.length > 0
      ? sequence[sequenceIndex % sequence.length]
      : null;

  const activeDefinition =
    activeSequenceAnim ??
    instance.animations?.find(
      (animation) => animation.id === (activeAnimationId ?? instance.defaultAnimationId),
    ) ??
    null;

  const currentDuration = useMemo(() => {
    if (!activeDefinition) return 3;
    if (typeof activeDefinition.duration === "number" && activeDefinition.duration > 0) {
      return activeDefinition.duration;
    }
    return 3;
  }, [activeDefinition]);

  useFrame(({ clock }, delta) => {
    if (instance.continueAllAnimationsInLoop && sequence.length > 1) {
      sequenceTimer.current += delta;
      if (sequenceTimer.current >= currentDuration) {
        sequenceTimer.current = 0;
        setSequenceIndex((prev) => (prev + 1) % sequence.length);
      }
    } else {
      sequenceTimer.current = 0;
    }

    const group = groupRef.current;
    if (!group) return;

    if (!activeDefinition || activeDefinition.type !== "preset" || !activeDefinition.preset) {
      if (wasPresetActive.current) {
        group.position.set(basePosition.current.x, basePosition.current.y, basePosition.current.z);
        group.rotation.set(baseRotation.current.x, baseRotation.current.y, baseRotation.current.z);
        group.scale.set(instance.transform.scale[0], instance.transform.scale[1], instance.transform.scale[2]);
        wasPresetActive.current = false;
      }
      return;
    }
    wasPresetActive.current = true;
    applyPresetAnimation(activeDefinition.preset, {
      group,
      basePosition: basePosition.current,
      baseRotation: baseRotation.current,
      baseScale: instance.transform.scale,
      elapsedTime: clock.elapsedTime,
      timeScale: activeDefinition.timeScale || 1,
      delta,
    });
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
          emissive={
            material?.selfGlow
              ? (material.emissive && material.emissive !== "#000000"
                ? material.emissive
                : (material.color && material.color !== "#ffffff" ? material.color : "#ffffff"))
              : (material?.emissive ?? "#000000")
          }
          emissiveIntensity={
            material?.selfGlow
              ? (material.emissiveIntensity > 0 ? material.emissiveIntensity : 1.5)
              : (material?.emissiveIntensity ?? 0)
          }
          transparent={material?.transparent ?? false}
          opacity={material?.opacity ?? 1}
          wireframe={material?.wireframe ?? false}
          side={side}
        />
      </mesh>
      {instance.glow?.enabled && (
        <pointLight
          position={[0, instance.glow.offsetY ?? 0, 0]}
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
