"use client";

import { useEffect } from "react";

export function MotionObserver() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const registeredSections = new WeakSet<HTMLElement>();

    const reveal = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    };

    const standardObserver = new IntersectionObserver(reveal, {
      threshold: 0.08,
      rootMargin: "0px 0px -10% 0px",
    });
    const technicalObserver = new IntersectionObserver(reveal, {
      threshold: 0.12,
      rootMargin: "0px 0px -12% 0px",
    });

    const registerSections = () => {
      document.querySelectorAll<HTMLElement>("[data-motion-section]").forEach((section) => {
        if (registeredSections.has(section)) return;
        registeredSections.add(section);
        if (reducedMotion) {
          section.classList.add("is-revealed");
        } else if (section.dataset.motionSection === "technical") {
          technicalObserver.observe(section);
        } else {
          standardObserver.observe(section);
        }
      });
    };

    registerSections();
    const pageObserver = new MutationObserver(registerSections);
    pageObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      pageObserver.disconnect();
      standardObserver.disconnect();
      technicalObserver.disconnect();
    };
  }, []);

  return null;
}
