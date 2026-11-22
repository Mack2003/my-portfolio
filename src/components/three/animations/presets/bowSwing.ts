import { Box3, Vector3, type Object3D } from "three";
import type { PresetAnimationHandler } from "../types";

/**
 * 5-phrase musical voice note keyframes across a normalized cycle (u in [0, 1]).
 *
 * Simulates a classical expressive violin phrase with varied rhythmic note lengths:
 * - Phrase Note 1 [0.00 - 0.34]: Singing sustained down-bow (rich legato voice note)
 * - Phrase Note 2 [0.34 - 0.54]: Expressive up-bow recovery note
 * - Phrase Note 3 [0.54 - 0.68]: Crisp, accented rhythmic staccato note
 * - Phrase Note 4 [0.68 - 0.80]: Quick articulate counter-stroke
 * - Phrase Note 5 [0.80 - 1.00]: Cadence flourish with natural musical breath before loop
 */
interface PhraseKeyframe {
  u: number;
  pos: number;
  rotZ: number;
  rotY: number;
  rotX: number;
  bowY: number;
}

const PHRASE_KEYS: readonly PhraseKeyframe[] = [
  { u: 0.00, pos: -0.82, rotZ:  0.040, rotY: -0.026, rotX:  0.015, bowY:  0.000 },
  { u: 0.34, pos:  0.84, rotZ: -0.046, rotY:  0.034, rotX: -0.020, bowY: -0.012 },
  { u: 0.54, pos: -0.46, rotZ:  0.030, rotY: -0.020, rotX:  0.012, bowY: -0.006 },
  { u: 0.68, pos:  0.64, rotZ: -0.038, rotY:  0.028, rotX: -0.016, bowY: -0.013 },
  { u: 0.80, pos:  0.06, rotZ:  0.016, rotY: -0.012, rotX:  0.008, bowY: -0.004 },
  { u: 0.94, pos: -0.80, rotZ:  0.038, rotY: -0.024, rotX:  0.014, bowY: -0.008 },
  { u: 1.00, pos: -0.82, rotZ:  0.040, rotY: -0.026, rotX:  0.015, bowY:  0.000 },
];

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function sampleMusicalPhrase(u: number, time: number) {
  const normU = ((u % 1) + 1) % 1;
  let i = 0;
  while (i < PHRASE_KEYS.length - 1 && PHRASE_KEYS[i + 1].u < normU) {
    i++;
  }
  const k0 = PHRASE_KEYS[i];
  const k1 = PHRASE_KEYS[Math.min(i + 1, PHRASE_KEYS.length - 1)];
  const span = k1.u - k0.u;
  const factor = span > 0 ? smoothstep(k0.u, k1.u, normU) : 0;

  let pos = k0.pos + (k1.pos - k0.pos) * factor;
  let rotZ = k0.rotZ + (k1.rotZ - k0.rotZ) * factor;
  const rotY = k0.rotY + (k1.rotY - k0.rotY) * factor;
  const rotX = k0.rotX + (k1.rotX - k0.rotX) * factor;
  const bowY = k0.bowY + (k1.bowY - k0.bowY) * factor;

  // Add subtle singing vibrato micro-shimmer on sustained notes
  if ((normU >= 0.08 && normU <= 0.28) || (normU >= 0.82 && normU <= 0.94)) {
    const vib = Math.sin(time * 30) * 0.016;
    pos += vib;
    rotZ += Math.sin(time * 30) * 0.005;
  }

  return { pos, rotZ, rotY, rotX, bowY };
}

/**
 * Expressive violin bow swinging animation preset.
 *
 * If the object contains a child node named "Bow" (as in the violin GLB model),
 * it aligns the bow to the violin strings once and animates the Bow node across the strings
 * with an expressive musical voice note phrasing rhythm and wide stroke amplitude.
 * It also applies a subtle sympathetic musical body sway to the violin group.
 *
 * If applied to an object without a "Bow" child, it swings the entire object
 * along its local axis with the same expressive musical rhythm.
 */
export const bowSwingAnimation: PresetAnimationHandler = ({
  group,
  basePosition,
  baseRotation,
  elapsedTime,
  timeScale,
}) => {
  const time = elapsedTime * (timeScale > 0 ? timeScale : 1);
  const CYCLE_PERIOD = 5.0; // 5 seconds per complete musical phrase cycle
  const phraseU = (time % CYCLE_PERIOD) / CYCLE_PERIOD;
  const { pos: strokeX, rotZ, rotY, rotX, bowY } = sampleMusicalPhrase(phraseU, time);

  const bowNode: Object3D | null = group.getObjectByName("Bow") ?? null;

  if (bowNode) {
    if (!bowNode.userData.initializedBowAlignment) {
      const stringsNode = group.getObjectByName("strings1");
      if (stringsNode) {
        bowNode.updateWorldMatrix(true, true);
        stringsNode.updateWorldMatrix(true, true);
        const bowBounds = new Box3().setFromObject(bowNode);
        const stringsBounds = new Box3().setFromObject(stringsNode);
        const bowCenter = bowBounds.getCenter(new Vector3());
        const stringsCenter = stringsBounds.getCenter(new Vector3());

        const worldDelta = stringsCenter.sub(bowCenter);
        if (bowNode.parent) {
          worldDelta
            .applyQuaternion(bowNode.parent.quaternion.clone().invert())
            .divide(bowNode.parent.scale);
        }
        bowNode.position.add(worldDelta);
        bowNode.updateMatrixWorld(true);
      }

      bowNode.userData.basePosition = bowNode.position.clone();
      bowNode.userData.baseRotation = new Vector3(
        bowNode.rotation.x,
        bowNode.rotation.y,
        bowNode.rotation.z,
      );
      bowNode.userData.initializedBowAlignment = true;
    }

    const basePos = (bowNode.userData.basePosition as Vector3) ?? bowNode.position;
    const baseRot = (bowNode.userData.baseRotation as Vector3) ?? bowNode.rotation;

    // Apply wide stroke across strings and natural tilts
    bowNode.position.set(
      basePos.x + strokeX,
      basePos.y + bowY,
      basePos.z + rotY * 0.15,
    );
    bowNode.rotation.set(
      baseRot.x + rotX,
      baseRot.y + rotY,
      baseRot.z + rotZ,
    );

    // Subtle sympathetic musical body resonance on the violin
    group.rotation.set(
      baseRotation.x + Math.sin(time * 1.6) * 0.012,
      baseRotation.y + Math.cos(time * 1.3) * 0.015,
      baseRotation.z + Math.sin(time * 0.9) * 0.01,
    );
  } else {
    // Standalone object swinging with musical voice note phrasing
    group.position.set(
      basePosition.x + strokeX,
      basePosition.y + bowY,
      basePosition.z,
    );
    group.rotation.set(
      baseRotation.x + rotX,
      baseRotation.y + rotY,
      baseRotation.z + rotZ,
    );
  }
};
