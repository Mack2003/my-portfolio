"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Box3, Group, Vector3, type Object3D } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { ModelAsset } from "../registry/assetTypes";
import type { SceneObjectInstance } from "../config/sceneTypes";

function FittedClone({
  source,
  width,
  instance,
  onObjectRef,
  namedObjectNames,
  onNamedObjectRef,
}: {
  source: Object3D;
  width: number;
  instance: SceneObjectInstance;
  onObjectRef: (id: string, object: Group | null) => void;
  namedObjectNames?: readonly string[];
  onNamedObjectRef?: (name: string, object: Object3D | null) => void;
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
        object.castShadow = instance.castShadow;
        object.receiveShadow = instance.receiveShadow;
      }
    });
    clone.updateMatrixWorld(true);
    return clone;
  }, [instance.castShadow, instance.receiveShadow, source, width]);

  const groupRef = useRef<Group>(null);
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

  return (
    <group
      ref={setObjectRef}
      position={instance.transform.position}
      rotation={rotation}
      scale={instance.transform.scale}
      visible={instance.visible}
    >
      <Clone object={model} />
    </group>
  );
}

function GltfObject(props: Omit<Parameters<typeof FittedClone>[0], "source"> & { asset: ModelAsset }) {
  const { scene } = useGLTF(props.asset.path);
  return <FittedClone {...props} source={scene} />;
}

function ObjObject(props: Omit<Parameters<typeof FittedClone>[0], "source"> & { asset: ModelAsset }) {
  const object = useLoader(OBJLoader, props.asset.path);
  return <FittedClone {...props} source={object} />;
}

function FbxObject(props: Omit<Parameters<typeof FittedClone>[0], "source"> & { asset: ModelAsset }) {
  const object = useLoader(FBXLoader, props.asset.path);
  return <FittedClone {...props} source={object} />;
}

export function ConfiguredSceneObject({
  asset,
  instance,
  onObjectRef,
  namedObjectNames,
  onNamedObjectRef,
}: {
  asset: ModelAsset;
  instance: SceneObjectInstance;
  onObjectRef: (id: string, object: Group | null) => void;
  namedObjectNames?: readonly string[];
  onNamedObjectRef?: (name: string, object: Object3D | null) => void;
}) {
  const props = {
    asset,
    instance,
    width: asset.defaultWidth ?? 1,
    onObjectRef,
    namedObjectNames,
    onNamedObjectRef,
  };

  if (asset.format === "glb" || asset.format === "gltf") return <GltfObject {...props} />;
  if (asset.format === "obj") return <ObjObject {...props} />;
  if (asset.format === "fbx") return <FbxObject {...props} />;
  throw new Error(`Unsupported model format "${asset.format}" for ${asset.path}.`);
}
