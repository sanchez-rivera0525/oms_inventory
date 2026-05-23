"use client";

import { useEffect } from "react";

export default function InventoryBoot() {
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!window.XLSX) await loadScript("/vendor/xlsx.full.min.js");
      if (cancelled || window.__OMS_INVENTORY_BOOTED__) return;
      window.__OMS_INVENTORY_BOOTED__ = true;
      await import("../src/app.js");
    }

    boot().catch((error) => {
      const target = document.querySelector("#selectedContent") || document.body;
      target.innerHTML = `<div class="empty-state">Unable to start inventory console: ${escapeHtml(error.message)}</div>`;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      if (window.XLSX) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
