export type SceneObjectId =
  | "room"
  | "desk"
  | "laptop"
  | "plant"
  | "violin"
  | "bookshelf"
  | "officeChair"
  | "vitest3dLogo"
  | "visualStudioCode"
  | "typescriptLogo"
  | "reactLogoCircle"
  | "javascriptLogo"
  | "githubKitten"
  | "awsLogo"
  | "androidBug";
export type TransformMode = "translate" | "rotate" | "scale";
export type VectorTuple = [number, number, number];

export type ScenePlacement = {
  position: VectorTuple;
  rotation: VectorTuple;
  scale: VectorTuple;
};

export type ScenePlacements = Record<SceneObjectId, ScenePlacement>;

// Seed transforms for the versioned scene configuration in config/defaultScene.ts.
export const defaultScenePlacements: ScenePlacements = {
  "room": {
    "position": [
      0,
      0,
      0
    ],
    "rotation": [
      0,
      -90,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "desk": {
    "position": [
      1.4,
      0.33680924933708056,
      -2.55
    ],
    "rotation": [
      0,
      0,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "laptop": {
    "position": [
      1.7943374055672505,
      1.4276956980916684,
      -2.8391305654821655
    ],
    "rotation": [
      0,
      0,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "plant": {
    "position": [
      0.5150641627352065,
      1.4823053142979226,
      -2.8
    ],
    "rotation": [
      0,
      0,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "violin": {
    "position": [
      -2,
      1.13,
      -3.25
    ],
    "rotation": [
      -1,
      -31,
      -66
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "bookshelf": {
    "position": [
      -2.77508776585715,
      0.0954240396727165,
      0.79093974710241
    ],
    "rotation": [
      0,
      0,
      0
    ],
    "scale": [
      0.15,
      0.15,
      0.15
    ]
  },
  "officeChair": {
    "position": [
      2.25109948797576,
      0.1,
      -0.389131411581569
    ],
    "rotation": [
      0,
      -70,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "vitest3dLogo": {
    "position": [
      -0.5844186061504251,
      1.45,
      1.3723563471368208
    ],
    "rotation": [
      0,
      0,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "visualStudioCode": {
    "position": [
      -0.800727506320778,
      1.45,
      0.261312124002399
    ],
    "rotation": [
      0,
      0,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "typescriptLogo": {
    "position": [
      -2.56823574672851,
      1.56696626747815,
      1.55275854306419
    ],
    "rotation": [
      0,
      83,
      0
    ],
    "scale": [
      0.8,
      0.8,
      1.35
    ]
  },
  "reactLogoCircle": {
    "position": [
      -2.67833279422287,
      0.98665213383007,
      1.61947348644007
    ],
    "rotation": [
      0,
      89,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "javascriptLogo": {
    "position": [
      -2.8386012459367,
      2.12926621966168,
      1.51210580228685
    ],
    "rotation": [
      0,
      86,
      0
    ],
    "scale": [
      0.8,
      0.8,
      3.55
    ]
  },
  "githubKitten": {
    "position": [
      -2.63829639176913,
      0.4796434395764,
      0.69935955318535
    ],
    "rotation": [
      0,
      0,
      0
    ],
    "scale": [
      1.5,
      1.5,
      1.5
    ]
  },
  "awsLogo": {
    "position": [
      -2.70329713106772,
      1.55,
      0.769715269211
    ],
    "rotation": [
      0,
      88,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  },
  "androidBug": {
    "position": [
      1.1468514051285517,
      0.9175862835169566,
      -1.5579089908763017
    ],
    "rotation": [
      0,
      0,
      0
    ],
    "scale": [
      1,
      1,
      1
    ]
  }
};