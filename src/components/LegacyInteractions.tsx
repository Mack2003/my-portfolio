"use client";

import { useEffect } from "react";
import { portfolioData } from "@/data/portfolio";

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
        navigator.clipboard.writeText(portfolioData.personal.email).then(() => {
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

    // 3. Responsive Touch & Mobile Viewport Interactions
    // Desktop devices with mouse/fine pointer use existing CSS hover effects.
    // Touch/mobile/tablet devices trigger animations when active in viewport.
    const isTouchOrCoarse =
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.innerWidth < 1024;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let heroObserver: IntersectionObserver | null = null;
    let aboutObserver: IntersectionObserver | null = null;
    let waveEndHandler: (() => void) | null = null;
    let waveHoverHandler: (() => void) | null = null;
    let heroNameEl: HTMLElement | null = null;
    let waveHandEl: HTMLElement | null = null;

    if (!reducedMotion) {
      // Hero Handshake Wave Observer
      waveHandEl = document.querySelector<HTMLElement>(".hero-wave-hand");
      heroNameEl = document.querySelector<HTMLElement>(".hero-name");
      const heroHeadline = waveHandEl?.closest("h1") || waveHandEl;
      let hasWavedInTopSection = false;

      const triggerWaveOnce = () => {
        if (!waveHandEl) return;
        waveHandEl.classList.remove("is-waving");
        // Force reflow to cleanly restart the 1-cycle wave animation
        void waveHandEl.offsetWidth;
        waveHandEl.classList.add("is-waving");
      };

      waveEndHandler = () => {
        if (waveHandEl) {
          waveHandEl.classList.remove("is-waving");
        }
      };

      waveHandEl?.addEventListener("animationend", waveEndHandler);

      // Desktop hover trigger: wave once on hover
      waveHoverHandler = () => {
        if (!isTouchOrCoarse) {
          triggerWaveOnce();
        }
      };

      heroNameEl?.addEventListener("mouseenter", waveHoverHandler);
      waveHandEl?.addEventListener("mouseenter", waveHoverHandler);

      // Phone / Touch viewport top-section trigger:
      // When that area comes into the viewport top section (upper 45% of screen)
      if (waveHandEl && heroHeadline) {
        heroObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const rect = entry.boundingClientRect;
              const viewportHeight = window.innerHeight;
              const inTopSection = rect.top >= -40 && rect.top <= viewportHeight * 0.45;

              if (entry.isIntersecting && inTopSection) {
                if (isTouchOrCoarse && !hasWavedInTopSection) {
                  hasWavedInTopSection = true;
                  triggerWaveOnce();
                }
              } else if (rect.top > viewportHeight * 0.65 || rect.bottom < -60) {
                // Scrolled out of the top section: allow re-trigger when returning to top
                hasWavedInTopSection = false;
              }
            });
          },
          {
            rootMargin: "0px 0px -55% 0px",
            threshold: [0, 0.1, 0.5, 1.0],
          }
        );
        heroObserver.observe(heroHeadline);
      }

      // About UFO Projection & Spotlight Observer
      const aboutScene = document.querySelector(".about-ufo-scene");
      if (aboutScene) {
        aboutObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                if (isTouchOrCoarse) {
                  aboutScene.classList.add("is-projecting");
                }
              } else if (entry.intersectionRatio < 0.08) {
                // Scrolled significantly out of view: reset
                aboutScene.classList.remove("is-projecting");
              }
            });
          },
          { threshold: [0, 0.08, 0.3, 0.6] }
        );
        aboutObserver.observe(aboutScene);
      }
    }

    return () => {
      menuButton?.removeEventListener("click", menuToggleHandler);
      mobileNavLinks.forEach((link) => link.removeEventListener("click", mobileNavHandler));
      stickerHandlers.forEach(([sticker, handler]) => sticker.removeEventListener("click", handler));
      if (copyBtn && copyText) copyBtn.removeEventListener("click", copyHandler);
      if (waveHandEl && waveEndHandler) waveHandEl.removeEventListener("animationend", waveEndHandler);
      if (heroNameEl && waveHoverHandler) heroNameEl.removeEventListener("mouseenter", waveHoverHandler);
      if (waveHandEl && waveHoverHandler) waveHandEl.removeEventListener("mouseenter", waveHoverHandler);
      heroObserver?.disconnect();
      aboutObserver?.disconnect();
      timeouts.forEach(window.clearTimeout);
    };
  }, []);

  return null;
}
