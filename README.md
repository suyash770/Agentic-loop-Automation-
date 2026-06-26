# NexusEngine Workflow Engine

A full-stack workflow automation platform featuring a polling background task worker, standard REST APIs, and a premium React-based Control Room with a glassmorphic dashboard.

---

## Features

- **Express Backend**: Hosts the API endpoints and coordinates workflow orchestration.
- **Background Polling Worker**: A dedicated background polling engine that retrieves and executes pending runs sequentially.
- **Robust Execution Logic**:
  - **HTTP Node**: Connects external APIs with automated retries.
  - **Web Scraper Node**: Spawns a headless browser via Puppeteer to extract web content dynamically.
  - **Data Transformer Node**: Formats and parses JSON payloads on the fly.
- **MongoDB Storage**: Stores workflow configurations, execution logs, and detailed node-level telemetry.
- **Vibrant React Frontend (Control Room)**:
  - Glassmorphic interface with styled dashboards.
  - Interactive Canvas Workflow Editor.
  - Live Execution Monitoring and step-by-step Log Debugger.

---

## Directory Structure

This monorepo is set up using standard `npm workspaces`:

```text
Agentic-loop/
├── package.json          # Monorepo configuration
├── package-lock.json
├── context.md            # Detailed system specifications
├── backend/              # Node/Express API server & Polling worker
└── frontend/             # Vite + React + Tailwind v4 Dashboard
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js** (v18 or higher)
- **MongoDB** running locally (defaults to `mongodb://localhost:27017/workflow-engine`) or configured via `MONGODB_URI` environment variable.

### Installation

From the project root directory, install the monorepo dependencies:

```bash
npm install
```

### Running the Services

#### 1. Start the Backend
The backend server runs the Express API and starts the background task worker automatically.

```bash
cd backend
npm run dev
```

#### 2. Start the Frontend
The frontend runs a Vite development server.

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173` to open the Control Room dashboard.

---

## API Endpoints

### Workflow CRUD
- `GET /api/workflows` — Retrieve all workflows.
- `GET /api/workflows/:id` — Get details of a specific workflow.
- `POST /api/workflows` — Create a new workflow.
- `PUT /api/workflows/:id` — Update workflow nodes or state.
- `DELETE /api/workflows/:id` — Delete a workflow.

### Webhook Execution Triggers
- `POST /api/webhooks/:workflowId` — Triggers a workflow by scheduling a `Pending` execution with the request body as `triggerData`.
