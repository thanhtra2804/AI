function normalizeAlgorithm(name) {
  return String(name || "")
    .trim()
    .toUpperCase();
}

function buildAdjList(graph) {
  const adj = new Map();
  for (const node of graph.nodes) adj.set(node, []);

  for (const edge of graph.edges) {
    const weight = typeof edge.weight === "number" ? edge.weight : 1;
    adj.get(edge.from)?.push({ to: edge.to, weight, from: edge.from });
    if (!graph.directed) {
      adj.get(edge.to)?.push({ to: edge.from, weight, from: edge.to });
    }
  }

  return adj;
}

function pickStartNode(graph, startNode) {
  if (startNode && graph.nodes.includes(startNode)) return startNode;
  return graph.nodes[0];
}

function runBfs(graph, startNode) {
  const adj = buildAdjList(graph);
  const start = pickStartNode(graph, startNode);
  const visitedSet = new Set([start]);
  const queue = [start];
  const visited = [];
  const steps = [];
  let step = 1;

  while (queue.length) {
    const current = queue.shift();
    visited.push(current);
    steps.push({
      step: step++,
      algorithm: "BFS",
      current_node: current,
      queue: [...queue],
      visited: [...visited],
      dequeued_node: current,
      enqueued_node: null,
      active_edges: [],
      explanation_key: "dequeue",
    });

    for (const edge of adj.get(current) || []) {
      if (!visitedSet.has(edge.to)) {
        visitedSet.add(edge.to);
        queue.push(edge.to);
        steps.push({
          step: step++,
          algorithm: "BFS",
          current_node: current,
          queue: [...queue],
          visited: [...visited],
          dequeued_node: null,
          enqueued_node: edge.to,
          active_edges: [[current, edge.to]],
          explanation_key: "enqueue",
        });
      }
    }
  }

  return {
    algorithm: "BFS",
    steps,
    summary: { traversal_order: visited },
  };
}

function runDfs(graph, startNode) {
  const adj = buildAdjList(graph);
  const start = pickStartNode(graph, startNode);
  const visitedSet = new Set();
  const visited = [];
  const stack = [start];
  const steps = [];
  let step = 1;

  while (stack.length) {
    const current = stack.pop();
    if (visitedSet.has(current)) continue;
    visitedSet.add(current);
    visited.push(current);

    steps.push({
      step: step++,
      algorithm: "DFS",
      current_node: current,
      stack: [...stack],
      visited: [...visited],
      pushed_node: null,
      popped_node: current,
      active_edges: [],
      explanation_key: "pop_visit",
    });

    const neighbors = [...(adj.get(current) || [])].reverse();
    for (const edge of neighbors) {
      if (!visitedSet.has(edge.to)) {
        stack.push(edge.to);
        steps.push({
          step: step++,
          algorithm: "DFS",
          current_node: current,
          stack: [...stack],
          visited: [...visited],
          pushed_node: edge.to,
          popped_node: null,
          active_edges: [[current, edge.to]],
          explanation_key: "push_neighbor",
        });
      }
    }
  }

  return {
    algorithm: "DFS",
    steps,
    summary: { traversal_order: visited },
  };
}

function runDijkstra(graph, startNode) {
  const adj = buildAdjList(graph);
  const start = pickStartNode(graph, startNode);
  const dist = Object.fromEntries(graph.nodes.map((n) => [n, Infinity]));
  const prev = {};
  const visitedSet = new Set();
  dist[start] = 0;

  const pq = [[0, start]];
  const steps = [];
  let step = 1;

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, current] = pq.shift();
    if (visitedSet.has(current)) continue;
    visitedSet.add(current);

    steps.push({
      step: step++,
      algorithm: "DIJKSTRA",
      current_node: current,
      visited: [...visitedSet],
      distances: { ...dist },
      priority_queue: [...pq],
      relaxed_edge: null,
      predecessor: { ...prev },
      active_edges: [],
      explanation_key: "extract_min",
    });

    for (const edge of adj.get(current) || []) {
      const nd = d + edge.weight;
      if (nd < dist[edge.to]) {
        dist[edge.to] = nd;
        prev[edge.to] = current;
        pq.push([nd, edge.to]);
        steps.push({
          step: step++,
          algorithm: "DIJKSTRA",
          current_node: current,
          visited: [...visitedSet],
          distances: { ...dist },
          priority_queue: [...pq],
          relaxed_edge: [current, edge.to],
          predecessor: { ...prev },
          active_edges: [[current, edge.to]],
          explanation_key: "relax_edge",
        });
      }
    }
  }

  return {
    algorithm: "DIJKSTRA",
    steps,
    summary: {
      distances: dist,
      predecessor: prev,
    },
  };
}

function runKruskal(graph) {
  const parent = Object.fromEntries(graph.nodes.map((n) => [n, n]));
  const rank = Object.fromEntries(graph.nodes.map((n) => [n, 0]));

  const find = (x) => {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };

  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else {
      parent[rb] = ra;
      rank[ra] += 1;
    }
    return true;
  };

  const edges = [...graph.edges]
    .map((e) => ({ ...e, weight: typeof e.weight === "number" ? e.weight : 1 }))
    .sort((a, b) => a.weight - b.weight);

  const steps = [];
  const selected = [];
  let totalWeight = 0;
  let step = 1;

  edges.forEach((edge, idx) => {
    const accepted = union(edge.from, edge.to);
    if (accepted) {
      selected.push([edge.from, edge.to, edge.weight]);
      totalWeight += edge.weight;
    }

    steps.push({
      step: step++,
      algorithm: "KRUSKAL",
      current_node: null,
      candidate_edge: [edge.from, edge.to, edge.weight],
      selected_edges: [...selected],
      sorted_edges_cursor: idx,
      components: { ...parent },
      total_weight: totalWeight,
      active_edges: [[edge.from, edge.to]],
      explanation_key: accepted ? "accept_edge" : "reject_cycle",
    });
  });

  return {
    algorithm: "KRUSKAL",
    steps,
    summary: {
      mst_edges: selected,
      total_weight: totalWeight,
    },
  };
}

function runFloyd(graph) {
  const nodes = graph.nodes;
  const inf = Number.POSITIVE_INFINITY;
  const dist = {};
  nodes.forEach((i) => {
    dist[i] = {};
    nodes.forEach((j) => {
      dist[i][j] = i === j ? 0 : inf;
    });
  });

  for (const edge of graph.edges) {
    const w = typeof edge.weight === "number" ? edge.weight : 1;
    dist[edge.from][edge.to] = Math.min(dist[edge.from][edge.to], w);
    if (!graph.directed) {
      dist[edge.to][edge.from] = Math.min(dist[edge.to][edge.from], w);
    }
  }

  const steps = [];
  let step = 1;

  for (const k of nodes) {
    for (const i of nodes) {
      for (const j of nodes) {
        const throughK = dist[i][k] + dist[k][j];
        if (throughK < dist[i][j]) {
          dist[i][j] = throughK;
          steps.push({
            step: step++,
            algorithm: "FLOYD",
            current_node: null,
            k_intermediate: k,
            i,
            j,
            distance_matrix: JSON.parse(JSON.stringify(dist)),
            updated_cell: [i, j],
            active_edges: [
              [i, k],
              [k, j],
            ],
            explanation_key: "update_shorter_path",
          });
        }
      }
    }
  }

  return {
    algorithm: "FLOYD",
    steps,
    summary: { distance_matrix: dist },
  };
}

function runAlgorithm(input) {
  const algorithm = normalizeAlgorithm(input.algorithm);
  const { graph, startNode } = input;

  switch (algorithm) {
    case "BFS":
      return runBfs(graph, startNode);
    case "DFS":
      return runDfs(graph, startNode);
    case "DIJKSTRA":
      return runDijkstra(graph, startNode);
    case "KRUSKAL":
      return runKruskal(graph);
    case "FLOYD":
      return runFloyd(graph);
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}

module.exports = {
  runAlgorithm,
};
