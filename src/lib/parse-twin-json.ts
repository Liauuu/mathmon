import { repairJsonLatexEscapes } from "@/lib/normalize-math-markdown";

export type GraphPlotDatum = {
  fn?: string;
  fnType?: "linear" | "implicit" | "parametric" | "polar" | "points" | "vector";
  graphType?: "interval" | "polyline" | "text" | "scatter";
  range?: [number, number];
  color?: string;
  nSamples?: number;
  points?: [number, number][];
  text?: string;
  location?: [number, number];
};

export type GraphData = {
  width?: number;
  height?: number;
  grid?: boolean;
  disableZoom?: boolean;
  xDomain?: [number, number];
  yDomain?: [number, number];
  xAxis?: { domain?: [number, number]; label?: string };
  yAxis?: { domain?: [number, number]; label?: string };
  data: GraphPlotDatum[];
  annotations?: unknown[];
};

export type TwinProblemItem = {
  question: string;
  solution: string;
  svg_code?: string;
  graph_data?: GraphData;
};

export type TwinJsonResult = {
  items: TwinProblemItem[];
};

function normalizeTextField(value: string): string {
  return repairJsonLatexEscapes(value);
}

function stripCodeFence(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function normalizeGraphData(value: unknown): GraphData | undefined {
  if (!value || typeof value !== "object") return undefined;
  const data = value as Partial<GraphData>;
  if (!Array.isArray(data.data) || data.data.length === 0) return undefined;
  return {
    width: typeof data.width === "number" ? data.width : undefined,
    height: typeof data.height === "number" ? data.height : undefined,
    grid: typeof data.grid === "boolean" ? data.grid : undefined,
    disableZoom:
      typeof data.disableZoom === "boolean" ? data.disableZoom : undefined,
    xDomain: Array.isArray(data.xDomain) ? (data.xDomain as [number, number]) : undefined,
    yDomain: Array.isArray(data.yDomain) ? (data.yDomain as [number, number]) : undefined,
    xAxis: data.xAxis as GraphData["xAxis"],
    yAxis: data.yAxis as GraphData["yAxis"],
    data: data.data as GraphPlotDatum[],
    annotations: data.annotations,
  };
}

function normalizeTwinItem(value: unknown): TwinProblemItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<TwinProblemItem>;
  if (typeof item.question !== "string" || typeof item.solution !== "string") {
    return null;
  }

  const normalized: TwinProblemItem = {
    question: normalizeTextField(item.question),
    solution: normalizeTextField(item.solution),
  };

  if (typeof item.svg_code === "string" && item.svg_code.trim()) {
    normalized.svg_code = item.svg_code.trim();
  }

  const graphData = normalizeGraphData(item.graph_data);
  if (graphData) {
    normalized.graph_data = graphData;
  }

  return normalized;
}

function normalizeTwinItems(items: unknown[]): TwinProblemItem[] {
  const result: TwinProblemItem[] = [];
  for (const item of items) {
    const normalized = normalizeTwinItem(item);
    if (normalized) result.push(normalized);
  }
  return result;
}

function extractPartialItems(raw: string): TwinProblemItem[] {
  const itemsKey = raw.indexOf('"items"');
  if (itemsKey === -1) return [];

  const arrayStart = raw.indexOf("[", itemsKey);
  if (arrayStart === -1) return [];

  const slice = raw.slice(arrayStart);
  const candidates = [slice, `${slice}]`, `${slice}}]`, `${slice}}}]`];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (Array.isArray(parsed)) {
        return normalizeTwinItems(parsed);
      }
    } catch {
      /* try next */
    }
  }

  return [];
}

export function parseTwinJson(raw: string): TwinJsonResult | null {
  const cleaned = stripCodeFence(raw);
  if (!cleaned) return null;

  try {
    const data = JSON.parse(cleaned) as { items?: unknown[] };
    if (Array.isArray(data.items)) {
      const items = normalizeTwinItems(data.items);
      if (items.length > 0) return { items };
    }
  } catch {
    /* streaming partial */
  }

  const partialItems = extractPartialItems(cleaned);
  if (partialItems.length > 0) return { items: partialItems };

  return null;
}

export function serializeTwinItemsForExclude(items: TwinProblemItem[]): string {
  return JSON.stringify(
    items.map((item) => ({
      question: item.question,
      solution: item.solution,
    })),
  );
}
