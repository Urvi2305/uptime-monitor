# Uptime Monitor

A small full-stack app that lets you register URLs and watches them for you pings each one every 60 seconds, tracks whether it's up or down, and shows response time history on a dashboard.

## Tech stack

- **Backend:** Node.js + Express, plain `pg` (no ORM), a `setInterval`-based scheduler (no queue/worker system)
- **Frontend:** React + Vite, polling the API every ~10s (no WebSockets)
- **Database:** PostgreSQL
- **Everything wired together with:** Docker Compose

This is intentionally kept simple no queues, no real-time sockets, no ORM since the actual scale here is a handful of URLs checked once a minute, not thousands of URLs needing sub-second updates.

## Prerequisites

Just Docker and Docker Compose. Nothing else needs to be installed locally to run the app.

## Run it

From the repo root:

```bash
docker compose up --build
```

That's it. This single command builds and starts three containers Postgres, the backend API, and the frontend and the backend automatically runs its DB migrations on startup before it starts serving requests. No manual `.env` setup is required; the compose file has sensible defaults built in.

Once it's up:
- Frontend (dashboard): **http://localhost:5173**
- Backend API: **http://localhost:4000**
- Health check: **http://localhost:4000/health**

If you want to change ports or Postgres credentials, copy `.env.example` to `.env` at the repo root and edit it the compose file will pick those values up automatically.

To stop everything:

```bash
docker compose down
```

Add `-v` to that if you also want to wipe the database volume and start fresh next time.

## How to verify it's actually working

Once the dashboard is open at `http://localhost:5173`:

1. **Add a URL that's up** try `https://example.com`. Within a few seconds of the next check cycle, it should show a green **UP** badge with a real response time.
2. **Add a URL that's genuinely unreachable** try something like `https://this-domain-does-not-exist-abc123xyz.com`. This fails at the DNS lookup stage (no server to even connect to), and should show up as **DOWN** with a connection/DNS error.
3. **Add a URL that returns a real HTTP error** try `https://httpstat.us/404`. This one does reach a server, it just responds with 404. It should also show as **DOWN**, but through a different path in the code (a completed HTTP response with a non-2xx/3xx status, not a network failure) worth testing separately from case 2 since they exercise different logic.
4. Click into any URL's card to see its full check history and a response-time chart on a dedicated page.
5. Delete a URL to confirm it stops showing up and stops being checked going forward.

Checks run every 60 seconds, so give it a minute after adding a URL to see its first real result.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/urls` | Register a new URL to monitor (`{ "url": "https://..." }`) |
| `GET` | `/api/urls` | List monitored URLs with their latest check, paginated (`?page=&limit=`) |
| `GET` | `/api/urls/:id` | Get a single URL with its latest check |
| `GET` | `/api/urls/:id/checks` | Paginated check history for one URL (`?page=&limit=`) |
| `DELETE` | `/api/urls/:id` | Stop monitoring a URL |
| `GET` | `/health` | Confirms the backend can reach Postgres |

## Project structure

```
backend/
  src/
    server.js               # Express entry point
    db/                     # pg pool, migration runner, migration SQL files
    routes/                 # HTTP routing only, no logic
    handlers/               # validation + queries for each route
    services/                # scheduler, response envelope, shared helpers

frontend/
  src/
    api/                    # all fetch calls to the backend
    hooks/                  # polling + data-fetching logic (useUrls, useUrlChecks)
    components/             # presentational UI pieces
    pages/                  # Dashboard and per-URL history page

docker-compose.yml          # postgres + backend + frontend, one command to run all three
```

## Deployment sketch (illustrative only)

This app is built and tested for local Docker Compose, not for production. If it had to move to AWS, the shape would roughly be:

- Backend → **ECS Fargate** service (the same Docker image, just running in a container service instead of on a laptop)
- Frontend → either a second small **ECS Fargate** service, or a static build pushed to **S3 + CloudFront**
- Database → managed **RDS Postgres** instead of the Postgres container
- An **Application Load Balancer** in front of the backend so the frontend has a stable API URL to call

This is a rough sketch, not a real deployment there's no VPC design, no secrets management, no autoscaling policy, no WAF. A one-paragraph Terraform snippet for illustration:

```hcl
resource "aws_ecs_service" "backend" {
  name            = "uptime-monitor-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"
}

resource "aws_db_instance" "postgres" {
  engine         = "postgres"
  instance_class = "db.t3.micro"
  allocated_storage = 20
}

resource "aws_lb" "backend" {
  name               = "uptime-monitor-alb"
  load_balancer_type = "application"
}
```

Not meant to be applied as-is it's here to show the intended shape of a real deployment, not a finished one.

## AI collaboration

This project was built with heavy use of Claude Code, phase by phase. See [`AI_LOG.md`](AI_LOG.md) for the actual prompts, the reasoning behind architecture decisions, and the real course corrections made along the way.
