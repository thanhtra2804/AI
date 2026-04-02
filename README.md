# AI Algorithm Tutor

Tai lieu ke hoach va tai lieu ky thuat duoc dat trong thu muc [docs](docs).

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, D3.js
- Backend: Node.js, Express
- Database: PostgreSQL (Neon) + pgvector
- AI: OpenAI / Gemini / Groq (config qua env)
- CI: GitHub Actions

## Danh muc tai lieu

- [Tong quan du an](docs/00-overview.md)
- [Implementation Rules](docs/01-implementation-rules.md)
- [Roadmap theo Sprint](docs/02-roadmap-sprints.md)
- [Master Backlog](docs/03-backlog-master.md)
- [API Contract](docs/04-api-contract.md)
- [State Engine Schema](docs/05-state-engine-schema.md)
- [Database Schema cho Neon](docs/06-database-neon.md)
- [Neon Runtime Setup](docs/11-neon-runtime-setup.md)
- [Project Structure](docs/07-project-structure.md)
- [Sprint 1 Checklist chi tiet](docs/08-sprint1-checklist.md)
- [Sprint 2 Checklist chi tiet](docs/12-sprint2-checklist.md)
- [Sprint 3 Checklist chi tiet](docs/13-sprint3-checklist.md)
- [RAG Pipeline](docs/09-rag-pipeline.md)
- [Release Checklist](docs/10-release-checklist.md)


## Chay local toi uu

1. Cai dependencies cho ca workspace:

```bash
npm install
npm run setup
```

2. Chay ca backend + frontend bang 1 lenh:

```bash
npm run dev
```

Mac dinh local:

- Backend: `http://localhost:8787`
- Frontend: `http://localhost:5173` (neu ban, Vite tu nhay sang cong tiep theo)

3. Neu can chay rieng tung service:

```bash
npm run dev:backend
npm run dev:frontend
```
