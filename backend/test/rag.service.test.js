const test = require("node:test");
const assert = require("node:assert/strict");
const { chunkText } = require("../src/services/rag.service");

test("chunkText splits long text into overlapping chunks", () => {
  const text = "A".repeat(1200);
  const chunks = chunkText(text, 500, 100);

  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].length, 500);
  assert.equal(chunks[1].length, 500);
  assert.equal(chunks[2].length, 400);
});

test("chunkText returns empty array for blank text", () => {
  assert.deepEqual(chunkText("   \n\t  "), []);
});
