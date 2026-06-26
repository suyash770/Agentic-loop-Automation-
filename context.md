# Workflow Engine - Context & Documentation

This document serves as the high-level context of the **NexusEngine Workflow Project**, capturing its requirements, technology stack, directory structure, data schemas, engine architecture, and execution details.

---

## 1. Project Overview

The **Workflow Engine** is a full-stack system featuring:
1. **Express Backend**: Receives triggers and executes workflows sequentially in the background via a polling task worker.
2. **MongoDB Database**: Stores schemas for workflows, execution tracking, and detailed step-by-step logs.
3. **React Frontend (Control Room)**: Provides a premium dashboard with custom styling, glassmorphism UI, a canvas workflow editor, an execution monitor, and a debugger.

---

## 2. Directory Structure

The project is configured as a Monorepo using `npm workspaces`:

```text
Agentic-loop/
├── package.json (Monorepo configuration)
├── package-lock.json
├── context.md (This file)
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts (Server entry & starts background polling worker)
│       ├── config/
│       │   └── db.ts (MongoDB database connection setup)
│       ├── models/
│       │   ├── Workflow.ts (Workflow definition blueprint schema)
│       │   ├── Execution.ts (Workflow run tracker schema)
│       │   └── ExecutionLog.ts (Node-level execution debugger logs schema)
│       ├── routes/
│       │   ├── workflows.ts (Standard Express API for Workflow CRUD)
│       │   └── webhooks.ts (Endpoint to queue webhook trigger executions)
│       └── worker/
│           ├── pollingWorker.ts (Detached loop to find & lock pending runs)
│           └── executionLogic.ts (Core runner for nodes with axios & puppeteer)
└── frontend/
    ├── package.json
    ├── vite.config.ts (Vite configuration using Tailwind v4 plugin)
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx (React Router Setup)
        ├── App.css
        ├── index.css (Imports Tailwind v4 styles)
        ├── components/
        │   └── Sidebar.tsx (Dashboard sidebar navigation)
        └── pages/
            ├── Dashboard.tsx (Main dashboard overview with system stats)
            ├── WorkflowEditor.tsx (Step-by-step canvas editor for nodes)
            ├── ExecutionList.tsx (Live execution tracker grid)
            └── Debugger.tsx (Detailed node execution logs and inputs/outputs)
```

---

## 3. Technology Stack & Key Dependencies

### Backend
- **Runtime & Language**: Node.js, TypeScript (typed schema models and integrations)
- **API Framework**: Express (`express@^5.2.1`)
- **Database ORM**: Mongoose (`mongoose@^9.7.2`)
- **Web Scraping Node**: Puppeteer (`puppeteer@^25.2.1`)
- **HTTP Node**: Axios (`axios@^1.18.1`)
- **Dev Tools**: `ts-node`, `nodemon`, `@types/node`

### Frontend
- **Framework**: React 19 (`react@^19.2.7`, `react-dom@^19.2.7`)
- **Build System**: Vite 8 (`vite@^8.1.0`)
- **Styling**: Tailwind CSS v4 (`tailwindcss@^4.3.1`, `@tailwindcss/vite@^4.3.1`)
- **Icons**: Lucide React (`lucide-react@^1.21.0`)
- **Routing**: React Router DOM v7 (`react-router-dom@^7.18.0`)

---

## 4. Database Models & Schema Specifications

The engine relies on three strict Mongoose schemas:

### A. Workflow Schema (`Workflow.ts`)
Stores the sequence of nodes that compose a workflow template.
- `name`: string (required)
- `isActive`: boolean (default: true)
- `nodes`: Array of Workflow Nodes:
  - `id`: string (required)
  - `type`: string (`HTTP` | `Scraper` | `Transformer`) (required)
  - `config`: Mixed (default: {})
  - `next`: Array of strings (references downstream nodes)

### B. Execution Schema (`Execution.ts`)
Tracks the status of a specific workflow run.
- `workflowId`: ObjectId (ref: 'Workflow')
- `status`: string (`Pending` | `Running` | `Success` | `Failed`) (default: 'Pending')
- `startedAt`: Date
- `completedAt`: Date
- `triggerData`: Mixed (initial data sent to trigger the run)

### C. ExecutionLog Schema (`ExecutionLog.ts`)
Debugger logs recorded for each node executed in a run.
- `executionId`: ObjectId (ref: 'Execution')
- `workflowId`: ObjectId (ref: 'Workflow')
- `nodeId`: string (required)
- `status`: string (`Success` | `Failed`) (required)
- `inputData`: Mixed (default: {})
- `outputData`: Mixed (default: {})
- `error`: string (contains error stack/message if node fails)
- `startedAt`: Date
- `completedAt`: Date

---

## 5. Core Engine & Execution Logic

### Polling Worker (`pollingWorker.ts`)
1. Runs a background loop via `setInterval` every **5 seconds**.
2. Avoids overlapping execution cycles with an `isPolling` flag.
3. Queries MongoDB for the oldest `Pending` execution:
   ```typescript
   Execution.findOneAndUpdate(
     { status: 'Pending' },
     { status: 'Running', startedAt: new Date() },
     { new: true, sort: { createdAt: 1 } }
   )
   ```
4. Invokes `executeWorkflow(execution)` in the background without blocking the polling interval.

### Execution Logic (`executionLogic.ts`)
Processes each node in the workflow sequence sequentially, updating state and passing data forward:

1. **HTTP Node**:
   - Performs API calls (`GET` / `POST` / etc.) using `axios`.
   - Implements robust retry logic: Retries up to **3 times** with a **2-second delay** between attempts if a network error occurs.
2. **Web Scraper Node**:
   - Spawns a headless browser instance using `puppeteer`.
   - Navigates to target URL, waiting for `networkidle2` (up to 30 seconds).
   - If a `selector` is configured, it extracts text from the selector; otherwise, it returns page title and final URL.
3. **Data Transformer Node**:
   - Maps or subsets incoming JSON payloads based on an `extractKey` configuration.
   - Appends metadata timestamps (`_transformedAt`).
4. **Execution Failure Recovery**:
   - If any node execution fails after retries, the engine records the failure status/message in `ExecutionLog`, updates the main `Execution` record to `Failed`, sets `completedAt`, and halts downstream executions.

---

## 6. API Endpoints

### Workflow Management
- `GET /api/workflows`: List all workflows sorted by creation date.
- `GET /api/workflows/:id`: Retrieve single workflow details.
- `POST /api/workflows`: Create a new workflow.
- `PUT /api/workflows/:id`: Update nodes or state of an existing workflow.
- `DELETE /api/workflows/:id`: Remove a workflow.

### Webhook Triggers
- `POST /api/webhooks/:workflowId`: Triggers a workflow by creating a `Pending` execution using the request payload as `triggerData`. Returns `200 OK` and queues the execution immediately.

---

## 7. Local Development Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (defaulting to `mongodb://localhost:27017/workflow-engine`) or configured via `MONGODB_URI` env variable.

### Installation
From the root workspace folder, install all workspace packages:
```bash
npm install
```

### Running Backend
```bash
cd backend
npm run dev
```

### Running Frontend
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
