"use client";

import { useEffect, useRef } from "react";
import type { GraphData } from "@/lib/parse-twin-json";

type SvgDiagramProps = {
  svgCode: string;
};

export function SvgDiagram({ svgCode }: SvgDiagramProps) {
  if (!svgCode.trim()) return null;

  return (
    <div
      className="problem-svg-diagram my-3 flex w-full justify-center overflow-x-auto rounded-xl border border-[#84cc16]/20 bg-[#111827]/60 p-3"
      aria-label="문제 도형"
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  );
}

type FunctionPlotChartProps = {
  graphData: GraphData;
};

export function FunctionPlotChart({ graphData }: FunctionPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !graphData.data?.length) return;

    let cancelled = false;
    container.replaceChildren();

    void (async () => {
      const functionPlot = (await import("function-plot")).default;
      if (cancelled || !containerRef.current) return;

      const plotOptions = {
        target: containerRef.current,
        width: graphData.width ?? 360,
        height: graphData.height ?? 280,
        grid: graphData.grid ?? true,
        disableZoom: graphData.disableZoom ?? true,
        xDomain: graphData.xDomain,
        yDomain: graphData.yDomain,
        xAxis: graphData.xAxis,
        yAxis: graphData.yAxis,
        data: graphData.data,
        ...(graphData.annotations
          ? { annotations: graphData.annotations as never[] }
          : {}),
      };
      functionPlot(plotOptions);
    })();

    return () => {
      cancelled = true;
    };
  }, [graphData]);

  if (!graphData.data?.length) return null;

  return (
    <div
      ref={containerRef}
      className="problem-function-plot my-3 w-full overflow-hidden rounded-xl border border-[#84cc16]/20 bg-[#111827]/60 p-2"
      aria-label="문제 그래프"
    />
  );
}

type ProblemGraphicRendererProps = {
  svgCode?: string;
  graphData?: GraphData;
};

export default function ProblemGraphicRenderer({
  svgCode,
  graphData,
}: ProblemGraphicRendererProps) {
  const hasSvg = Boolean(svgCode?.trim());
  const hasGraph = Boolean(graphData?.data?.length);

  if (!hasSvg && !hasGraph) return null;

  return (
    <div className="problem-graphic-renderer flex w-full flex-col gap-2">
      {hasSvg ? <SvgDiagram svgCode={svgCode!} /> : null}
      {hasGraph ? <FunctionPlotChart graphData={graphData!} /> : null}
    </div>
  );
}
