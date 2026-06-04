"use client";

import { useEffect } from "react";
import {
  PWA_PENDING_RELOAD_KEY,
  PWA_RELOADING_KEY,
  isSolveScreenActive,
} from "@/lib/pwa-update";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

function promptWaitingWorker(worker: ServiceWorker) {
  worker.postMessage({ type: "SKIP_WAITING" });
}

function attachUpdateListener(reg: ServiceWorkerRegistration) {
  reg.addEventListener("updatefound", () => {
    const installing = reg.installing;
    if (!installing) return;

    installing.addEventListener("statechange", () => {
      if (
        installing.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        promptWaitingWorker(installing);
      }
    });
  });

  if (reg.waiting && navigator.serviceWorker.controller) {
    promptWaitingWorker(reg.waiting);
  }
}

function reloadForNewController() {
  if (sessionStorage.getItem(PWA_RELOADING_KEY) === "1") return;

  if (isSolveScreenActive()) {
    sessionStorage.setItem(PWA_PENDING_RELOAD_KEY, "1");
    return;
  }

  sessionStorage.removeItem(PWA_PENDING_RELOAD_KEY);
  sessionStorage.setItem(PWA_RELOADING_KEY, "1");
  window.location.reload();
}

export default function PwaAutoUpdate() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let intervalId: number | undefined;

    async function checkForUpdates() {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;
        await reg.update();
        if (reg.waiting && navigator.serviceWorker.controller) {
          promptWaitingWorker(reg.waiting);
        }
      } catch {
        /* 오프라인·미지원 환경 */
      }
    }

    function onControllerChange() {
      reloadForNewController();
    }

    void navigator.serviceWorker.ready.then((reg) => {
      attachUpdateListener(reg);
      void checkForUpdates();
    });

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void checkForUpdates();
      }
    };

    window.addEventListener("focus", checkForUpdates);
    document.addEventListener("visibilitychange", onVisible);
    intervalId = window.setInterval(() => {
      void checkForUpdates();
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      window.removeEventListener("focus", checkForUpdates);
      document.removeEventListener("visibilitychange", onVisible);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, []);

  return null;
}
