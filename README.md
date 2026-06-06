<div align="center">
  <h1>Taxpilot 📊🤖</h1>
  <p>An intelligent, full-stack tax preparation and learning workspace featuring an AI Tax Tutor, real-time GST/ITR/TDS validation, and mock e-Filing portals.</p>
</div>

---

## 📖 Overview

**Taxpilot** (formerly TaxPro) is a comprehensive tax preparation platform designed to simplify and teach Indian taxation workflows. Built with a modern Next.js frontend and a robust FastAPI backend, it provides a realistic workspace for preparing returns, validating data against tax rules, and simulating e-Filing processes. 

It features **Taxpilot AI Tutor**, a context-aware assistant that guides users through complex tax scenarios, explains rules, and helps troubleshoot validation errors in real-time.

## ✨ Key Features

- **GST Workspace:** Prepare GSTR-1, GSTR-3B, and GSTR-9 with real-time structural validation (HSN checks, GSTIN formatting) via the **Spectrum Validation Engine**.
- **Taxpilot AI Tutor:** A built-in, context-aware AI assistant that provides live guidance, explains tax rules, and helps troubleshoot validation errors as you work.
- **Mock e-Filing Portals:** Simulate pushing data to live tax portals, generating ARNs (Application Reference Numbers), and filing returns.
- **Income Tax Returns (ITR) & TDS:** End-to-end workflows for ITR computation and TRACES mock filings.
- **Multi-tenant Admin & Dashboard:** Manage multiple student/user cases and track filing progress across different taxation modules.

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), TailwindCSS, TypeScript
- **Backend:** FastAPI (Python), PostgreSQL, Redis, Celery (for asynchronous tasks)
- **Deployment:** Fully containerized with Docker and Nginx reverse proxy.

## 🚀 Getting Started

### Prerequisites

Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.

### Running the Application

1. **Clone the repository:**
   ```bash
   git clone https://github.com/quantropic-off/Taxpilot.git
   cd Taxpilot
   ```

2. **Start the services:**
   Run the application using Docker Compose. This will spin up the database, Redis, backend, Celery worker, and Nginx proxy.
   ```bash
   docker-compose up -d --build
   ```

3. **Run the frontend:**
   *(Note: The frontend is currently run locally via Node)*
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API Docs: `http://localhost:8000/docs`

## 🐳 Docker Architecture

- `db`: PostgreSQL database for persistent storage.
- `redis`: Message broker for Celery and caching.
- `backend`: FastAPI server running on port 8000.
- `celery_worker`: Background task processor for heavy validations and mock portal integrations.
- `nginx`: Reverse proxy to route API requests.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/quantropic-off/Taxpilot/issues).

## 📄 License

This project is licensed under the MIT License.
