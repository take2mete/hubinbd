"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AdPlacementRenderer = dynamic(() => import("@/components/ad-placement-renderer"), {
  ssr: false,
  loading: () => null,
});

export default function DeferredAdPlacementRenderer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const activate = () => {
      if (!cancelled) setReady(true);
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(activate, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(activate, 1200);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return ready ? <AdPlacementRenderer /> : null;
}
