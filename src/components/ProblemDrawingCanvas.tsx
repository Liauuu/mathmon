"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";

export type ProblemDrawingCanvasHandle = {
  clear: () => void;
};

type ProblemDrawingCanvasProps = {
  problemId: string;
  className?: string;
};

const STROKE_COLOR = "#f3f4f6";
const ERASER_SIZE = 28;
const PEN_SIZE = 2.5;

const ProblemDrawingCanvas = forwardRef<
  ProblemDrawingCanvasHandle,
  ProblemDrawingCanvasProps
>(function ProblemDrawingCanvas({ problemId, className = "" }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const toolRef = useRef<"pen" | "eraser">("pen");
  const snapshotsRef = useRef<Map<string, string>>(new Map());
  const activeProblemIdRef = useRef(problemId);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const prev = snapshotsRef.current.get(problemId);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (prev) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = prev;
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }, [problemId]);

  const persistSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    try {
      snapshotsRef.current.set(problemId, canvas.toDataURL("image/png"));
    } catch {
      /* ignore quota errors */
    }
  }, [problemId]);

  const clearCanvas = useCallback(() => {
    const container = containerRef.current;
    const ctx = getCtx();
    if (!container || !ctx) return;
    ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
    snapshotsRef.current.delete(activeProblemIdRef.current);
  }, [getCtx]);

  useImperativeHandle(ref, () => ({ clear: clearCanvas }), [clearCanvas]);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const prevId = activeProblemIdRef.current;
    if (canvas && prevId !== problemId && canvas.width > 0) {
      try {
        snapshotsRef.current.set(prevId, canvas.toDataURL("image/png"));
      } catch {
        /* ignore */
      }
    }
    activeProblemIdRef.current = problemId;
    resizeCanvas();
  }, [problemId, resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastX = 0;
    let lastY = 0;

    function pointFromEvent(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function beginStroke(x: number, y: number) {
      const ctx = getCtx();
      if (!ctx) return;
      drawingRef.current = true;
      lastX = x;
      lastY = y;
      ctx.beginPath();
      ctx.moveTo(x, y);
      if (toolRef.current === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = ERASER_SIZE;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineWidth = PEN_SIZE;
      }
    }

    function extendStroke(x: number, y: number) {
      if (!drawingRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
    }

    function endStroke() {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      const ctx = getCtx();
      if (ctx) ctx.globalCompositeOperation = "source-over";
      persistSnapshot();
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      canvas!.setPointerCapture(e.pointerId);
      const { x, y } = pointFromEvent(e);
      beginStroke(x, y);
    }

    function onPointerMove(e: PointerEvent) {
      if (!drawingRef.current) return;
      e.preventDefault();
      const { x, y } = pointFromEvent(e);
      extendStroke(x, y);
    }

    function onPointerUp(e: PointerEvent) {
      if (!drawingRef.current) return;
      e.preventDefault();
      try {
        canvas!.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      endStroke();
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [getCtx, persistSnapshot]);

  return (
    <div ref={containerRef} className={`relative h-full w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        aria-label="문제 풀이 드로잉 영역"
      />
      <div className="pointer-events-auto absolute left-2 top-2 flex gap-1.5">
        <button
          type="button"
          onClick={() => {
            toolRef.current = "pen";
          }}
          className="rounded-lg border border-[#84cc16]/40 bg-[#111827]/90 px-2.5 py-1 text-xs font-medium text-[#a3e635] shadow-sm backdrop-blur-sm"
        >
          ✏️ 펜
        </button>
        <button
          type="button"
          onClick={() => {
            toolRef.current = "eraser";
          }}
          className="rounded-lg border border-[#84cc16]/25 bg-[#111827]/90 px-2.5 py-1 text-xs font-medium text-gray-300 shadow-sm backdrop-blur-sm"
        >
          🧽 지우개
        </button>
        <button
          type="button"
          onClick={clearCanvas}
          className="rounded-lg border border-red-500/30 bg-[#111827]/90 px-2.5 py-1 text-xs font-medium text-red-300 shadow-sm backdrop-blur-sm"
        >
          전체 지우기
        </button>
      </div>
    </div>
  );
});

export default ProblemDrawingCanvas;
