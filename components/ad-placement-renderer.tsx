"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

type Ad = { id: string; page_path: string; position: "after-header" | "middle" | "before-footer"; title: string; ad_code: string };

function mountAd(host: HTMLElement, ad: Ad) {
  const wrapper = document.createElement("div");
  wrapper.className = "hubinbd-ad-placement mx-auto my-5 w-full max-w-7xl px-3 sm:px-5";
  wrapper.dataset.adId = ad.id;
  const frame = document.createElement("iframe");
  frame.title = ad.title || "Advertisement";
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-forms");
  frame.setAttribute("loading", "lazy");
  frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  frame.style.cssText = "display:block;width:100%;min-height:100px;border:0;overflow:hidden;background:transparent";
  const safeTitle = (ad.title || "Advertisement").replace(/[<>&"]/g, "");
  frame.srcdoc = "<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><style>html,body{margin:0;padding:0;width:100%;overflow:hidden}body{display:flex;justify-content:center;align-items:center;min-height:90px}img{max-width:100%;height:auto}</style></head><body><div aria-label='" + safeTitle + "'>" + ad.ad_code + "</div></body></html>";
  wrapper.appendChild(frame);
  host.insertAdjacentElement("afterend", wrapper);
  return wrapper;
}

export default function AdPlacementRenderer() {
  useEffect(() => {
    let active = true;
    let observer: MutationObserver | undefined;
    let rendered: HTMLElement[] = [];
    let lastPath = "";
    let ads: Ad[] = [];

    const render = () => {
      if (!active) return;
      const path = window.location.pathname;
      if (path !== lastPath) {
        rendered.forEach((node) => node.remove());
        rendered = [];
        lastPath = path;
      }
      if (rendered.length) return;
      const matched = ads.filter((ad) => ad.page_path === "*" || ad.page_path === path);
      for (const position of ["after-header", "middle", "before-footer"] as const) {
        const candidates = matched.filter((ad) => ad.position === position);
        if (!candidates.length) continue;
        const anchor = position === "after-header"
          ? document.querySelector("body > header, body header")
          : position === "before-footer"
            ? document.querySelector("body footer, footer")
            : document.querySelector("main > section, main > div > section, main section");
        if (!anchor) continue;
        for (const ad of candidates) rendered.push(mountAd(anchor as HTMLElement, ad));
      }
    };

    const load = async () => {
      const { data, error } = await supabase.from("ad_placements").select("id,page_path,position,title,ad_code").eq("enabled", true);
      if (!active || error || !data) return;
      ads = data as Ad[];
      render();
      observer = new MutationObserver(() => render());
      observer.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("popstate", render);
    };
    void load();
    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("popstate", render);
      rendered.forEach((node) => node.remove());
    };
  }, []);

  return null;
}
