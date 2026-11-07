import { useEffect, useState } from "react";
// The only place that registers the offline service worker.
export async function setupPwa() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const h = location.hostname;
  let framed = false;
  try { framed = window.self !== window.top; } catch { framed = true; }
  const refuse =
    !import.meta.env.PROD ||
    framed ||
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h === "lovableproject.com" || h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev") ||
    new URLSearchParams(location.search).get("sw") === "off";
  if (refuse) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()));
    return;
  }
  // Updates are manual only (see checkForUpdate); no automatic update checks.
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch { /* offline or unsupported */ }
}

export type UpdateResult = "offline" | "latest" | "updating" | "unsupported";

/** Downloads a new version (if any) without applying it. */
export async function findUpdate(): Promise<ServiceWorker | null | "offline" | "unsupported"> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return "unsupported";
  if (!navigator.onLine) return "offline";
  const reg = await navigator.serviceWorker.getRegistration("/");
  if (!reg) return "unsupported";
  if (reg.waiting) return reg.waiting;
  // Listen before calling update(): its promise can resolve before `installing` is set.
  const found = new Promise<ServiceWorker | null>((res) => {
    if (reg.installing) return res(reg.installing);
    const t = setTimeout(() => res(reg.installing), 8000);
    reg.addEventListener("updatefound", () => { clearTimeout(t); res(reg.installing); }, { once: true });
  });
  try { await reg.update(); } catch { return "offline"; }
  const w = await found;
  if (w) {
    await new Promise<void>((res) => {
      if (w.state === "installed" || w.state === "redundant") return res();
      const t = setTimeout(res, 60000);
      w.addEventListener("statechange", () => {
        if (w.state === "installed" || w.state === "redundant") { clearTimeout(t); res(); }
      });
    });
  }
  return reg.waiting;
}

/** Applies a downloaded version and reloads. Only after the user agrees. */
export function applyUpdate(w: ServiceWorker) {
  navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true });
  w.postMessage({ type: "SKIP_WAITING" });
}

// Called from «تحديث بيانات التطبيق».
export async function checkForUpdate(): Promise<UpdateResult> {
  const r = await findUpdate();
  if (r === "offline" || r === "unsupported") return r;
  if (!r) return "latest";
  applyUpdate(r);
  return "updating";
}

/** Checks once on open; returns the waiting version if one was downloaded. */
export function usePendingUpdate() {
  const [w, set] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    let stop = false;
    navigator.serviceWorker.ready.then(() => findUpdate()).then((r) => { if (!stop && r && typeof r !== "string") set(r); }).catch(() => {});
    return () => { stop = true; };
  }, []);
  return { pending: w, dismiss: () => set(null) };
}

// Ask Android not to clear the app's saved data.
export async function keepDataPersistent() {
  try { if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch { /* unsupported */ }
}

/** True once the offline files (app shell) are saved on the phone. */
export async function isOfflineReady(): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window) || !("serviceWorker" in navigator)) return false;
  if (!navigator.serviceWorker.controller && !(await navigator.serviceWorker.getRegistration("/"))?.active) return false;
  const keys = await caches.keys();
  for (const k of keys.filter((n) => n.includes("precache"))) {
    const c = await caches.open(k);
    if ((await c.keys()).some((r) => new URL(r.url).pathname === "/")) return true;
  }
  return false;
}

export function useOfflineReady() {
  const [ready, set] = useState<boolean | null>(null);
  useEffect(() => {
    let stop = false;
    const tick = async () => { const r = await isOfflineReady(); if (!stop) { set(r); if (!r) setTimeout(tick, 2000); } };
    void tick();
    return () => { stop = true; };
  }, []);
  return ready;
}
