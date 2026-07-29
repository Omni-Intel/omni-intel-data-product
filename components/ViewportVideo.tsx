"use client";

import { useEffect, useRef } from "react";

type ViewportVideoProps = {
  className?: string;
  controls?: boolean;
  label: string;
};

export function ViewportVideo({ className, controls = false, label }: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let sourcesLoaded = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

    const loadSources = () => {
      if (sourcesLoaded) return;
      video.querySelectorAll<HTMLSourceElement>("source[data-src]").forEach((source) => {
        source.src = source.dataset.src ?? "";
      });
      video.load();
      sourcesLoaded = true;
    };

    const loadObserver = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      loadSources();
      loadObserver.disconnect();
    }, { rootMargin: "600px 0px" });

    const playbackObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      if (entry.isIntersecting && entry.intersectionRatio >= 0.4 && !reducedMotion && !saveData) {
        loadSources();
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { threshold: [0, 0.4, 1] });

    loadObserver.observe(video);
    playbackObserver.observe(video);

    return () => {
      loadObserver.disconnect();
      playbackObserver.disconnect();
      video.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      aria-label={label}
      controls={controls}
      loop
      muted
      playsInline
      preload="none"
      poster="/emg-collection-poster.webp"
    >
      <source data-src="/emg-collection.webm" type="video/webm; codecs=vp9" />
      <source data-src="/emg-collection.mp4" type="video/mp4" />
    </video>
  );
}
