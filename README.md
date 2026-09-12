# distributed-sat

A distributed SAT (satisfiability) solver built with React, Express, Redis, BullMQ, and PostgreSQL.

A Boolean formula entered in the browser is split into chunks of its `2^n` assignment search space. Chunks are distributed through a Redis-backed BullMQ queue and solved by worker processes. PostgreSQL tracks job and chunk progress, while Redis handles result caching and duplicate-solve locking.

## Architecture

```text
frontend (React + Vite)
          │
          │ POST /api/solve
          ▼
    backend API (Express)
          │
     ┌────┴────┐
     │         │
     ▼         ▼
 Postgres    Redis
 jobs +      BullMQ queue
 chunks      result cache
 progress    solve locks
                │
                ▼
         BullMQ workers
                │
                ▼
          solveChunk(...)
          brute-force range
```

## How It Works

1. The frontend submits a Boolean formula and optional chunk size.
2. The API hashes the formula and checks Redis for a cached result.
3. A Redis solve lock prevents the same formula from being solved concurrently.
4. The `2^n` assignment search space is split into chunks and stored in PostgreSQL.
5. Each chunk is pushed to the BullMQ queue.
6. Worker processes pick up chunks and brute-force their assigned mask ranges.
7. If a worker finds a satisfying assignment, the parent job completes with that solution.
8. If all chunks finish without a solution, the formula is marked unsatisfiable.
9. The result is cached in Redis and the solve lock is released.
10. The frontend polls the API and displays live per-chunk progress and worker assignments.

Example formula:

```json
{
  "formula": [["A", "!B"], ["B"], ["!A", "B"]],
  "chunkSize": 8
}
```

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, TanStack Query
- **Backend:** Node.js, TypeScript, Express, Zod
- **Queue:** BullMQ + Redis
- **Database:** PostgreSQL + Drizzle ORM
- **Infrastructure:** Docker Compose

## Project Structure

```text
backend/
├── src/
│   ├── sat/          # Formula types, evaluation, solver, chunk splitting
│   ├── queue/        # BullMQ queue + Redis connection
│   ├── workers/      # SAT worker
│   ├── services/     # PostgreSQL job/chunk persistence
│   ├── controllers/  # Request handlers
│   ├── routes/       # API routes
│   ├── schemas/      # Zod validation
│   ├── middlewares/  # Rate limit + error handling
│   └── utils/        # Redis cache + solve lock
├── drizzle/          # Database migrations
└── scripts/
    └── concurrency-probe.ts

frontend/
└── src/
    ├── components/solver/  # Formula editor + live chunk dashboard
    ├── hooks/              # Solve polling
    ├── lib/                # API client + formatting
    └── types/              # Frontend types
```

## Prerequisites

- Node.js 20+
- Docker

> Developed with Node.js 24.

## Setup

### 1. Start Redis and PostgreSQL

```bash
docker compose up -d
```

### 2. Configure the backend

Create `backend/.env`:

```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/distributed_sat
```

Optionally set `WORKER_ID` to identify a worker in the dashboard.

Optionally create `frontend/.env` to point the frontend at a non-default API (it defaults to `http://localhost:3000/api`):

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Install dependencies and initialize the database

```bash
cd backend
npm install
npm run db:push
```

### 4. Start the API

```bash
npm run dev
```

The API runs on port `3000` by default.

### 5. Start a worker

In another terminal:

```bash
cd backend
npx tsx src/workers/satWorker.ts
```

Run multiple worker processes for actual CPU parallelism.

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on port `5173` by default and calls the API at `http://localhost:3000/api`.

## API

All solver endpoints are mounted under `/api`.

| Method | Endpoint                   | Description                                 |
| ------ | -------------------------- | ------------------------------------------- |
| `POST` | `/api/solve`               | Submit a formula for solving                |
| `GET`  | `/api/solve/:jobId`        | Get job status, progress, and result        |
| `GET`  | `/api/solve/:jobId/chunks` | Get per-chunk status and worker assignments |
| `GET`  | `/health`                  | Health check                                |

### `POST /api/solve`

```json
{
  "formula": [["A", "!B"], ["B"], ["!A", "B"]],
  "chunkSize": 8
}
```

- Literals are a single capital letter (A-Z), optionally prefixed with `!` for negation; anything else is rejected with `400 Invalid formula`.
- `chunkSize` is optional and specifies the number of assignments processed by each chunk; an integer between 1 and 4096. If omitted, the backend picks a size automatically.
- Rate limited to 100 requests per minute per IP; exceeding the limit returns `429`.

The API may return:

- A cached result
- A response indicating the formula is already being solved
- A new job with its chunk information

## Scripts

### Backend

Run from `backend/`.

| Command               | Description                 |
| --------------------- | --------------------------- |
| `npm run dev`         | Start API with tsx watch    |
| `npm run build`       | Compile TypeScript          |
| `npm run typecheck`   | Typecheck                   |
| `npm run test`        | Run Vitest                  |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate`  | Apply migrations            |
| `npm run db:push`     | Push schema to PostgreSQL   |
| `npm run db:studio`   | Open Drizzle Studio         |

### Frontend

Run from `frontend/`.

| Command             | Description           |
| ------------------- | --------------------- |
| `npm run dev`       | Start Vite dev server |
| `npm run build`     | Build for production  |
| `npm run lint`      | Run ESLint            |
| `npm run format`    | Run Prettier          |
| `npm run typecheck` | Typecheck             |

## Known Limitation

The worker currently uses:

```ts
SAT_WORKER_CONCURRENCY = 2
```

However, `solveChunk` is synchronous and CPU-bound. Because Node.js runs JavaScript on a single event loop, two CPU-heavy chunks cannot execute in parallel within the same worker process.

Therefore, **actual CPU parallelism currently comes from running multiple worker processes**:

```text
Worker 1 ──► Chunk A
Worker 2 ──► Chunk B
Worker 3 ──► Chunk C
```

BullMQ does honor the setting: it activates two jobs at once, so the async database and Redis bookkeeping overlaps, but the brute-force solving itself still runs serially inside one process.

Reproduce and measure this against a live Redis:

```bash
cd backend
npx tsx scripts/concurrency-probe.ts
```

A future improvement would be moving `solveChunk` into Node.js `worker_threads` or child processes to achieve true in-process CPU parallelism.
