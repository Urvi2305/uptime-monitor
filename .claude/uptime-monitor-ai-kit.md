# Uptime Monitor — AI Build Kit

## Read this first (honest notes)

1. **The AI_LOG.md is graded harder than the code.** The brief says so explicitly. That means you can't write the master prompt below, paste the output, and then invent a plausible-sounding "course correction" afterward. Run the prompt, actually hit a bug, actually re-prompt to fix it, and paste *that* real exchange. A generic bug story ("AI hallucinated a library") reads as fabricated to anyone who's reviewed a few dozen of these.
2. **Don't let the AI over-engineer.** Node/Express + Cursor/Claude Code will happily hand you Redis queues, WebSocket layers, and retry-with-backoff logic for a "few dozen URLs checked every minute." The brief explicitly rewards restraint. The master prompt below has a hard constraints section for this — keep it.
3. **You already know Node/Express**, so treat the backend as the part you review line-by-line, and lean on the AI harder for React and the Docker/Terraform pieces — that's the actual point of the exercise per the brief.

---

## PART 1 — Master Prompt (feed this to Cursor / Claude Code / Copilot)

Copy everything in the code block below as your first prompt. Do it in one shot for the scaffold, then iterate.

```
You are helping me build a strict-MVP uptime monitor. Full-stack app, single `docker compose up` to run everything locally. Prioritize simplicity and correctness over completeness — this is explicitly NOT meant to be production-hardened.

TECH STACK (fixed, do not substitute):
- Backend: Node.js + Express
- Frontend: React (Vite, not CRA)
- Database: PostgreSQL (its own container, not SQLite)
- Orchestration: docker-compose.yml at repo root
- No TypeScript, no ORM unless you think it meaningfully reduces bugs (plain `pg` is fine) — keep dependencies minimal

REPO STRUCTURE:
/backend   — Express API + scheduler + Postgres access
/frontend  — React dashboard
docker-compose.yml
README.md
AI_LOG.md

BACKEND REQUIREMENTS:
1. Postgres schema, two tables:
   - urls (id, url, created_at)
   - checks (id, url_id FK, status_code, response_time_ms, is_up boolean, checked_at, error_message nullable)
2. REST endpoints:
   - POST /api/urls        { url } -> registers a URL for monitoring
   - GET  /api/urls        -> list all URLs with their MOST RECENT check (status, response time, timestamp) joined in
   - GET  /api/urls/:id/checks -> history of checks for one URL
   - DELETE /api/urls/:id  -> stop monitoring a URL
3. A background scheduler (setInterval or node-cron) that, every 60 seconds, pings every registered URL:
   - Use axios with a hard timeout (e.g. 5000ms) and `validateStatus: () => true` so non-2xx doesn't throw
   - Treat any 2xx/3xx response as "up", anything else (4xx/5xx, timeout, DNS failure, connection refused) as "down"
   - IMPORTANT: guard against overlapping runs — if a check cycle is still running when the next interval fires, skip that tick rather than stacking concurrent runs
   - Record status_code (null if the request never completed), response_time_ms, is_up, checked_at, and error_message on failure
4. Run schema migrations automatically on container startup (a simple init.sql mounted into the postgres container's docker-entrypoint-initdb.d is fine — don't reach for a migration framework)
5. CORS enabled for the frontend origin

FRONTEND REQUIREMENTS:
1. Single dashboard page listing all monitored URLs as cards/rows: URL, status badge (green "UP" / red "DOWN"), latest response time in ms, last checked timestamp
2. A form to add a new URL to monitor
3. A way to remove a monitored URL
4. Poll GET /api/urls every ~5-10 seconds (plain fetch + setInterval — no need for WebSockets) so the dashboard reflects new check results without a manual refresh
5. No design system needed — functional and legible is the bar, not polished

DOCKER COMPOSE:
- Three services: postgres, backend, frontend
- backend depends_on postgres with a healthcheck (pg_isready) so it doesn't start before the DB is ready
- Use a named volume for postgres data
- Expose frontend on a fixed port (e.g. 5173 or 3000) and backend API on another (e.g. 4000)
- Environment variables for DB connection via .env / docker-compose environment block, with sensible defaults so `docker compose up` works with zero manual config

HARD CONSTRAINTS — do not add without me asking:
- No message queues, no Redis, no WebSocket layer, no auth/login system, no TypeScript, no ORM heavier than a lightweight query builder
- No retry/backoff logic beyond the basic timeout — a failed check is just logged as down; the next scheduled tick will try again naturally
- Keep total dependencies minimal — if you're about to add a library, ask me first if it's not express/react/pg/axios/cors/dotenv/vite

DELIVERABLES FROM YOU RIGHT NOW:
1. Full file tree
2. All backend files
3. All frontend files
4. docker-compose.yml and any init.sql
5. A first-draft README.md with: the exact `docker compose up` command, and testing steps using https://example.com (expected UP) and an intentionally broken URL like https://this-domain-does-not-exist-abc123xyz.com (expected DOWN)

Ask me clarifying questions only if something above is genuinely ambiguous — otherwise make the simplest reasonable choice and note the assumption in the README.
```

**After the first response**, actually run it: `docker compose up`, add `https://example.com`, add a broken URL, watch the dashboard. Whatever breaks — CORS error, Postgres not ready in time, the scheduler double-firing, React not re-rendering on poll — that's your real course-correction material for Part 2. Don't smooth it over; that friction is what the assignment is grading.

provide me with the phases of the integration at the end once you understand the task completly
---

## PART 2 — Deployment sketch prompt (separate, short follow-up)

Once the app works locally, send this as a follow-up in the same thread:

```
Now add a short "Deployment Sketch" section to the README describing how you'd deploy this MVP to AWS. Keep it brief and hypothetical, not production-hardened. Include a small Terraform snippet covering:
- ECS Fargate service for the backend
- ECS Fargate (or S3+CloudFront) for the frontend
- RDS Postgres instance
- An ALB routing to the backend service
Note explicitly that this is illustrative, not a complete/secure IaC setup — no need for VPC peering, WAF, secrets rotation, etc. One paragraph of prose plus one Terraform code block is enough.
```

---

## PART 3 — AI_LOG.md: template + how to fill it honestly

Create `AI_LOG.md` with this skeleton, then fill it in *as you go*, not after the fact:

```markdown
# AI Collaboration Log

## The Prompts That Shipped It
[Paste your actual master prompt from Part 1, and the deployment follow-up from Part 2.
If you had to re-prompt for a fix (e.g. "the scheduler is firing twice, here's the log, fix it"),
include that exact follow-up prompt too — verbatim.]

## Course Corrections
[Describe ONE real thing that went wrong. Structure:
1. What the AI generated and why it was wrong (be specific — paste the broken code or error)
2. What you noticed (did you catch it by running it? by reading the diff?)
3. The exact prompt or manual edit you made to fix it
4. What changed as a result]
```

Realistic candidates for a genuine course-correction, based on this stack — watch for these while you run Part 1, since one of them will likely actually happen:
- **Scheduler overlap**: if the AI doesn't guard against overlapping runs, a slow URL can cause check cycles to stack and eventually exhaust connections to Postgres.
- **Docker startup race**: backend container crash-looping because it tries to connect to Postgres before the DB is accepting connections — needs a real healthcheck, not just `depends_on`.
- **CORS**: frontend fetch calls silently failing until CORS middleware is added with the right origin.
- **"Down" definition too generous**: first-pass code sometimes only catches HTTP error codes and not DNS failures / connection refused / timeouts, so a genuinely broken URL still shows as "checking" or crashes the scheduler instead of showing DOWN.

Pick whichever one actually happened to you and write it up with your real prompt and real diff — that's what makes this section credible.
