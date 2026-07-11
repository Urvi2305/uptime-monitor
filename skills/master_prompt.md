# AI Collaboration Log

This document is a transparent record of how I used AI to plan, build, review, and refine this project — not just the prompts that produced code, but the process and judgment calls around them. This is the part of the submission I'd want a reviewer to read most closely, since it reflects how I actually think and work with AI, not just what the AI output.

---

## 1. AI Tech Stack

| Tool | Role |
|---|---|
| **Claude (Sonnet)** — via claude.ai chat | Understanding the brief, planning architecture and tech-stack decisions, reviewing generated code phase by phase, scoping decisions (what to build vs. what to skip), and drafting the master/phase prompts handed to the coding agent. |
| **Claude Code** | Executing the actual multi-file implementation — backend (Node/Express/PostgreSQL), the check scheduler, frontend (React + Vite), Docker setup, and the final UI/UX redesign pass — driven by the phased prompts planned in chat. |
| **Underlying model** | Claude Sonnet 4.6 |

The two tools were used deliberately for different jobs: **chat with Claude** for thinking, planning, and reviewing — the parts that need judgment — and **Claude Code** for execution once a plan was scoped and I knew what "good" looked like. I didn't hand the brief straight to an agent and accept whatever came out; every phase was planned first, built second, and reviewed third before moving on.

---

## 2. My Process — How I Actually Used AI to Build This

1. **Read and understood the brief myself first.** Before involving any AI, I read the assignment PDF and formed my own understanding of what an uptime monitor actually needs — registration, periodic checks, status history, a dashboard, containerization.

2. **Gave Claude the same PDF, plus my own understanding of the task**, rather than just the raw document — so the model was working from an aligned starting point, not guessing at scope on its own.

3. **Explicitly asked Claude to confirm understanding and ask clarifying questions before we did anything else.** I didn't want code yet — I wanted to make sure we agreed on what "done" looked like first.

4. **Discussed tech stack and architecture as a conversation, not a request for code.** Landed on Node + Express for the backend and React for the frontend, and specifically discussed what engineering *not* to add — this was a deliberate anti-over-engineering conversation, not just a stack pick.

5. **Made concrete architecture decisions and justified each one against the actual scale of the task:**
   - React + Vite for the frontend
   - Simple polling instead of WebSockets/real-time sockets — a few dozen URLs checked every ~60s doesn't need push-based real-time infrastructure
   - No queue system — the check volume doesn't justify one
   - Raw SQL files instead of an ORM — a handful of endpoints and two tables didn't need that abstraction layer

6. **For the frontend specifically — an area outside my usual expertise — I asked Claude to propose the approach rather than dictating one**, since backend/infra is my stronger background and I wanted the AI's judgment on frontend structure rather than forcing my own assumptions onto a part of the stack I'm less confident in.

7. **Converted the backend and frontend architecture discussions into two reusable skill files** (`master_prompt.md` for patterns, `SKILL.md` for frontend integration patterns), committed to the repo, so the standards we agreed on in conversation carried forward consistently into every prompt after that — not just the first one.

8. **Built one master prompt per side of the stack** (backend integration, frontend integration) referencing those skill files, and broke each into **phases** rather than asking for the whole app at once:
   - Phase 1: project skeleton — backend/frontend folders, DB structure — committed as its own step before moving on.

9. **Backend was built and reviewed phase by phase, not in one shot:**
   1. DB schema and tables
   2. API routes
   3. Business logic
   4. Scheduler (periodic check worker)

   Reviewing after each phase — rather than after the whole backend was "done" — is what caught two real issues before they compounded:
   - Business logic had been written directly inside the route files instead of separated into handlers. I deliberately chose **handlers only, not a full controller → service layering**, since this is a 4–5 endpoint MVP and a full service layer would be over-engineering for the scope. I re-prompted Claude Code with that specific constraint and had it refactor accordingly.
   - Validation gaps in the same review pass (missing input validation, no `id` param checks) — flagged and fixed in the same phase, before the scheduler was even built on top of it.

10. **Backend integration finished, committed, and merged into its own branch** before frontend work started — kept the two efforts isolated so a frontend course-correction couldn't blur into unreviewed backend changes.

11. **Frontend integration started from the master skill prompt — deliberately without a design spec attached yet.** In hindsight, this was the one planning gap in my process: I assumed Claude Code would apply reasonable design judgment by default, without explicitly asking for it. It didn't — it produced a functionally correct but visually bare UI, since I hadn't scoped design as a requirement in that phase.

12. **Reviewed the functional frontend once it was done — correct and complete against requirements, committed, and moved to a new branch for Dockerization**, which was prompted and reviewed the same way (phase → review → commit).

13. **At that point the app was fully functional end-to-end — registration, polling, checks, history, Docker — but the UI was not something I was satisfied with.** Rather than accept "functional but ugly" as the final state, I treated design as its own explicit phase.

14. **Wrote a new, detailed design-specific prompt** — this time explicit about what I wanted reviewed and changed: a popup/modal for registering a new URL instead of the inline bar, a dedicated full page for check history instead of an inline list, pagination on both views, and a richer, more intentional color/visual system instead of default styling. That prompt is what produced the final version of the app.

---

## 3. Course Corrections

These are the moments where the first result wasn't right, and what I did about it — not just "AI wrote bad code," but the judgment calls in between.

### Correction 1: Business logic landed in the route files instead of handlers

During the phased backend review (step 9), I found business logic written directly inside the Express route definitions rather than in separate handler files — my normal practice is to keep routes thin. I re-prompted specifically to move logic into handlers, and explicitly told the agent **not** to go further and add a full controller → service layer, since that would be unnecessary abstraction for an API this size. This was a case of catching structural drift early because I was reviewing after every phase, not after the whole backend was built.

### Correction 2: Missing input validation, caught in the same review pass

The same phase review surfaced missing validation (URL format handling, `id` param checks on delete/history routes). Fixed in the same pass, before the scheduler was layered on top — deliberately sequenced so the scheduler wasn't built against an under-validated API surface.

### Correction 3: AI proposed unscoped security hardening (SSRF / DNS-rebinding protection)

While reviewing backend validation logic, Claude proactively suggested SSRF protection for registered URLs — blocking things like `http://169.254.169.254` (cloud metadata endpoints) via DNS resolution and private-IP-range checks. Technically sound, but the assignment brief explicitly states production hardening and security policy aren't being graded, and asks for a strict MVP prioritizing execution speed. I asked Claude to lay out the actual tradeoffs (remove entirely vs. a lightweight literal-IP check vs. the full DNS-resolving version) and chose to remove it entirely, reverting to a plain protocol check. The lesson here wasn't a code fix — it was catching the AI defaulting to "more hardening is always better" and pulling it back in line with what was actually being asked for.

### Correction 4: Design wasn't explicit, so the AI didn't provide it

The biggest process gap in this build: I didn't ask for design in the frontend master prompt, so I got a functionally correct but visually generic UI back. This wasn't the AI getting something *wrong* — it did exactly what was asked. It was a reminder that **AI does not infer unstated quality bars**; if visual design matters, it has to be an explicit, scoped phase with real constraints (color system, typography, layout behavior, specific components), not an assumption that a "good" UI will show up by default. That's what the final design-specific prompt was built to correct.

### Correction 5: Suspected worker bug that was actually a missing feature

The dashboard appeared to only show one check per URL updating in place, which looked like the scheduler was overwriting rows instead of inserting new ones. Before rewriting any worker code, I verified the `checks` table directly — it already had 30+ correctly accumulating rows per URL. The `GET /api/urls` endpoint was, by design, only ever joining in the *latest* check to keep the dashboard scannable; the actual gap was that the full-history endpoint had never been wired into the UI. Verifying the data layer directly before touching working code avoided a pointless rewrite of the scheduler.

---

## Summary

The pattern across this build: AI was fast and largely reliable at generating working code once a phase was clearly scoped — but it consistently needed explicit constraints to stay aligned with the actual brief, whether that meant pulling back over-engineered security work, keeping the architecture as thin as the task warranted, or being told outright that design mattered and wasn't optional. My role throughout wasn't writing code by hand — it was scoping each phase deliberately, reviewing after every phase rather than at the end, and catching drift (structural, validation, security, or visual) before it compounded into the next phase.