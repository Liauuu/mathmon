/* next-pwa 생성 sw.js 보조 — 클라이언트 SKIP_WAITING 메시지 처리 */
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
