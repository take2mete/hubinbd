"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

type Placement = {
  id: string;
  page_path: string;
  position: "after-header" | "middle" | "before-footer";
  title: string;
  ad_code: string;
  content_type?: "adsterra" | "image";
  image_url?: string | null;
  link_url?: string | null;
  width_px?: number;
  height_px?: number;
  max_width_px?: number;
  mobile_width_px?: number;
  mobile_height_px?: number;
  object_fit?: "contain" | "cover" | "fill";
};

function mountPlacement(anchor: Element, item: Placement) {
  const width = Math.min(100, Math.max(10, item.width_px ?? 100));
  const mobileWidth = Math.min(100, Math.max(10, item.mobile_width_px ?? 100));
  const height = Math.min(2000, Math.max(50, item.height_px ?? 120));
  const mobileHeight = Math.min(2000, Math.max(50, item.mobile_height_px ?? 100));
  const maxWidth = Math.min(2400, Math.max(100, item.max_width_px ?? 1200));
  const wrapper = document.createElement("div");
  wrapper.className = "hubinbd-managed-placement";
  wrapper.dataset.placementId = item.id;
  wrapper.style.cssText = `width:${width}%;max-width:${maxWidth}px;margin:20px auto;padding:0 8px;box-sizing:border-box`;

  const style = document.createElement("style");
  style.dataset.placementStyle = item.id;
  style.textContent = `@media(max-width:640px){.hubinbd-managed-placement[data-placement-id="${item.id}"]{width:${mobileWidth}%;}.hubinbd-managed-placement[data-placement-id="${item.id}"] .hubinbd-placement-content{height:${mobileHeight}px!important;}}`;
  document.head.appendChild(style);

  if (item.content_type === "image" && item.image_url) {
    const image = document.createElement("img");
    image.src = item.image_url;
    image.alt = item.title || "HubinBD banner";
    image.loading = "lazy";
    image.decoding = "async";
    image.className = "hubinbd-placement-content";
    image.style.cssText = `display:block;width:100%;height:${height}px;object-fit:${item.object_fit || "contain"};border:0;border-radius:8px`;
    if (item.link_url) {
      const link = document.createElement("a");
      link.href = item.link_url;
      link.target = item.link_url.startsWith("http") ? "_blank" : "_self";
      if (link.target === "_blank") link.rel = "noopener noreferrer";
      link.appendChild(image);
      wrapper.appendChild(link);
    } else wrapper.appendChild(image);
  } else if (item.ad_code) {
    const frame = document.createElement("iframe");
    frame.title = item.title || "Advertisement";
    frame.setAttribute("sandbox", "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms");
    frame.setAttribute("loading", "lazy");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.className = "hubinbd-placement-content";
    frame.style.cssText = `display:block;width:100%;height:${height}px;border:0;overflow:hidden;background:transparent`;
    const safeTitle = (item.title || "Advertisement").replace(/[<>&"]/g, "");
    frame.srcdoc = "<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden}body{display:flex;justify-content:center;align-items:center}img{max-width:100%;height:auto}</style></head><body><div aria-label='" + safeTitle + "'>" + item.ad_code + "</div></body></html>";
    wrapper.appendChild(frame);
  } else {
    style.remove();
    return null;
  }
  if (item.position === "before-footer") anchor.parentElement?.insertBefore(wrapper, anchor);
  else anchor.insertAdjacentElement("afterend", wrapper);
  return { wrapper, style };
}

export default function AdPlacementRenderer() {
  useEffect(() => {
    let active = true;
    let observer: MutationObserver | undefined;
    let rendered: Array<{ wrapper: HTMLElement; style: HTMLStyleElement }> = [];
    let lastPath = "";
    let placements: Placement[] = [];

    const clear = () => {
      rendered.forEach(({ wrapper, style }) => { wrapper.remove(); style.remove(); });
      rendered = [];
    };

    const render = () => {
      if (!active) return;
      const path = window.location.pathname;
      if (path !== lastPath) { clear(); lastPath = path; }
      if (rendered.length) return;
      const matched = placements.filter((item) => item.page_path === "*" || item.page_path === path);
      for (const position of ["after-header", "middle", "before-footer"] as const) {
        const candidates = matched.filter((item) => item.position === position);
        if (!candidates.length) continue;
        const anchor = position === "after-header"
          ? document.querySelector("body > header, body header")
          : position === "before-footer"
            ? document.querySelector("body footer, footer")
            : document.querySelector("main > section, main > div > section, main section");
        if (!anchor) continue;
        for (const item of candidates) {
          const result = mountPlacement(anchor, item);
          if (result) rendered.push(result);
        }
      }
    };

    const load = async () => {
      const { data, error } = await supabase.from("ad_placements")
        .select("id,page_path,position,title,ad_code,content_type,image_url,link_url,width_px,height_px,max_width_px,mobile_width_px,mobile_height_px,object_fit")
        .eq("enabled", true);
      if (!active || error || !data) return;
      placements = data as Placement[];
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
      clear();
    };
  }, []);
  return null;
}
