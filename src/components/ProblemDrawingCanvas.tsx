"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";

export type DrawingTool = "pen" | "eraser";

export const PEN_COLOR_PRESETS = [
  { id: "white", label: "흰색", value: "#f3f4f6" },
  { id: "lime", label: "라임", value: "#84cc16" },
  { id: "red", label: "빨강", value: "#ef4444" },
  { id: "blue", label: "파랑", value: "#3b82f6" },
  { id: "yellow", label: "노랑", value: "#eab308" },
] as const;

export const DEFAULT_PEN_COLOR = PEN_COLOR_PRESETS[0].value;
export const DEFAULT_PEN_WIDTH = 3;
export const ERASER_SIZE = 28;

export type ProblemDrawingCanvasHandle = {
  clear: () => void;
};

type ProblemDrawingCanvasProps = {
  problemId: string;
  className?: string;
  tool?: DrawingTool;
  strokeColor?: string;
  penWidth?: number;
};

const ProblemDrawingCanvas = forwardRef<
  ProblemDrawingCanvasHandle,
  ProblemDrawingCanvasProps
>(function ProblemDrawingCanvas(
  {
    problemId,
    className = "",
    tool = "pen",
    strokeColor = DEFAULT_PEN_COLOR,
    penWidth = DEFAULT_PEN_WIDTH,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const toolRef = useRef(tool);
  const strokeColorRef = useRef(strokeColor);
  const penWidthRef = useRef(penWidth);
  const snapshotsRef = useRef<Map<string, string>>(new Map());
  const activeProblemIdRef = useRef(problemId);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

  useEffect(() => {
    penWidthRef.current = penWidth;
  }, [penWidth]);

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
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    function blockBrowserSelection(e: Event) {
      e.preventDefault();
    }

    function blockTouchScroll(e: TouchEvent) {
      if (e.touches.length > 0) {
        e.preventDefault();
      }
    }

    container.addEventListener("selectstart", blockBrowserSelection);
    container.addEventListener("dragstart", blockBrowserSelection);
    container.addEventListener("contextmenu", blockBrowserSelection);
    container.addEventListener("touchstart", blockTouchScroll, { passive: false });
    container.addEventListener("touchmove", blockTouchScroll, { passive: false });

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
      ctx.beginPath();
      ctx.moveTo(x, y);
      if (toolRef.current === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = ERASER_SIZE;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = strokeColorRef.current;
        ctx.lineWidth = penWidthRef.current;
      }
    }

    function extendStroke(x: number, y: number) {
      if (!drawingRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      ctx.lineTo(x, y);
      ctx.stroke();
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
      e.stopPropagation();
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
      container.removeEventListener("selectstart", blockBrowserSelection);
      container.removeEventListener("dragstart", blockBrowserSelection);
      container.removeEventListener("contextmenu", blockBrowserSelection);
      container.removeEventListener("touchstart", blockTouchScroll);
      container.removeEventListener("touchmove", blockTouchScroll);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [getCtx, persistSnapshot]);

  return (
    <div
      ref={containerRef}
      className={`problem-drawing-surface relative h-full w-full select-none touch-none overscroll-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none cursor-crosshair select-none"
        aria-label="문제 풀이 드로잉 영역"
      />
    </div>
  );
});

export default ProblemDrawingCanvas;
