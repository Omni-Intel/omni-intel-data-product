"use client";

import { useEffect, useRef, useState } from "react";

/** Keep the public data overview's styles isolated from the product page. */
export function CollectionDashboard() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(780);

  useEffect(() => {
    let contentHeight = 0;

    function fitFirstScreen() {
      const iframe = frame.current;
      const section = iframe?.closest<HTMLElement>(".product-dashboard");
      if (!iframe || !section || !contentHeight) return;
      const styles = getComputedStyle(section);
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const availableHeight = window.innerHeight - sectionTop - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
      const extraGap = window.matchMedia("(min-width:1001px)").matches
        ? Math.max(0, availableHeight - contentHeight)
        : 0;
      setHeight(Math.max(400, Math.min(3000, Math.ceil(contentHeight + extraGap))));
      iframe.contentWindow?.postMessage({ type: "omni-dashboard-command", action: "spacing", extraGap }, window.location.origin);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const message = event.data;
      if (message?.type === "omni-dashboard-resize" && Number.isFinite(message.height)) {
        contentHeight = message.height;
        fitFirstScreen();
      }
    }
    window.addEventListener("message", onMessage);
    window.addEventListener("resize", fitFirstScreen);
    frame.current?.contentWindow?.postMessage({ type: "omni-dashboard-command", action: "sync" }, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", fitFirstScreen);
    };
  }, []);

  return (
    <section className="product-dashboard" aria-label="采集数据总览">
      <div className="container">
        <iframe
          ref={frame}
          className="product-dashboard__frame"
          src="/dashboard/console.html?embed=1"
          title="采集数据总览"
          scrolling="no"
          onLoad={() => frame.current?.contentWindow?.postMessage({ type: "omni-dashboard-command", action: "sync" }, window.location.origin)}
          style={{ height }}
        />
      </div>
    </section>
  );
}
