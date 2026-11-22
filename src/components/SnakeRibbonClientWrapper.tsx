"use client";

import dynamic from "next/dynamic";
import React from "react";

const SnakeRibbonOverlay = dynamic(
  () => import("@/components/SnakeRibbonOverlay"),
  { ssr: false }
);

interface SnakeRibbonClientWrapperProps {
  targetButtonId?: string;
  autoStart?: boolean;
}

export default function SnakeRibbonClientWrapper(props: SnakeRibbonClientWrapperProps) {
  return <SnakeRibbonOverlay {...props} />;
}
