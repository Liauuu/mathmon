export type ProblemVisualType = "text" | "geometry" | "graph" | "geometry_graph";

export type ProblemVisualFlags = {
  has_geometry?: boolean;
  has_graph?: boolean;
};

export function getProblemVisualType(
  flags: ProblemVisualFlags,
): ProblemVisualType {
  const geo = Boolean(flags.has_geometry);
  const graph = Boolean(flags.has_graph);
  if (geo && graph) return "geometry_graph";
  if (geo) return "geometry";
  if (graph) return "graph";
  return "text";
}
