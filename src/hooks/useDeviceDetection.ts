"use client";

import { useSyncExternalStore } from "react";

export type DeviceType = "desktop" | "tablet" | "mobile";
export type DeviceOrientation = "portrait" | "landscape";

export interface DeviceInfo {
  deviceType: DeviceType;
  orientation: DeviceOrientation;
  isTouch: boolean;
  canHover: boolean;
  hasFinePointer: boolean;
  width: number;
  height: number;
  isMobilePortrait: boolean;
  isTabletPortrait: boolean;
  isLandscape: boolean;
  isReducedMotion: boolean;
  mode: "desktop" | "tablet" | "mobile";
}

export const defaultDeviceInfo: DeviceInfo = {
  deviceType: "desktop",
  orientation: "landscape",
  isTouch: false,
  canHover: true,
  hasFinePointer: true,
  width: 1440,
  height: 900,
  isMobilePortrait: false,
  isTabletPortrait: false,
  isLandscape: true,
  isReducedMotion: false,
  mode: "desktop",
};

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    return defaultDeviceInfo;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width || window.matchMedia("(orientation: portrait)").matches;
  const orientation: DeviceOrientation = isPortrait ? "portrait" : "landscape";

  // Check hardware capabilities
  const canHover = window.matchMedia("(hover: hover)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const isTouch =
    "ontouchstart" in window ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

  // Standard breakpoint detection matching responsive-check skill:
  // Mobile: < 640px, or narrow portrait phone up to 767px without fine pointer
  // Tablet: 640px - 1023px, or touch device under 1024px
  // Desktop: >= 1024px with fine pointer and hover capability
  let deviceType: DeviceType = "desktop";
  if (width < 640 || (isPortrait && width < 768 && (!canHover || isTouch))) {
    deviceType = "mobile";
  } else if (width < 1024 || (isTouch && !hasFinePointer && width < 1200)) {
    deviceType = "tablet";
  } else {
    deviceType = "desktop";
  }

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return {
    deviceType,
    orientation,
    isTouch,
    canHover,
    hasFinePointer,
    width,
    height,
    isMobilePortrait: deviceType === "mobile" && orientation === "portrait",
    isTabletPortrait: deviceType === "tablet" && orientation === "portrait",
    isLandscape: orientation === "landscape",
    isReducedMotion,
    mode: deviceType,
  };
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("resize", callback, { passive: true });
  window.addEventListener("orientationchange", callback, { passive: true });

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const portraitQuery = window.matchMedia("(orientation: portrait)");

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", callback);
    portraitQuery.addEventListener("change", callback);
  } else {
    motionQuery.addListener(callback);
    portraitQuery.addListener(callback);
  }

  return () => {
    window.removeEventListener("resize", callback);
    window.removeEventListener("orientationchange", callback);
    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener("change", callback);
      portraitQuery.removeEventListener("change", callback);
    } else {
      motionQuery.removeListener(callback);
      portraitQuery.removeListener(callback);
    }
  };
}

let cachedSnapshot: DeviceInfo = defaultDeviceInfo;
let lastWidth = 0;
let lastHeight = 0;
let lastOrientation = "";
let lastReducedMotion = false;

function getSnapshot(): DeviceInfo {
  if (typeof window === "undefined") return defaultDeviceInfo;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const portrait = h > w || window.matchMedia("(orientation: portrait)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (
    cachedSnapshot !== defaultDeviceInfo &&
    w === lastWidth &&
    h === lastHeight &&
    (portrait ? "portrait" : "landscape") === lastOrientation &&
    reducedMotion === lastReducedMotion
  ) {
    return cachedSnapshot;
  }

  lastWidth = w;
  lastHeight = h;
  lastOrientation = portrait ? "portrait" : "landscape";
  lastReducedMotion = reducedMotion;
  cachedSnapshot = getDeviceInfo();
  return cachedSnapshot;
}

function getServerSnapshot(): DeviceInfo {
  return defaultDeviceInfo;
}

export function useDeviceDetection(): DeviceInfo {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
