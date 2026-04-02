import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

function normalizeActiveEdges(step) {
  if (!step || !Array.isArray(step.active_edges)) return [];
  return step.active_edges
    .map((item) => (Array.isArray(item) ? `${item[0]}->${item[1]}` : ""))
    .filter(Boolean);
}

function GraphRenderer({ graph, step, onNodeClick, className = "" }) {
  const svgRef = useRef(null);

  const nodes = useMemo(
    () =>
      Array.isArray(graph?.nodes) ? graph.nodes.map((id) => ({ id })) : [],
    [graph],
  );

  const links = useMemo(() => {
    if (!Array.isArray(graph?.edges)) return [];
    return graph.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      weight: edge.weight ?? 1,
    }));
  }, [graph]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 780;
    const height = 460;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const root = svg.append("g").attr("transform", "translate(8, 8)");

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(130),
      )
      .force("charge", d3.forceManyBody().strength(-420))
      .force("center", d3.forceCenter(width / 2 - 8, height / 2 - 8));

    const link = root
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.7);

    const label = root
      .append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("font-size", 11)
      .attr("font-weight", 700)
      .attr("fill", "#0f172a")
      .text((d) => d.weight);

    const node = root
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .on("click", (_, datum) => {
        if (typeof onNodeClick === "function") {
          onNodeClick(datum.id);
        }
      });

    node
      .append("circle")
      .attr("r", 20)
      .attr("fill", "#ffffff")
      .attr("stroke", "#334155")
      .attr("stroke-width", 2.2);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("font-size", 13)
      .attr("font-weight", 800)
      .attr("fill", "#0f172a")
      .text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      label
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2 - 6);

      node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });

    return () => simulation.stop();
  }, [nodes, links, onNodeClick]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const activeNode = step?.current_node;
    const visited = Array.isArray(step?.visited) ? step.visited : [];
    const activeEdges = normalizeActiveEdges(step);

    svg
      .selectAll("g > g > circle")
      .attr("fill", (d) => {
        if (d.id === activeNode) return "#0f766e";
        if (visited.includes(d.id)) return "#ccfbf1";
        return "#ffffff";
      })
      .attr("stroke", (d) => (d.id === activeNode ? "#0f766e" : "#334155"))
      .attr("stroke-width", (d) => (d.id === activeNode ? 3.2 : 2.2));

    svg
      .selectAll("line")
      .attr("stroke", (d) => {
        const key = `${d.source.id ?? d.source}->${d.target.id ?? d.target}`;
        const reverseKey = `${d.target.id ?? d.target}->${d.source.id ?? d.source}`;
        return activeEdges.includes(key) || activeEdges.includes(reverseKey)
          ? "#0891b2"
          : "#94a3b8";
      })
      .attr("stroke-width", (d) => {
        const key = `${d.source.id ?? d.source}->${d.target.id ?? d.target}`;
        const reverseKey = `${d.target.id ?? d.target}->${d.source.id ?? d.source}`;
        return activeEdges.includes(key) || activeEdges.includes(reverseKey)
          ? 4
          : 2;
      });
  }, [step]);

  return (
    <div
      className={`glass fade-in flex h-full min-h-0 flex-col rounded-2xl p-3 md:p-4 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="panel-title text-base font-bold text-slate-800">
          Không gian Graph
        </h2>
        <span className="text-[11px] font-semibold text-slate-500">
          Nhấn vào node để đặt điểm bắt đầu
        </span>
      </div>
      <svg ref={svgRef} className="min-h-0 flex-1 rounded-xl bg-white/70" />
    </div>
  );
}

export default GraphRenderer;
