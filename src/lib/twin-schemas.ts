import type { ProblemVisualType } from "@/lib/twin-problem-type";

const TWIN_ITEM_BASE = {
  type: "object",
  properties: {
    question: { type: "string", description: "연습문제 지문 (LaTeX 포함)" },
    solution: { type: "string", description: "정답만 (LaTeX 포함, 풀이 과정 없음)" },
  },
  required: ["question", "solution"],
} as const;

const SVG_PROPERTY = {
  svg_code: {
    type: "string",
    description:
      "문제에 필요한 도형/그림을 나타내는 완전한 SVG 문자열 (<svg>...</svg>)",
  },
} as const;

const GRAPH_DATA_PROPERTY = {
  graph_data: {
    type: "object",
    description:
      "function-plot 라이브러리에 바로 넣을 수 있는 그래프 설정 JSON",
    properties: {
      width: { type: "number" },
      height: { type: "number" },
      grid: { type: "boolean" },
      disableZoom: { type: "boolean" },
      xDomain: {
        type: "array",
        items: { type: "number" },
        minItems: 2,
        maxItems: 2,
      },
      yDomain: {
        type: "array",
        items: { type: "number" },
        minItems: 2,
        maxItems: 2,
      },
      xAxis: {
        type: "object",
        properties: {
          label: { type: "string" },
          domain: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
          },
        },
      },
      yAxis: {
        type: "object",
        properties: {
          label: { type: "string" },
          domain: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
          },
        },
      },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            fn: { type: "string" },
            fnType: {
              type: "string",
              enum: [
                "linear",
                "implicit",
                "parametric",
                "polar",
                "points",
                "vector",
              ],
            },
            graphType: {
              type: "string",
              enum: ["interval", "polyline", "text", "scatter"],
            },
            range: {
              type: "array",
              items: { type: "number" },
              minItems: 2,
              maxItems: 2,
            },
            color: { type: "string" },
            nSamples: { type: "number" },
            points: {
              type: "array",
              items: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
              },
            },
          },
          required: ["fn"],
        },
        minItems: 1,
      },
      annotations: {
        type: "array",
        items: { type: "object" },
      },
    },
    required: ["data"],
  },
} as const;

function twinItemSchema(visualType: ProblemVisualType) {
  const properties: Record<string, unknown> = {
    ...TWIN_ITEM_BASE.properties,
  };
  const required: string[] = [...TWIN_ITEM_BASE.required];

  if (visualType === "geometry" || visualType === "geometry_graph") {
    Object.assign(properties, SVG_PROPERTY);
    required.push("svg_code");
  }
  if (visualType === "graph" || visualType === "geometry_graph") {
    Object.assign(properties, GRAPH_DATA_PROPERTY);
    required.push("graph_data");
  }

  return {
    type: "object",
    properties,
    required,
  };
}

export function getTwinResponseSchema(visualType: ProblemVisualType) {
  return {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: twinItemSchema(visualType),
        minItems: 3,
        maxItems: 3,
      },
    },
    required: ["items"],
  };
}
