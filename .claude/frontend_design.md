name: frontend-integration
description: Use this skill whenever building or reviewing a frontend that consumes a REST API for a monitoring/dashboard-style application (e.g., the uptime monitor MVP) — covers project structure, data-polling hooks, component boundaries, error/loading states, and UI/UX conventions for status dashboards. Trigger this any time the user asks to build, wire up, refactor, or review a frontend dashboard, status page, or "connect the frontend to the backend" task, even if they don't use the words "architecture" or "best practices" explicitly.
---

# Frontend Integration (Status Dashboard)

Approach this as a senior frontend engineer reviewing a small, scoped MVP dashboard. The goal is a clean, readable, correctly-layered app — not a maximalist showcase. Favor boring, obviously-correct code over cleverness.

## Scope check first

Before writing code, confirm: is this an MVP/interview-style assignment, or a production app? If the brief says "strict MVP," "keep it simple," or similar — skip state-management libraries, routing, and speculative abstractions. Build exactly what's needed, cleanly.

## Project structure

```
frontend/
├── src/
│   ├── api/            # all fetch/axios calls — nowhere else
│   │   └── urls.js
│   ├── components/     # presentational, no data-fetching inside
│   │   ├── UrlList.jsx
│   │   ├── UrlCard.jsx
│   │   ├── AddUrlForm.jsx
│   │   ├── StatusBadge.jsx
│   │   └── EmptyState.jsx
│   ├── hooks/           # data + polling logic, decoupled from UI
│   │   └── useUrls.js
│   ├── App.jsx
│   └── main.jsx
```

Rule of thumb: a component either fetches data (via a hook) or renders UI — never both mixed together. This keeps components testable and swappable (e.g., polling → WebSocket later) without touching markup.

## Data layer: polling pattern

Dashboards showing periodic checks need a poll loop that's live-feeling without hammering the API.

Key rules:
- Poll noticeably faster than the backend's check interval (e.g., 10s frontend poll vs 60s backend checks) so the UI feels live.
- Never let a failed poll blank the screen — keep showing the last good data with a subtle "reconnecting" indicator.
- Expose a manual `refresh()` so add/delete actions can feel instant instead of waiting for the next tick.
- Only show a full loading skeleton on first mount, never on background refreshes (causes flicker).

## Component boundaries (single responsibility)

- **List component** — maps data to cards, owns empty-state rendering, no fetch logic.
- **Card component** — pure display of one resource (status, response time, last-checked, error reason). No side effects.
- **Status badge** — takes primitive props (`isUp`, `statusCode`), renders color/icon. Reusable and easy to unit test in isolation.
- **Form component** — owns its own input state; calls a passed-in `onSubmit(value)`; clears itself on success; surfaces server validation errors (e.g., duplicate/invalid URL) inline.

## UI/UX conventions for status dashboards

- **Status is the hero.** Up/down state must be the most visually dominant element per row — color-coded badge, not just text.
- **Show recency, not raw timestamps.** "Checked 12s ago" beats an ISO string.
- **Surface the failure reason.** Don't just render red — show the actual error (timeout, DNS failure, non-2xx) so a demo of a broken URL visibly proves the logic, not just a guess.
- **Empty state has a job.** Prompt the user to add their first URL rather than showing a blank screen.
- **Errors speak in the interface's voice.** State what happened and what to do next; never leave a raw stack trace or vague "Something went wrong" with no next step.
- **Loading vs. error vs. empty are three distinct states** — always render all three explicitly, never let one silently stand in for another.
- ** integrate the clear and clean UI/UX 

## What to skip for MVP scope

- Redux/Zustand/global state — a single `useUrls`-style hook is enough for one resource type.
- Client-side routing — a single dashboard view doesn't need React Router.
- Optimistic UI is a nice-to-have, not a requirement — only add it if time allows after the core flow works end-to-end.

## Review checklist before calling it done

- [ ] No fetch calls inside JSX components — all in `api/`
- [ ] Interval cleared on unmount
- [ ] Loading state only shown on first load, not every poll
- [ ] Errors don't wipe existing data from the screen
- [ ] Empty state exists and is actionable
- [ ] Status/error reason both visible per row, not just up/down