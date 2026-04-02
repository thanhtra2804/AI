const { runSeeds } = require("../src/db/seed");
const { pool } = require("../src/db/pool");
const { ingestDocument } = require("../src/services/rag.service");

const SAMPLE_DOCS = [
  {
    text: "BFS duyet do thi theo tung lop. Dung queue FIFO, danh dau visited som de tranh lap lai. Moi lan lay node dau queue, duyet cac dinh ke va day vao cuoi queue.",
    metadata: { source: "seed", topic: "BFS" },
  },
  {
    text: "DFS di sau theo nhanh truoc khi quay lui. Co the dung stack hoac de quy. Thich hop cho bai toan tim thanh phan lien thong va phat hien chu trinh.",
    metadata: { source: "seed", topic: "DFS" },
  },
  {
    text: "Dijkstra tim duong di ngan nhat tu mot dinh nguon tren do thi trong so khong am. Moi buoc chon node co khoang cach tam thoi nho nhat roi relax cac canh ke.",
    metadata: { source: "seed", topic: "DIJKSTRA" },
  },
];

async function main() {
  await runSeeds();
  for (const doc of SAMPLE_DOCS) {
    await ingestDocument(doc);
  }
  process.stdout.write("Seeds completed.\n");
}

main()
  .catch((error) => {
    process.stderr.write(`Seed failed: ${error.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
