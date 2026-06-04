"use client";

import type { ReactNode } from "react";
import {
  DEFAULT_PEN_COLOR,
  DEFAULT_PEN_WIDTH,
  PEN_COLOR_PRESETS,
  type DrawingTool,
} from "@/components/ProblemDrawingCanvas";

type DrawingToolbarProps = {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  penWidth: number;
  onPenWidthChange: (width: number) => void;
  onClear: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  layout?: "row" | "column";
};

const TOOL_LABEL: Record<DrawingTool, string> = {
  pen: "펜",
  eraser: "지우개",
};

function ToolModeButton({
  active,
  variant,
  onClick,
  children,
}: {
  active: boolean;
  variant: DrawingTool;
  onClick: () => void;
  children: ReactNode;
}) {
  const isPen = variant === "pen";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${TOOL_LABEL[variant]}${active ? " (선택됨)" : ""}`}
      className={`relative flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all ${
        active
          ? isPen
            ? "border-[#84cc16] bg-[#84cc16] text-[#111827] shadow-lg shadow-[#84cc16]/35"
            : "border-amber-400 bg-amber-500/25 text-amber-50 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50"
          : "border-[#84cc16]/15 bg-[#1f2937]/80 text-gray-500 opacity-75 hover:border-[#84cc16]/35 hover:opacity-100"
      }`}
    >
      {active ? (
        <span
          className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shadow-md ${
            isPen ? "bg-[#111827] text-[#a3e635]" : "bg-amber-400 text-[#111827]"
          }`}
          aria-hidden
        >
          ✓
        </span>
      ) : null}
      <span className="text-sm leading-none">{children}</span>
      {active ? (
        <span
          className={`text-[9px] font-extrabold uppercase tracking-wide ${
            isPen ? "text-[#111827]/80" : "text-amber-200"
          }`}
        >
          선택 중
        </span>
      ) : null}
    </button>
  );
}

export default function DrawingToolbar({
  tool,
  onToolChange,
  strokeColor,
  onStrokeColorChange,
  penWidth,
  onPenWidthChange,
  onClear,
  isFullscreen,
  onToggleFullscreen,
  layout = "row",
}: DrawingToolbarProps) {
  const isRow = layout === "row";
  const rootClass = isRow
    ? "flex flex-wrap items-center gap-2"
    : "flex flex-col items-stretch gap-3";

  const presetActive = (value: string) =>
    strokeColor.toLowerCase() === value.toLowerCase();

  return (
    <div
      className={`shrink-0 rounded-xl border border-[#84cc16]/25 bg-[#111827]/95 p-2.5 shadow-inner ${rootClass}`}
      role="toolbar"
      aria-label="필기 도구"
    >
      <div
        className={`flex flex-col gap-1.5 ${isRow ? "min-w-0" : ""}`}
        role="group"
        aria-label="도구 선택"
      >
        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
          <span>도구</span>
          <span className="rounded-md bg-[#84cc16]/15 px-1.5 py-0.5 text-[#a3e635]">
            {TOOL_LABEL[tool]} 사용 중
          </span>
        </p>
        <div className={`flex gap-1.5 ${isRow ? "" : "flex-col"}`}>
          <ToolModeButton
            active={tool === "pen"}
            variant="pen"
            onClick={() => onToolChange("pen")}
          >
            <span className="flex items-center gap-1">
              ✏️ 펜
              {tool === "pen" ? (
                <span
                  className="inline-block h-3 w-3 rounded-full border border-[#111827]/30"
                  style={{ backgroundColor: strokeColor }}
                  title="현재 펜 색"
                  aria-hidden
                />
              ) : null}
            </span>
          </ToolModeButton>
          <ToolModeButton
            active={tool === "eraser"}
            variant="eraser"
            onClick={() => onToolChange("eraser")}
          >
            🧽 지우개
          </ToolModeButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border-2 border-dashed border-red-500/35 bg-[#111827]/90 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/10"
            aria-label="캔버스 전체 지우기 (일회 실행)"
          >
            🗑️ 전체 지우기
          </button>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 ${isRow ? "border-l border-[#84cc16]/20 pl-2" : "border-t border-[#84cc16]/20 pt-2"} ${tool !== "pen" ? "opacity-50" : ""}`}
        aria-disabled={tool !== "pen"}
      >
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          색상
          {tool !== "pen" ? (
            <span className="ml-1 normal-case text-gray-600">(펜 선택 시)</span>
          ) : null}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {PEN_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.label}
              disabled={tool !== "pen"}
              onClick={() => onStrokeColorChange(preset.value)}
              className={`h-8 w-8 shrink-0 rounded-full border-2 shadow-sm transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 ${
                presetActive(preset.value) && tool === "pen"
                  ? "border-[#a3e635] ring-2 ring-[#84cc16] ring-offset-2 ring-offset-[#111827]"
                  : "border-white/20"
              }`}
              style={{ backgroundColor: preset.value }}
              aria-label={`${preset.label} 펜`}
              aria-pressed={presetActive(preset.value) && tool === "pen"}
            />
          ))}
          <label
            className={`relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${
              !PEN_COLOR_PRESETS.some((p) => presetActive(p.value)) &&
              tool === "pen"
                ? "border-[#a3e635] ring-2 ring-[#84cc16] ring-offset-2 ring-offset-[#111827]"
                : "border-white/20"
            } ${tool !== "pen" ? "pointer-events-none opacity-40" : ""}`}
            title="직접 선택"
          >
            <span className="pointer-events-none text-[10px] font-bold text-white/90">
              +
            </span>
            <input
              type="color"
              value={strokeColor}
              disabled={tool !== "pen"}
              onChange={(e) => onStrokeColorChange(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              aria-label="펜 색상 직접 선택"
            />
          </label>
        </div>
      </div>

      <div
        className={`flex min-w-0 flex-1 items-center gap-2 ${isRow ? "border-l border-[#84cc16]/20 pl-2" : "border-t border-[#84cc16]/20 pt-2"} ${tool !== "pen" ? "opacity-50" : ""}`}
      >
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          굵기
          {tool !== "pen" ? (
            <span className="ml-1 normal-case text-gray-600">(펜 선택 시)</span>
          ) : null}
        </span>
        <input
          type="range"
          min={1}
          max={20}
          step={1}
          value={penWidth}
          disabled={tool !== "pen"}
          onChange={(e) => onPenWidthChange(Number(e.target.value))}
          className="h-2 min-w-[5rem] flex-1 cursor-pointer accent-[#84cc16] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="펜 굵기"
          aria-valuemin={1}
          aria-valuemax={20}
          aria-valuenow={penWidth}
        />
        <span className="w-9 shrink-0 text-right text-xs font-bold tabular-nums text-[#a3e635]">
          {penWidth}px
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleFullscreen}
        className={`shrink-0 rounded-lg border border-[#84cc16]/40 bg-[#1f2937] px-3 py-1.5 text-xs font-bold text-[#a3e635] shadow-sm hover:bg-[#84cc16]/10 ${
          isFullscreen
            ? "border-[#84cc16] bg-[#84cc16]/20 ring-2 ring-[#84cc16]/40"
            : ""
        } ${isRow ? "" : "w-full"}`}
        aria-pressed={isFullscreen}
      >
        {isFullscreen ? "전체화면 종료 ✓" : "전체화면 📺"}
      </button>
    </div>
  );
}

export { DEFAULT_PEN_COLOR, DEFAULT_PEN_WIDTH };
