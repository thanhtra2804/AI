INSERT INTO users (email)
VALUES
  ('student1@example.com'),
  ('student2@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO exercises (question, graph, answer)
VALUES (
  'Thuc hien BFS tu node A va ghi thu tu tham.',
  '{"directed": false, "weighted": false, "nodes": ["A", "B", "C", "D"], "edges": [{"from":"A","to":"B"},{"from":"A","to":"C"},{"from":"B","to":"D"}]}'::jsonb,
  'A -> B -> C -> D'
);
