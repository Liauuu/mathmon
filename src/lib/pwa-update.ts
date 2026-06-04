/** 풀이 중 새로고침 방지 플래그 (sessionStorage) */
export const PWA_SOLVE_ACTIVE_KEY = "mathmon:solve-active";

/** 풀이 종료 후 적용할 대기 중인 업데이트 새로고침 */
export const PWA_PENDING_RELOAD_KEY = "mathmon:pwa-pending-reload";

/** 동일 세션에서 controllerchange 중복 새로고침 방지 */
export const PWA_RELOADING_KEY = "mathmon:pwa-reloading";

export function isSolveScreenActive(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PWA_SOLVE_ACTIVE_KEY) === "1";
}

export function markSolveScreenActive(): void {
  sessionStorage.setItem(PWA_SOLVE_ACTIVE_KEY, "1");
}

export function clearSolveScreenActive(): void {
  sessionStorage.removeItem(PWA_SOLVE_ACTIVE_KEY);
}

export function flushPendingPwaReload(): void {
  if (sessionStorage.getItem(PWA_PENDING_RELOAD_KEY) !== "1") return;
  if (sessionStorage.getItem(PWA_RELOADING_KEY) === "1") return;
  sessionStorage.removeItem(PWA_PENDING_RELOAD_KEY);
  sessionStorage.setItem(PWA_RELOADING_KEY, "1");
  window.location.reload();
}
