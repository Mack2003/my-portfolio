"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * Self-contained Responsive Ribbon-to-Snake Animation Overlay.
 * Stays strictly within its parent container (Hero section) with zero layout thrashing.
 * Features:
 * - Corner-only biting: snake body is guaranteed to stay completely outside the button area.
 * - Dynamic randomized food orb locations on every cycle.
 * - Interactive double-tap / double-click with snake rattle sound.
 * - Concentric circle pulse on head that immediately disappears upon double click.
 * - Smooth off-screen exit trajectory without viewport-edge loops or freezing.
 * - Automatic 5-second cooldown and cycle restart.
 * - IntersectionObserver to pause RAF loop when Hero is scrolled out of view.
 */
/**
 * @param {{
 *   targetButtonId?: string;
 *   autoStart?: boolean;
 *   onBiteComplete?: () => void;
 * }} [props]
 */
export default function SnakeRibbonOverlay({
  targetButtonId = "inspect-project-btn",
  autoStart = true,
  onBiteComplete = () => {},
} = {}) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const isSectionVisibleRef = useRef(true);

  // SVG element direct references to eliminate querySelector in 60fps tick loop
  const bodyPathRef = useRef(null);
  const bellyPathRef = useRef(null);
  const headGroupRef = useRef(null);
  const upperJawRef = useRef(null);
  const lowerJawRef = useRef(null);
  const biteRingRef = useRef(null);
  const headRippleRef = useRef(null);
  const orbRefs = useRef([]);

  // Cached measurements to prevent forced layout reflows in tick loop
  const containerSizeRef = useRef({ w: 1200, h: 700 });
  const cachedTargetRef = useRef(null);
  const lastTapTimeRef = useRef(0);

  // Minimal state for interactive tooltip only (no progress or replay UI)
  const [isAwaitingDoubleTap, setIsAwaitingDoubleTap] = useState(false);
  const [headPos, setHeadPos] = useState({ x: 0, y: 0 });
  const [orbs, setOrbs] = useState([]);

  // Mutable animation engine state
  const simRef = useRef({
    phase: "RIBBON_IDLE", // RIBBON_IDLE | MORPHING | HUNTING_DOTS | CLEARING_BUTTON | HUNTING_BUTTON | BITING | WAITING_FOR_DOUBLE_TAP | RISING | EXITING | COOLDOWN | PAUSED
    timer: 0,
    head: { x: 120, y: 120 },
    angle: 0,
    speed: 2.1,
    slitherPhase: 0,
    history: [],
    targetLength: 170,
    baseThickness: 18,
    roundness: 0,
    featureScale: 0,
    jawAngle: 0,
    digestPulses: [],
    currentOrbIndex: 0,
    bitePoint: null,
    divePhase: 0,
    exitAngle: 0,
  });

  // Inject venom keyframe animation stylesheet once
  useEffect(() => {
    const styleId = "snake-venom-keyframes-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes snakeVenomRhythm {
          0% {
            clip-path: circle(0px at var(--bite-x, 10px) var(--bite-y, 10px));
            opacity: 0.92;
            filter: brightness(1.3);
          }
          28% {
            clip-path: circle(12px at var(--bite-x, 10px) var(--bite-y, 10px));
            opacity: 0.95;
            filter: brightness(1.25);
          }
          55% {
            clip-path: circle(24px at var(--bite-x, 10px) var(--bite-y, 10px));
            opacity: 1;
            filter: brightness(1.2);
          }
          72% {
            clip-path: circle(35px at var(--bite-x, 10px) var(--bite-y, 10px));
            opacity: 1;
            filter: brightness(1.35);
          }
          86% {
            clip-path: circle(180px at var(--bite-x, 10px) var(--bite-y, 10px));
            opacity: 1;
            filter: brightness(1.1);
          }
          100% {
            clip-path: circle(520px at var(--bite-x, 10px) var(--bite-y, 10px));
            opacity: 1;
            filter: brightness(1);
          }
        }
        .snake-venom-rhythm-fill {
          animation: snakeVenomRhythm 1.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Update cached target button position relative to the container
  const updateCachedTarget = useCallback(() => {
    const container = containerRef.current;
    const btn = document.getElementById(targetButtonId);
    if (!container || !btn) {
      cachedTargetRef.current = null;
      return;
    }
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();

    cachedTargetRef.current = {
      left: bRect.left - cRect.left,
      top: bRect.top - cRect.top,
      width: bRect.width,
      height: bRect.height,
    };
  }, [targetButtonId]);

  // Clean up and reset button venom styling
  const resetButtonVenom = useCallback(() => {
    const btn = document.getElementById(targetButtonId);
    if (!btn) return;
    btn.style.removeProperty("--bite-x");
    btn.style.removeProperty("--bite-y");
    btn.style.removeProperty("box-shadow");
    btn.style.removeProperty("border-color");
    btn.style.removeProperty("color");
    const fillLayer = btn.querySelector(".snake-blue-venom-fill");
    if (fillLayer) {
      fillLayer.style.transition = "opacity 0.6s ease";
      fillLayer.style.opacity = "0";
      setTimeout(() => {
        fillLayer.remove();
      }, 650);
    }
  }, [targetButtonId]);

  // Play snake rattle sound
  const playRattleSound = useCallback(() => {
    try {
      const audio = new Audio("/audio/snake_rattle_sound.mp3");
      audio.volume = 0.85;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Snake rattle audio playback note:", err);
        });
      }
    } catch (err) {
      console.warn("Snake rattle audio error:", err);
    }
  }, []);

  // Dismiss snake on double-click or double-tap
  const handleDismissSnake = useCallback(() => {
    if (simRef.current.phase !== "WAITING_FOR_DOUBLE_TAP") return;

    // Immediately hide all pulse circles and wave indicators
    if (headRippleRef.current) {
      headRippleRef.current.style.display = "none";
      headRippleRef.current.style.opacity = "0";
    }
    if (biteRingRef.current) {
      biteRingRef.current.style.display = "none";
      biteRingRef.current.style.opacity = "0";
    }

    playRattleSound();

    simRef.current.phase = "RISING";
    simRef.current.timer = 0;
    simRef.current.bitePoint = null;
    setIsAwaitingDoubleTap(false);
  }, [playRattleSound]);

  // Tap handler supporting both double-tap on touch and double-click on desktop
  const onHeadPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      const now = performance.now();
      if (now - lastTapTimeRef.current < 450) {
        handleDismissSnake();
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;
      }
    },
    [handleDismissSnake]
  );

  const onHeadDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      handleDismissSnake();
    },
    [handleDismissSnake]
  );

  // Generate randomized food dot locations away from the CTA button area
  const generateRandomOrbs = useCallback((w, h, isHorizontal, btnData) => {
    const marginX = Math.max(30, Math.min(65, w * 0.06));
    const marginY = Math.max(30, Math.min(65, h * 0.08));

    // Button exclusion zone
    const bLeft = btnData ? btnData.left - 45 : w * 0.4;
    const bTop = btnData ? btnData.top - 45 : h * 0.7;
    const bRight = btnData ? btnData.left + btnData.width + 45 : w * 0.6;
    const bBottom = btnData ? btnData.top + btnData.height + 45 : h * 0.9;

    const isInsideButtonZone = (x, y) =>
      x >= bLeft && x <= bRight && y >= bTop && y <= bBottom;

    const clampX = (val) => Math.min(w - marginX - 25, Math.max(marginX + 25, val));
    const clampY = (val) => Math.min(h - marginY - 35, Math.max(marginY + 25, val));

    // Quadrant zones with randomized jitter
    const zones = isHorizontal
      ? [
          { xMin: 0.22, xMax: 0.42, yMin: 0.18, yMax: 0.32 }, // Upper mid-left
          { xMin: 0.58, xMax: 0.78, yMin: 0.20, yMax: 0.34 }, // Upper mid-right
          { xMin: 0.72, xMax: 0.88, yMin: 0.42, yMax: 0.58 }, // Mid right
          { xMin: 0.35, xMax: 0.56, yMin: 0.42, yMax: 0.58 }, // Center mid
        ]
      : [
          { xMin: 0.55, xMax: 0.82, yMin: 0.16, yMax: 0.26 }, // Upper right
          { xMin: 0.20, xMax: 0.44, yMin: 0.30, yMax: 0.42 }, // Upper left
          { xMin: 0.58, xMax: 0.82, yMin: 0.46, yMax: 0.58 }, // Mid right
          { xMin: 0.22, xMax: 0.46, yMin: 0.60, yMax: 0.70 }, // Lower left
        ];

    return zones.map((zone, idx) => {
      let x = clampX(w * (zone.xMin + Math.random() * (zone.xMax - zone.xMin)));
      let y = clampY(h * (zone.yMin + Math.random() * (zone.yMax - zone.yMin)));

      // If it accidentally falls into button exclusion zone, nudge it upward
      if (isInsideButtonZone(x, y)) {
        y = Math.max(marginY + 30, bTop - 35);
      }

      return { id: idx + 1, x, y, eaten: false };
    });
  }, []);

  // Reset & initialize simulation geometry based on container bounds
  const initSimulation = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    containerSizeRef.current = { w, h };
    const isHorizontal = w >= 768;

    updateCachedTarget();

    // Safe boundaries ensuring thick snake body never touches container edges
    const marginX = Math.max(28, Math.min(70, w * 0.06));
    const marginY = Math.max(28, Math.min(70, h * 0.08));
    const isSmallPhone = w < 480;

    // Initial ribbon location near upper left
    const startX = marginX + (isHorizontal ? 30 : 15);
    const startY = marginY + (isHorizontal ? 40 : 25);
    const initialLen = isHorizontal ? 175 : isSmallPhone ? 115 : 130;
    const baseThickness = isSmallPhone ? 15 : isHorizontal ? 18 : 16;
    const initialHistory = [];

    for (let d = 0; d <= initialLen; d += 2) {
      initialHistory.push({ x: startX + initialLen - d, y: startY });
    }

    // Generate fresh randomized food orbs on every cycle
    const generatedOrbs = generateRandomOrbs(w, h, isHorizontal, cachedTargetRef.current);

    simRef.current = {
      phase: autoStart ? "RIBBON_IDLE" : "PAUSED",
      timer: 0,
      head: { x: startX + initialLen, y: startY },
      angle: 0,
      speed: 2.1,
      slitherPhase: 0,
      history: initialHistory,
      targetLength: initialLen,
      baseThickness: baseThickness,
      roundness: 0,
      featureScale: 0,
      jawAngle: 0,
      digestPulses: [],
      currentOrbIndex: 0,
      bitePoint: null,
      divePhase: 0,
      exitAngle: 0,
    };

    setOrbs(generatedOrbs);
    setIsAwaitingDoubleTap(false);

    // Reset orb element opacities
    orbRefs.current.forEach((el) => {
      if (el) el.style.opacity = "1";
    });

    // Reset pulse ripples and button styling
    if (headRippleRef.current) {
      headRippleRef.current.style.display = "none";
      headRippleRef.current.style.opacity = "0";
    }
    if (biteRingRef.current) {
      biteRingRef.current.style.display = "none";
      biteRingRef.current.style.opacity = "0";
    }
    resetButtonVenom();
  }, [autoStart, generateRandomOrbs, resetButtonVenom, updateCachedTarget]);

  // Window resize & orientation change handler
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateCachedTarget();
        const container = containerRef.current;
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        containerSizeRef.current = { w, h };
        const marginX = Math.max(28, Math.min(65, w * 0.06));
        const marginY = Math.max(28, Math.min(65, h * 0.08));
        if (simRef.current && simRef.current.head) {
          simRef.current.head.x = Math.max(marginX, Math.min(w - marginX, simRef.current.head.x));
          simRef.current.head.y = Math.max(marginY, Math.min(h - marginY, simRef.current.head.y));
        }
      }, 100);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [updateCachedTarget]);

  // IntersectionObserver to pause the RAF loop when the Hero section is scrolled out of view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isSectionVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Deferred startup so other server/client components paint first
  useEffect(() => {
    const timer = setTimeout(() => {
      initSimulation();
    }, 280);
    return () => clearTimeout(timer);
  }, [initSimulation]);

  // Trigger button venom fill with the distinct slow-ooze then sudden surge rhythm
  const triggerButtonVenom = useCallback(
    (localX, localY) => {
      const btn = document.getElementById(targetButtonId);
      if (!btn) return;

      btn.style.setProperty("--bite-x", `${localX}px`);
      btn.style.setProperty("--bite-y", `${localY}px`);

      let fillLayer = btn.querySelector(".snake-blue-venom-fill");
      if (!fillLayer) {
        fillLayer = document.createElement("span");
        fillLayer.className = "snake-blue-venom-fill";
        Object.assign(fillLayer.style, {
          position: "absolute",
          inset: "0",
          background: "linear-gradient(135deg, #0284c7 0%, #2563eb 55%, #1d4ed8 100%)",
          pointerEvents: "none",
          zIndex: "1",
        });

        // Ensure button content stays visibly above the venom layer
        Array.from(btn.childNodes).forEach((node) => {
          if (node !== fillLayer && node.nodeType === Node.ELEMENT_NODE) {
            node.style.position = "relative";
            node.style.zIndex = "2";
          }
        });

        btn.prepend(fillLayer);
      }

      fillLayer.classList.remove("snake-venom-rhythm-fill");
      requestAnimationFrame(() => {
        fillLayer.classList.add("snake-venom-rhythm-fill");
      });

      btn.style.color = "#ffffff";
      btn.style.borderColor = "#60a5fa";
      btn.style.boxShadow =
        "0 0 25px rgba(37, 99, 235, 0.65), 0 0 45px rgba(56, 189, 248, 0.4)";
    },
    [targetButtonId]
  );

  // 60FPS procedural animation loop with zero forced reflows during scroll
  useEffect(() => {
    let lastTime = performance.now();

    const steerTowards = (current, target, maxTurn) => {
      let diff = target - current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      return current + Math.max(-maxTurn, Math.min(maxTurn, diff));
    };

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Skip tick calculations if the Hero section is scrolled out of view
      if (!isSectionVisibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const sim = simRef.current;
      const { w, h } = containerSizeRef.current;

      if (sim.phase !== "PAUSED") {
        sim.timer += dt;

        // Boundary safety margin preventing curves from ever clipping against box bounds
        const boundMarginX = Math.max(38, w * 0.05) + sim.baseThickness;
        const boundMarginY = Math.max(38, h * 0.06) + sim.baseThickness;

        // --- PHASE 1: Straight Ribbon (0s -> 2.0s) ---
        if (sim.phase === "RIBBON_IDLE") {
          if (sim.timer > 2.0) {
            sim.phase = "MORPHING";
            sim.timer = 0;
          }
        }

        // --- PHASE 2: Rounding Edges, Sprouting Jaws & Wave Slither ---
        else if (sim.phase === "MORPHING") {
          const progress = Math.min(sim.timer / 2.8, 1);
          sim.roundness = progress;
          sim.featureScale = Math.max(0, (progress - 0.3) / 0.7);

          sim.slitherPhase += dt * 4.4;
          const waveOffset = Math.sin(sim.slitherPhase) * 0.45 * progress;
          const moveSpeed = sim.speed * (0.3 + 0.7 * progress);

          sim.head.x += Math.cos(sim.angle + waveOffset) * moveSpeed;
          sim.head.y += Math.sin(sim.angle + waveOffset) * moveSpeed;
          sim.history.unshift({ x: sim.head.x, y: sim.head.y });

          if (progress >= 1) {
            sim.phase = "HUNTING_DOTS";
            sim.timer = 0;
          }
        }

        // --- PHASE 3: Hunting & Eating Energy Orbs ---
        else if (sim.phase === "HUNTING_DOTS") {
          const targetOrb = orbs[sim.currentOrbIndex];

          if (targetOrb) {
            const dx = targetOrb.x - sim.head.x;
            const dy = targetOrb.y - sim.head.y;
            const dist = Math.hypot(dx, dy);
            const desiredAngle = Math.atan2(dy, dx);

            sim.angle = steerTowards(sim.angle, desiredAngle, 0.075);
            sim.slitherPhase += dt * 5.2;

            const weaveAmp = dist < 55 ? 0.22 : 0.55;
            const heading = sim.angle + Math.sin(sim.slitherPhase) * weaveAmp;

            const currentSpeed = 2.6 + sim.currentOrbIndex * 0.2;
            sim.head.x += Math.cos(heading) * currentSpeed;
            sim.head.y += Math.sin(heading) * currentSpeed;
            sim.history.unshift({ x: sim.head.x, y: sim.head.y });

            // Mouth opens wide when closing in on the orb
            sim.jawAngle =
              dist < 80 ? Math.min(36, ((80 - dist) / 80) * 38) : Math.max(0, sim.jawAngle - 2);

            // Eat orb on contact
            if (dist < 22) {
              const orbIdx = sim.currentOrbIndex;
              if (orbRefs.current[orbIdx]) {
                orbRefs.current[orbIdx].style.opacity = "0";
              }
              sim.currentOrbIndex += 1;
              sim.targetLength += 44;
              sim.baseThickness = Math.min(26, sim.baseThickness + 2.2);
              sim.jawAngle = 0;
              sim.digestPulses.push({ distanceTraveled: 0 });
            }
          } else {
            // All orbs consumed: move to staging position to clear body completely from button
            sim.phase = "CLEARING_BUTTON";
            sim.timer = 0;
            sim.divePhase = 0;
            updateCachedTarget();
          }
        }

        // --- PHASE 4: Ensure Body Completely Moves Outside of Button Area ---
        else if (sim.phase === "CLEARING_BUTTON") {
          const btnData = cachedTargetRef.current;
          if (btnData) {
            const bLeft = btnData.left;
            const bTop = btnData.top;
            const bRight = bLeft + btnData.width;
            const bBottom = bTop + btnData.height;

            // Staging waypoint located well outside and above-left of the button
            const stageX = Math.max(35, bLeft - 95);
            const stageY = Math.max(35, bTop - 75);

            const dx = stageX - sim.head.x;
            const dy = stageY - sim.head.y;
            const distToStage = Math.hypot(dx, dy);
            const desiredAngle = Math.atan2(dy, dx);

            sim.angle = steerTowards(sim.angle, desiredAngle, 0.085);
            sim.slitherPhase += dt * 5.4;

            const heading = sim.angle + Math.sin(sim.slitherPhase) * 0.35;
            sim.head.x += Math.cos(heading) * 2.85;
            sim.head.y += Math.sin(heading) * 2.85;
            sim.history.unshift({ x: sim.head.x, y: sim.head.y });

            // Check if any segment of the snake body currently overlaps the button area
            const bodyCrossesButton = sim.history.some(
              (pt) =>
                pt.x >= bLeft - 8 &&
                pt.x <= bRight + 8 &&
                pt.y >= bTop - 8 &&
                pt.y <= bBottom + 8
            );

            // Once the body is completely outside the button and the head reaches the outside staging area:
            if (!bodyCrossesButton && (distToStage < 35 || sim.timer > 3.2)) {
              sim.phase = "HUNTING_BUTTON";
              sim.timer = 0;
              sim.divePhase = 0;
            }
          } else {
            sim.phase = "HUNTING_BUTTON";
            sim.divePhase = 0;
          }
        }

        // --- PHASE 5: Approach Corner from Outside — Body Remains Strictly Outside ---
        else if (sim.phase === "HUNTING_BUTTON") {
          const btnData = cachedTargetRef.current;

          if (btnData) {
            const cornerX = btnData.left;
            const cornerY = btnData.top;
            const bRight = cornerX + btnData.width;
            const bBottom = cornerY + btnData.height;

            // Outside staging point: 32px outside diagonally
            const outsideX = cornerX - 32;
            const outsideY = cornerY - 26;

            // Final bite strike point: just 8px entering the corner edge
            const insideBiteX = cornerX + 8;
            const insideBiteY = cornerY + 8;

            if (sim.divePhase === 0) {
              const dx = outsideX - sim.head.x;
              const dy = outsideY - sim.head.y;
              const dist = Math.hypot(dx, dy);
              const desiredAngle = Math.atan2(dy, dx);

              sim.angle = steerTowards(sim.angle, desiredAngle, 0.095);
              sim.slitherPhase += dt * 5.6;
              const heading = sim.angle + Math.sin(sim.slitherPhase) * 0.28;

              sim.head.x += Math.cos(heading) * 2.9;
              sim.head.y += Math.sin(heading) * 2.9;
              sim.history.unshift({ x: sim.head.x, y: sim.head.y });

              if (dist < 25) {
                sim.divePhase = 1;
              }
            } else {
              // Dive towards corner edge
              const dx = insideBiteX - sim.head.x;
              const dy = insideBiteY - sim.head.y;
              const dist = Math.hypot(dx, dy);
              const desiredAngle = Math.atan2(dy, dx);

              sim.angle = steerTowards(sim.angle, desiredAngle, 0.16);
              sim.jawAngle = Math.min(48, Math.max(20, ((40 - dist) / 40) * 52));

              const approachSpeed = 2.4;
              sim.head.x += Math.cos(sim.angle) * approachSpeed;
              sim.head.y += Math.sin(sim.angle) * approachSpeed;
              sim.history.unshift({ x: sim.head.x, y: sim.head.y });

              // Body collision constraint: keep all body history segments behind head outside button perimeter
              for (let i = 2; i < sim.history.length; i++) {
                const pt = sim.history[i];
                if (pt.x >= cornerX && pt.x <= bRight && pt.y >= cornerY && pt.y <= bBottom) {
                  pt.x = Math.min(pt.x, cornerX - 4);
                  pt.y = Math.min(pt.y, cornerY - 4);
                }
              }

              // Fangs penetrate corner rim
              if (dist <= 6) {
                sim.head.x = insideBiteX;
                sim.head.y = insideBiteY;
                sim.history.unshift({ x: insideBiteX, y: insideBiteY });
                sim.jawAngle = 8;
                sim.phase = "BITING";
                sim.timer = 0;
                sim.bitePoint = { x: insideBiteX, y: insideBiteY };

                triggerButtonVenom(8, 8);
                if (onBiteComplete) onBiteComplete();
              }
            }
          }
        }

        // --- PHASE 6: Venom Spreading (1.55s) ---
        else if (sim.phase === "BITING") {
          sim.slitherPhase += dt * 2.6;
          for (let i = 12; i < sim.history.length; i++) {
            const falloff = Math.min(1, (i - 12) / 32);
            sim.history[i].y += Math.sin(sim.slitherPhase - i * 0.12) * 0.2 * falloff;
          }

          // Maintain body constraint outside of button
          const btnData = cachedTargetRef.current;
          if (btnData) {
            const cornerX = btnData.left;
            const cornerY = btnData.top;
            const bRight = cornerX + btnData.width;
            const bBottom = cornerY + btnData.height;
            for (let i = 2; i < sim.history.length; i++) {
              const pt = sim.history[i];
              if (pt.x >= cornerX && pt.x <= bRight && pt.y >= cornerY && pt.y <= bBottom) {
                pt.x = Math.min(pt.x, cornerX - 4);
                pt.y = Math.min(pt.y, cornerY - 4);
              }
            }
          }

          // When venom color transition completes:
          if (sim.timer >= 1.55) {
            sim.phase = "WAITING_FOR_DOUBLE_TAP";
            sim.timer = 0;
            setIsAwaitingDoubleTap(true);
            setHeadPos({ x: sim.head.x, y: sim.head.y });

            // Display head circle wave ripples
            if (headRippleRef.current) {
              headRippleRef.current.style.display = "inline";
              headRippleRef.current.style.opacity = "1";
            }
          }
        }

        // --- PHASE 7: Awaiting Double-Tap / Double-Click ---
        else if (sim.phase === "WAITING_FOR_DOUBLE_TAP") {
          sim.slitherPhase += dt * 2.0;
          for (let i = 12; i < sim.history.length; i++) {
            const falloff = Math.min(1, (i - 12) / 32);
            sim.history[i].y += Math.sin(sim.slitherPhase - i * 0.12) * 0.18 * falloff;
          }
          const btnData = cachedTargetRef.current;
          if (btnData) {
            const cornerX = btnData.left;
            const cornerY = btnData.top;
            const bRight = cornerX + btnData.width;
            const bBottom = cornerY + btnData.height;
            for (let i = 2; i < sim.history.length; i++) {
              const pt = sim.history[i];
              if (pt.x >= cornerX && pt.x <= bRight && pt.y >= cornerY && pt.y <= bBottom) {
                pt.x = Math.min(pt.x, cornerX - 4);
                pt.y = Math.min(pt.y, cornerY - 4);
              }
            }
          }
        }

        // --- PHASE 8: Snake Rises Up, Rattles & Trembles with Audio ---
        else if (sim.phase === "RISING") {
          const riseProgress = Math.min(sim.timer / 0.85, 1);
          const btnData = cachedTargetRef.current;

          if (btnData) {
            const cornerX = btnData.left;
            const cornerY = btnData.top;
            const targetX = cornerX - 44;
            const targetY = cornerY - 52;

            // Lift head and neck upward away from button
            sim.head.x += (targetX - sim.head.x) * (dt * 4.6);
            sim.head.y += (targetY - sim.head.y) * (dt * 4.6);

            // Rattling vibration
            const rattleShake = Math.sin(sim.timer * 60) * 2.8 * (1 - riseProgress * 0.3);
            sim.head.x += rattleShake * 0.5;
            sim.head.y += rattleShake;

            // Threatening mouth hiss
            sim.jawAngle = 24 + Math.sin(sim.timer * 35) * 8;
            sim.history.unshift({ x: sim.head.x, y: sim.head.y });
          }

          if (riseProgress >= 1) {
            sim.phase = "EXITING";
            sim.timer = 0;
            // Lock in exit direction: diagonally up and toward the right edge
            sim.exitAngle = Math.atan2(-140 - sim.head.y, w + 160 - sim.head.x);
          }
        }

        // --- PHASE 9: Crawls Smoothly Outside the Viewport Without Boundary Loops ---
        else if (sim.phase === "EXITING") {
          sim.timer += dt;
          sim.slitherPhase += dt * 7.5;

          // Steer consistently in the locked exit angle towards the top-right exit
          const heading = sim.exitAngle + Math.sin(sim.slitherPhase) * 0.38;
          const exitSpeed = 6.4;

          sim.head.x += Math.cos(heading) * exitSpeed;
          sim.head.y += Math.sin(heading) * exitSpeed;
          sim.history.unshift({ x: sim.head.x, y: sim.head.y });

          sim.jawAngle = Math.max(2, sim.jawAngle - dt * 20);

          // Verify if the tail has left the container completely
          const tail = sim.history[sim.history.length - 1];
          const isTailOutside =
            tail &&
            (tail.x > w + 20 || tail.x < -20 || tail.y > h + 20 || tail.y < -20);

          if (isTailOutside || sim.timer > 3.2) {
            sim.phase = "COOLDOWN";
            sim.timer = 0;
            sim.history = [];
            resetButtonVenom();

            // Clear paths
            if (bodyPathRef.current) bodyPathRef.current.setAttribute("d", "");
            if (bellyPathRef.current) bellyPathRef.current.setAttribute("d", "");
            if (headGroupRef.current) headGroupRef.current.style.opacity = "0";
          }
        }

        // --- PHASE 10: 5-Second Cooldown & Cycle Repeat ---
        else if (sim.phase === "COOLDOWN") {
          sim.timer += dt;
          if (sim.timer >= 5.0) {
            initSimulation();
          }
        }

        // Boundary repulsion keeping body curves inside box margins (during free navigation)
        if (
          sim.phase !== "HUNTING_BUTTON" &&
          sim.phase !== "BITING" &&
          sim.phase !== "WAITING_FOR_DOUBLE_TAP" &&
          sim.phase !== "RISING" &&
          sim.phase !== "EXITING" &&
          sim.phase !== "COOLDOWN"
        ) {
          if (sim.head.x < boundMarginX) {
            sim.angle = steerTowards(sim.angle, 0, 0.12);
          } else if (sim.head.x > w - boundMarginX) {
            sim.angle = steerTowards(sim.angle, Math.PI, 0.12);
          }
          if (sim.head.y < boundMarginY) {
            sim.angle = steerTowards(sim.angle, Math.PI / 2, 0.12);
          } else if (sim.head.y > h - boundMarginY) {
            sim.angle = steerTowards(sim.angle, -Math.PI / 2, 0.12);
          }
        }

        // Trim history to match target length
        let accumulatedDist = 0;
        let cutIndex = sim.history.length;
        for (let i = 1; i < sim.history.length; i++) {
          const d = Math.hypot(
            sim.history[i].x - sim.history[i - 1].x,
            sim.history[i].y - sim.history[i - 1].y
          );
          accumulatedDist += d;
          if (accumulatedDist >= sim.targetLength) {
            cutIndex = i + 1;
            break;
          }
        }
        if (cutIndex < sim.history.length) {
          sim.history.length = cutIndex;
        }

        // Advance digestion pulses
        sim.digestPulses.forEach((p) => {
          p.distanceTraveled += 3.6;
        });
        sim.digestPulses = sim.digestPulses.filter((p) => p.distanceTraveled < sim.targetLength);
      }

      // Direct DOM attribute updates via cached refs (zero querySelector overhead)
      renderSnakeToDom();
      rafRef.current = requestAnimationFrame(tick);
    };

    const renderSnakeToDom = () => {
      const sim = simRef.current;
      const pts = sim.history;
      if (pts.length < 2) return;

      // Construct smooth spine path
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length - 1; i += 2) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}, ${xc.toFixed(1)} ${yc.toFixed(1)}`;
      }
      const last = pts[pts.length - 1];
      d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

      if (bodyPathRef.current) {
        bodyPathRef.current.setAttribute("d", d);
        bodyPathRef.current.setAttribute("stroke-width", sim.baseThickness.toFixed(1));
        bodyPathRef.current.setAttribute("stroke-linecap", sim.roundness > 0.35 ? "round" : "butt");
      }

      if (bellyPathRef.current) {
        bellyPathRef.current.setAttribute("d", d);
        bellyPathRef.current.setAttribute("stroke-width", (sim.baseThickness * 0.42).toFixed(1));
        bellyPathRef.current.setAttribute("stroke-linecap", sim.roundness > 0.35 ? "round" : "butt");
        bellyPathRef.current.style.opacity = (sim.roundness * 0.55).toFixed(2);
      }

      // Compute head orientation
      const lookIdx = Math.min(5, pts.length - 1);
      const headAngleRad = Math.atan2(pts[0].y - pts[lookIdx].y, pts[0].x - pts[lookIdx].x);
      const headAngleDeg = (headAngleRad * 180) / Math.PI;
      const headScale = sim.featureScale * (sim.baseThickness / 18);

      if (headGroupRef.current) {
        headGroupRef.current.setAttribute(
          "transform",
          `translate(${pts[0].x.toFixed(1)}, ${pts[0].y.toFixed(1)}) rotate(${headAngleDeg.toFixed(
            1
          )}) scale(${headScale.toFixed(2)})`
        );
        headGroupRef.current.style.opacity = sim.featureScale > 0.02 ? "1" : "0";
      }

      // Track head wave ripple position and visibility
      if (headRippleRef.current) {
        if (sim.phase === "WAITING_FOR_DOUBLE_TAP") {
          headRippleRef.current.setAttribute(
            "transform",
            `translate(${pts[0].x.toFixed(1)}, ${pts[0].y.toFixed(1)})`
          );
          headRippleRef.current.style.display = "inline";
          headRippleRef.current.style.opacity = "1";
        } else {
          headRippleRef.current.style.display = "none";
          headRippleRef.current.style.opacity = "0";
        }
      }

      if (upperJawRef.current && lowerJawRef.current) {
        upperJawRef.current.setAttribute("transform", `rotate(${-sim.jawAngle.toFixed(1)})`);
        lowerJawRef.current.setAttribute("transform", `rotate(${sim.jawAngle.toFixed(1)})`);
      }

      // Bite ring visibility
      if (biteRingRef.current) {
        if (sim.bitePoint && sim.phase === "BITING") {
          biteRingRef.current.setAttribute("cx", sim.bitePoint.x);
          biteRingRef.current.setAttribute("cy", sim.bitePoint.y);
          biteRingRef.current.style.display = "inline";
          biteRingRef.current.style.opacity = "1";
        } else {
          biteRingRef.current.style.display = "none";
          biteRingRef.current.style.opacity = "0";
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [orbs, triggerButtonVenom, onBiteComplete, updateCachedTarget, resetButtonVenom, initSimulation]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        overflow: "hidden",
        willChange: "transform",
      }}
      aria-label="Interactive Snake Ribbon Experience"
    >
      {/* Floating Tooltip Prompt: Compact Double Tap Indicator (Positioned clear of snake face) */}
      {isAwaitingDoubleTap && (
        <div
          className="pointer-events-auto absolute z-40 -translate-x-1/2 -translate-y-full cursor-pointer select-none transition-all duration-300"
          style={{
            left: `${Math.max(48, headPos.x)}px`,
            top: `${Math.max(12, headPos.y - 52)}px`,
          }}
          onPointerDown={onHeadPointerDown}
          onDoubleClick={onHeadDoubleClick}
          title="Double tap to dismiss snake"
        >
          <div className="flex items-center gap-1.5 rounded-full border border-sky-400/50 bg-slate-950/90 px-3 py-1 shadow-[0_0_16px_rgba(56,189,248,0.35)] backdrop-blur-md animate-pulse">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-400" />
            </span>
            <span className="font-mono text-[11px] font-bold text-sky-200 tracking-wider uppercase whitespace-nowrap">
              Double tap
            </span>
          </div>
          <div className="mx-auto h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-sky-400/60" />
        </div>
      )}

      {/* Main SVG Layer */}
      <svg
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="ribbonSnakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          <radialGradient id="energyOrbGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
          </radialGradient>

          {/* Generous filter bounds to prevent glow clipping */}
          <filter id="snakeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0284c7" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Energy Dots (Randomized Positions Each Cycle) */}
        {orbs.map((orb, idx) => (
          <g
            key={orb.id}
            ref={(el) => {
              orbRefs.current[idx] = el;
            }}
            transform={`translate(${orb.x}, ${orb.y})`}
            style={{ transition: "opacity 0.25s ease" }}
          >
            <circle r="18" fill="url(#energyOrbGrad)" opacity="0.6">
              <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="5.5" fill="#e0f2fe" />
          </g>
        ))}

        {/* Snake Main Body */}
        <path
          ref={bodyPathRef}
          id="snake-body-path"
          fill="none"
          stroke="url(#ribbonSnakeGrad)"
          strokeWidth="18"
          strokeLinecap="butt"
          strokeLinejoin="round"
          filter="url(#snakeGlow)"
        />

        {/* Dorsal Scale Stripe */}
        <path
          ref={bellyPathRef}
          id="snake-belly-path"
          fill="none"
          stroke="#a7f3d0"
          strokeWidth="7"
          strokeDasharray="10 12"
          strokeLinecap="round"
          opacity="0"
        />

        {/* Bite Impact Ripple Ring */}
        <circle
          ref={biteRingRef}
          id="snake-bite-ring"
          r="16"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          opacity="0"
          style={{ display: "none" }}
        >
          <animate attributeName="r" values="6;32" dur="1.1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.95;0" dur="1.1s" repeatCount="indefinite" />
        </circle>

        {/* Concentric Circle Waves radiating from Snake Head */}
        <g
          ref={headRippleRef}
          id="snake-head-wave-ripples"
          style={{ display: "none", opacity: 0 }}
        >
          <circle cx="0" cy="0" r="14" fill="none" stroke="#38bdf8" strokeWidth="2.5">
            <animate attributeName="r" values="8;54" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.95;0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="14" fill="none" stroke="#0ea5e9" strokeWidth="2">
            <animate attributeName="r" values="8;54" begin="0.55s" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.85;0" begin="0.55s" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="14" fill="none" stroke="#7dd3fc" strokeWidth="1.5">
            <animate attributeName="r" values="8;54" begin="1.1s" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.75;0" begin="1.1s" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Articulated Snake Head (Cranium + Lower/Upper Jaws + Front Two Sharp Fangs + Hit Zone) */}
        <g ref={headGroupRef} id="snake-head-group" opacity="0">
          {/* Lower Jaw */}
          <g ref={lowerJawRef} id="snake-lower-jaw">
            <path d="M -8 2 L 18 4 Q 22 8 15 11 L -8 9 Z" fill="#047857" />
            <polygon points="12,4 14,1 16,4" fill="#ffffff" />
          </g>

          {/* Upper Jaw with Two Prominent Needle Fangs */}
          <g ref={upperJawRef} id="snake-upper-jaw">
            <path d="M -12 -10 C 2 -12, 16 -8, 22 -1 C 17 3, 5 3, -10 1 Z" fill="#10b981" />

            {/* Front Left Fang */}
            <path
              d="M 13 -1 Q 15 5 18 9 Q 16 5 15 -1 Z"
              fill="#ffffff"
              stroke="#38bdf8"
              strokeWidth="0.8"
            />
            {/* Front Right Fang */}
            <path
              d="M 7 -1 Q 9 4 11 8 Q 10 4 9 -1 Z"
              fill="#f8fafc"
              stroke="#38bdf8"
              strokeWidth="0.8"
            />

            {/* Venom droplet on fang tip */}
            <circle cx="17.5" cy="8.5" r="1.2" fill="#38bdf8" />

            {/* Glowing Eye with Slit Pupil */}
            <circle cx="4" cy="-6" r="4" fill="#facc15" />
            <ellipse cx="4.6" cy="-6" rx="1.2" ry="3.2" fill="#090d16" />
            <circle cx="5.2" cy="-7.2" r="1" fill="#ffffff" />
          </g>

          {/* Interactive Hit Area for Direct Tap / Double-Click on Head */}
          <circle
            cx="6"
            cy="0"
            r="36"
            fill="transparent"
            className="pointer-events-auto cursor-pointer"
            onPointerDown={onHeadPointerDown}
            onDoubleClick={onHeadDoubleClick}
            aria-label="Snake Head - Tap twice to move away"
          />
        </g>
      </svg>
    </div>
  );
}
