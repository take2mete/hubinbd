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

type MountedPlacement = { wrapper: HTMLElement; style: HTMLStyleElement };

function appendAdsterraCode(container: HTMLElement, code: string) {
  const template = document.createElement("template");
  template.innerHTML = code;

  const activateScripts = (parent: Node) => {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SCRIPT") {
        const original = node as HTMLScriptElement;
        const script = document.createElement("script");
        for (const attribute of Array.from(original.attributes)) script.setAttribute(attribute.name, attribute.value);
        script.textContent = original.textContent;
        original.replaceWith(script);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        activateScripts(node);
      }
    }
  };

  activateScripts(template.content);
  container.appendChild(template.content);
}

function mountPlacement(anchor: Element, item: Placement, insertAfter?: Element | null): MountedPlacement | null {
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
    const adContent = document.createElement("div");
    adContent.className = "hubinbd-placement-content";
    adContent.setAttribute("aria-label", item.title || "Advertisement");
    adContent.style.cssText = `display:block;width:100%;min-height:${height}px;overflow:visible;background:transparent`;
    wrapper.appendChild(adContent);
  } else {
    style.remove();
    return null;
  }

  if (item.position === "before-footer") {
    anchor.parentElement?.insertBefore(wrapper, anchor);
  } else if (insertAfter?.parentElement) {
    insertAfter.insertAdjacentElement("afterend", wrapper);
  } else {
    anchor.insertAdjacentElement("afterend", wrapper);
  }

  if (item.content_type !== "image" && item.ad_code) {
    const content = wrapper.querySelector<HTMLElement>(".hubinbd-placement-content");
    if (content) appendAdsterraCode(content, item.ad_code);
  }
  return { wrapper, style };
}

export default function AdPlacementRenderer() {
  useEffect(() => {
    let active = true;
    let observer: MutationObserver | undefined;
    let rendered: MountedPlacement[] = [];
    let lastPath = "";
    let placements: Placement[] = [];

    const clear = () => {
      rendered.forEach(({ wrapper, style }) => { wrapper.remove(); style.remove(); });
      rendered = [];
    };

    const render = () => {
      if (!active) return;
      const path = window.location.pathname;
      if (path !== lastPath) {
        clear();
        lastPath = path;
      }

      const matched = placements.filter((item) => item.page_path === "*" || item.page_path === path);
      for (const position of ["after-header", "middle", "before-footer"] as const) {
        const candidates = matched.filter((item) => item.position === position);
        if (!candidates.length) continue;

        const main = document.querySelector("main");
        const middleSections = main
          ? Array.from(main.querySelectorAll(":scope > section, :scope > div > section"))
          : [];
        const middleAnchor = middleSections.length
          ? middleSections[Math.floor(middleSections.length / 2)]
          : main;
        const anchor = position === "after-header"
          ? document.querySelector("[data-site-header], body > header, header")
          : position === "before-footer"
            ? document.querySelector("[data-site-footer], body > footer, footer")
            : middleAnchor;

        if (!anchor) continue;
        let insertionPoint: Element | null = anchor;
        for (const item of candidates) {
          if (rendered.some(({ wrapper }) => wrapper.dataset.placementId === item.id)) continue;
          const result = mountPlacement(anchor, item, position === "before-footer" ? null : insertionPoint);
          if (result) {
            rendered.push(result);
            if (position !== "before-footer") insertionPoint = result.wrapper;
          }
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
