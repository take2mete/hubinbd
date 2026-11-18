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
    let activationId: number | undefined;

    const activateAfterLoad = () => {
      if (activationId !== undefined) window.clearTimeout(activationId);
      activationId = window.setTimeout(() => {
        if (!cancelled) setReady(true);
      }, 4000);
    };

    if (document.readyState === "complete") {
      activateAfterLoad();
    } else {
      window.addEventListener("load", activateAfterLoad, { once: true });
    }

    // Keep ads available even if the load event is delayed by a third-party resource.
    const fallbackId = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 12000);

    return () => {
      cancelled = true;
      window.removeEventListener("load", activateAfterLoad);
      if (activationId !== undefined) window.clearTimeout(activationId);
      if (fallbackId !== undefined) window.clearTimeout(fallbackId);
    };
  }, []);

  return ready ? <AdPlacementRenderer /> : null;
}
