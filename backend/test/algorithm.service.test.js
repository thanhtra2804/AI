const test = require("node:test");
const assert = require("node:assert/strict");
const { runAlgorithm } = require("../src/services/algorithm.service");

const weightedGraph = {
  directed: false,
  weighted: true,
  nodes: ["A", "B", "C", "D"],
  edges: [
    { from: "A", to: "B", weight: 2 },
    { from: "A", to: "C", weight: 5 },
    { from: "B", to: "D", weight: 1 },
    { from: "C", to: "D", weight: 2 },
  ],
};

test("BFS returns traversal order and queue states", () => {
  const result = runAlgorithm({
    algorithm: "BFS",
    graph: weightedGraph,
    startNode: "A",
  });

  assert.equal(result.algorithm, "BFS");
  assert.deepEqual(result.summary.traversal_order, ["A", "B", "C", "D"]);
  assert.ok(result.steps.length > 0);
  assert.ok(result.steps.some((step) => Object.hasOwn(step, "queue")));
});

test("DFS returns traversal order and stack states", () => {
  const result = runAlgorithm({
    algorithm: "DFS",
    graph: weightedGraph,
    startNode: "A",
  });

  assert.equal(result.algorithm, "DFS");
  assert.deepEqual(result.summary.traversal_order, ["A", "B", "D", "C"]);
  assert.ok(result.steps.length > 0);
  assert.ok(result.steps.some((step) => Object.hasOwn(step, "stack")));
});

test("Dijkstra returns distances and predecessor", () => {
  const result = runAlgorithm({
    algorithm: "DIJKSTRA",
    graph: weightedGraph,
    startNode: "A",
  });

  assert.equal(result.algorithm, "DIJKSTRA");
  assert.equal(result.summary.distances.A, 0);
  assert.equal(result.summary.distances.B, 2);
  assert.equal(result.summary.distances.D, 3);
  assert.equal(result.summary.predecessor.D, "B");
  assert.ok(result.steps.some((step) => Object.hasOwn(step, "distances")));
});

test("Kruskal returns mst edges and total weight", () => {
  const result = runAlgorithm({
    algorithm: "KRUSKAL",
    graph: weightedGraph,
  });

  assert.equal(result.algorithm, "KRUSKAL");
  assert.equal(result.summary.total_weight, 5);
  assert.equal(result.summary.mst_edges.length, weightedGraph.nodes.length - 1);
  assert.ok(result.steps.some((step) => Object.hasOwn(step, "selected_edges")));
});

test("Floyd returns distance matrix with shortest path", () => {
  const result = runAlgorithm({
    algorithm: "FLOYD",
    graph: weightedGraph,
  });

  assert.equal(result.algorithm, "FLOYD");
  assert.equal(result.summary.distance_matrix.A.A, 0);
  assert.equal(result.summary.distance_matrix.A.D, 3);
  assert.equal(result.summary.distance_matrix.B.C, 3);
  assert.ok(result.steps.length > 0);
});
