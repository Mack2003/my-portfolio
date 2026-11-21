import { defaultScenePlacements } from "../deskSceneLayout";
import { assetRegistry } from "../registry/assetRegistry";
import type { CameraView, SceneCameraStop, SceneConfiguration } from "./sceneTypes";

export const defaultCameraStops: SceneCameraStop[] = [
  {
    progress: 0,
    view: "overview",
    position: [0, 2, 4.7],
    target: [0, 1.1, -1.2],
  },
  {
    progress: 0.3,
    view: "wall",
    position: [2.6, 1.5, 0.4],
    target: [-16.9, 1.2, -3.1],
  },
  {
    progress: 0.56,
    view: "violin",
    position: [1.5, 1.3, 2],
    target: [0, 1.05, -1.1],
  },
  {
    progress: 0.78,
    view: "laptop",
    position: [1.7, 2.2, -0.45],
    target: [1.9, 1.75, -2.15],
  },
  {
    progress: 1,
    view: "screen",
    position: [1.8, 2.4, -1.45],
    target: [1.8, 1.65, -3.55],
  },
];

export const cameraProgress: Record<CameraView, number> = {
  overview: 0,
  wall: 0.3,
  violin: 0.56,
  laptop: 0.78,
  screen: 1,
};

const objectDefinitions = [
  { id: "room", assetId: "empty-room", name: "Room" },
  { id: "desk", assetId: "desk", name: "Desk" },
  { id: "laptop", assetId: "laptop", name: "Laptop" },
  { id: "plant", assetId: "plant", name: "Plant" },
  { id: "violin", assetId: "violen-with-bow", name: "Violin and bow" },
  { id: "bookshelf", assetId: "delux-book-helf", name: "Deluxe bookshelf" },
  { id: "officeChair", assetId: "office-chair", name: "Office chair" },
  {
    id: "vitest3dLogo",
    assetId: "skills-icons-vitest-3d-logo",
    name: "Vitest 3D",
  },
  {
    id: "visualStudioCode",
    assetId: "skills-icons-visual-studio-code",
    name: "Visual Studio Code",
  },
  {
    id: "typescriptLogo",
    assetId: "skills-icons-typescript-logo",
    name: "TypeScript",
  },
  {
    id: "reactLogoCircle",
    assetId: "skills-icons-react-logo-circle",
    name: "React",
  },
  {
    id: "javascriptLogo",
    assetId: "skills-icons-javascript-logo",
    name: "JavaScript",
  },
  {
    id: "githubKitten",
    assetId: "skills-icons-github-kitten",
    name: "GitHub",
  },
  { id: "awsLogo", assetId: "skills-icons-aws-logo", name: "AWS" },
  {
    id: "androidBug",
    assetId: "skills-icons-android-bug",
    name: "Android",
  },
] as const;

export const defaultSceneConfiguration: SceneConfiguration = {
  id: "main-portfolio-scene",
  name: "Malay Portfolio Desk",
  version: 1,
  enabled: true,
  objects: objectDefinitions.map(({ id, assetId, name }) => {
    const placement = defaultScenePlacements[id];
    if (!placement || !assetRegistry.some((asset) => asset.id === assetId)) {
      throw new Error(`Missing default placement or model asset for "${id}".`);
    }

    return {
      id,
      assetId,
      name,
      enabled: true,
      visible: true,
      castShadow: false,
      receiveShadow: false,
      transform: {
        position: [...placement.position],
        rotation: [...placement.rotation],
        scale: [...placement.scale],
      },
    };
  }),
  lights: [
    {
      id: "ambient-light",
      name: "Ambient Light",
      type: "ambient",
      enabled: true,
      visible: true,
      color: "#ffffff",
      intensity: 1.5,
    },
    {
      id: "hemisphere-light",
      name: "Hemisphere Light",
      type: "hemisphere",
      enabled: true,
      visible: true,
      color: "#dce8ff",
      groundColor: "#453b39",
      intensity: 2,
    },
    {
      id: "directional-light",
      name: "Directional Light",
      type: "directional",
      enabled: true,
      visible: true,
      color: "#ffffff",
      intensity: 3,
      position: [-4, 9, 6],
      target: [0, 0, 0],
      shadows: false,
    },
  ],
  environment: {
    background: "#11152f",
    environmentIntensity: 1,
    shadows: false,
    fog: {
      enabled: false,
      color: "#11152f",
      near: 4,
      far: 30,
    },
    toneMapping: "none",
    exposure: 1,
    pixelRatioCap: 1.5,
  },
  cameraStops: defaultCameraStops,
};

export function copyDefaultSceneConfiguration(): SceneConfiguration {
  return structuredClone(defaultSceneConfiguration);
}
