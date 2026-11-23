"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Raycaster, Vector2, type Object3D } from "three";
import type {
  SceneConfiguration,
  SceneInteractionAction,
  SceneObjectInstance,
} from "../config/sceneTypes";
import { backgroundMusic } from "../../../lib/backgroundMusic";

type SceneInteractionControllerProps = {
  configuration: SceneConfiguration;
  editing: boolean;
  objectRefs: { current: Record<string, Object3D | null> };
  onSelectedChange: (id: string) => void;
  onInformation: (title: string, content: string) => void;
  onAnimation: (objectId: string, animation: string, duration: number) => void;
  onFocusObject: (objectId: string, duration: number) => void;
  onEnterCubeView?: (targetObjectId: string, action: SceneInteractionAction) => void;
};

function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

export function SceneInteractionController({
  configuration,
  editing,
  objectRefs,
  onSelectedChange,
  onInformation,
  onAnimation,
  onFocusObject,
  onEnterCubeView,
}: SceneInteractionControllerProps) {
  const { camera, gl, scene } = useThree();
  const raycasterRef = useRef(new Raycaster());
  const pointerRef = useRef(new Vector2());
  const gestureRef = useRef<{ x: number; y: number } | null>(null);
  const audioRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const executionRef = useRef(0);

  useEffect(() => {
    const domElement = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      gestureRef.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: PointerEvent) => {
      const start = gestureRef.current;
      gestureRef.current = null;
      if (!start) return;
      const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (distance > 8) return;

      const rect = domElement.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      const hits = raycasterRef.current.intersectObject(scene, true);
      let ownerId: string | null = null;
      for (const hit of hits) {
        let owner: Object3D | null = hit.object;
        let matchId: string | null = null;
        while (owner) {
          const match = Object.entries(objectRefs.current).find(([, object]) => object === owner);
          if (match) {
            matchId = match[0];
            break;
          }
          owner = owner.parent;
        }
        if (matchId && matchId !== "room" && matchId !== "cube-environment" && matchId !== "giant-cube") {
          ownerId = matchId;
          break;
        }
      }
      if (!ownerId) return;

      const object =
        configuration.objects.find((item) => item.id === ownerId) ??
        configuration.cubeStudio?.objects?.find((item) => item.id === ownerId);
      if (!object || !object.enabled || !object.visible) return;

      if (editing) {
        onSelectedChange(ownerId);
        return;
      }
      if (object.interactions?.enabled) {
        void executeActions(object, object.interactions.actions);
      }
    };

    const executeActions = async (object: SceneObjectInstance, actions: SceneInteractionAction[]) => {
      const execution = ++executionRef.current;
      for (const action of actions) {
        if (execution !== executionRef.current) break;
        try {
          switch (action.type) {
            case "playAudio": {
              const audioId = action.id ?? object.id;
              const previous = audioRef.current.get(audioId);
              if (previous) {
                previous.pause();
                previous.currentTime = 0;
              }
              const audio = new Audio(action.audio);
              audio.volume = action.volume ?? 0.8;
              audio.loop = action.loop ?? false;
              audioRef.current.set(audioId, audio);
              await audio.play();
              break;
            }
            case "stopAudio": {
              const ids = action.id
                ? [action.id]
                : action.targetObjectId
                  ? [action.targetObjectId]
                  : Array.from(audioRef.current.keys());
              ids.forEach((id) => {
                const audio = audioRef.current.get(id);
                if (audio) {
                  audio.pause();
                  audio.currentTime = 0;
                  audioRef.current.delete(id);
                }
              });
              break;
            }
            case "playAnimation":
              onAnimation(
                action.animation === "violin-play" ? "violin" : object.id,
                action.animation,
                action.duration ?? 2,
              );
              break;
            case "openModal":
              onInformation(
                action.title ?? "Scene information",
                action.content ?? action.modal,
              );
              break;
            case "openUrl":
              if (!isSafeUrl(action.url)) break;
              const url = new URL(action.url, window.location.origin);
              if (action.target === "_blank") {
                window.open(url.toString(), "_blank", "noopener,noreferrer");
              } else {
                window.location.assign(url.toString());
              }
              break;
            case "showInformation":
              onInformation(action.title, action.content);
              break;
            case "focusObject": {
              const targetId = action.objectId ?? object.id;
              onFocusObject(targetId, action.duration ?? 1.5);
              break;
            }
            case "enterCubeView": {
              const targetId = action.targetObjectId ?? object.id;
              if (onEnterCubeView) {
                onEnterCubeView(targetId, action);
              } else {
                window.dispatchEvent(
                  new CustomEvent("portfolio:enter-cube-view", {
                    detail: { targetObjectId: targetId, action },
                  }),
                );
              }
              break;
            }
            case "toggleViolinMusic": {
              await backgroundMusic.toggle();
              const targetId = action.targetObjectId ?? object.id;
              onAnimation(targetId, "violin-bow-swing-default", 9999);
              try {
                sessionStorage.setItem("malay-audio-overlay-dismissed", "true");
              } catch {}
              window.dispatchEvent(new CustomEvent("portfolio:dismiss-audio-overlay"));
              break;
            }
            case "customAction":
              window.dispatchEvent(
                new CustomEvent("portfolio:scene-action", {
                  detail: { name: action.name, payload: action.payload, objectId: object.id },
                }),
              );
              break;
          }
        } catch {
          // Keep action failures isolated so later actions can still run.
        }
      }
    };

    domElement.addEventListener("pointerdown", onPointerDown);
    domElement.addEventListener("pointerup", onPointerUp);
    return () => {
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointerup", onPointerUp);
    };
  }, [camera, configuration, editing, gl, onAnimation, onFocusObject, onInformation, onSelectedChange, onEnterCubeView, objectRefs, scene]);

  useEffect(() => () => {
    audioRef.current.forEach((audio) => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    });
    audioRef.current.clear();
  }, []);

  return null;
}
