"use client";

import { useEffect } from "react";

export default function LegacyInteractions() {
  useEffect(() => {
    const timeouts: number[] = [];

    const menuButton = document.getElementById("mobile-menu-btn");
    const menuToggleHandler = function (this: HTMLElement) {
      const menu = document.getElementById("mobile-menu");
      const icon = document.getElementById("mobile-menu-icon");
      if (!menu) return;

      const isHidden = menu.classList.contains("hidden");
      if (isHidden) {
        menu.classList.remove("hidden");
        this.setAttribute("aria-expanded", "true");
        if (icon) icon.textContent = "close";
      } else {
        menu.classList.add("hidden");
        this.setAttribute("aria-expanded", "false");
        if (icon) icon.textContent = "menu";
      }
    };
    menuButton?.addEventListener("click", menuToggleHandler);

    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
    const mobileNavHandler = () => {
      document.getElementById("mobile-menu")?.classList.add("hidden");
      const icon = document.getElementById("mobile-menu-icon");
      if (icon) icon.textContent = "menu";
      document.getElementById("mobile-menu-btn")?.setAttribute("aria-expanded", "false");
    };
    mobileNavLinks.forEach((link) => link.addEventListener("click", mobileNavHandler));

    // 1. Sticker Click-To-Inspect functionality
    const stickers = document.querySelectorAll(".sticker-chip");
    const stickerText = document.getElementById("sticker-detail-text");
    const stickerBanner = document.getElementById("sticker-banner");
    const stickerHandlers: Array<[Element, EventListener]> = [];

    if (stickers && stickerText && stickerBanner) {
      stickers.forEach((sticker) => {
        const handler: EventListener = () => {
          const detail = sticker.getAttribute("data-proj");
          if (detail) {
            stickerText.textContent = detail;
            stickerBanner.classList.add("border-tertiary");
            timeouts.push(
              window.setTimeout(() => stickerBanner.classList.remove("border-tertiary"), 600),
            );
          }
        };
        sticker.addEventListener("click", handler);
        stickerHandlers.push([sticker, handler]);
      });
    }

    // 2. Copy Email Toast
    const copyBtn = document.getElementById("copy-email-btn");
    const copyText = document.getElementById("copy-email-text");
    const copyHandler: EventListener = () => {
      if (copyBtn && copyText) {
        navigator.clipboard.writeText("malay@ray.dev").then(() => {
          const original = copyText.textContent;
          copyText.textContent = "Copied to Clipboard! ✓";
          copyBtn.classList.add("bg-tertiary-container", "text-on-tertiary-container");
          timeouts.push(
            window.setTimeout(() => {
              copyText.textContent = original;
              copyBtn.classList.remove("bg-tertiary-container", "text-on-tertiary-container");
            }, 2000),
          );
        });
      }
    };
    if (copyBtn && copyText) copyBtn.addEventListener("click", copyHandler);

    return () => {
      menuButton?.removeEventListener("click", menuToggleHandler);
      mobileNavLinks.forEach((link) => link.removeEventListener("click", mobileNavHandler));
      stickerHandlers.forEach(([sticker, handler]) => sticker.removeEventListener("click", handler));
      if (copyBtn && copyText) copyBtn.removeEventListener("click", copyHandler);
      timeouts.forEach(window.clearTimeout);
    };
  }, []);

  return null;
}
