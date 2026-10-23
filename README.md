# Full-Stack Auto-Saving Notes App (Django + React + PostgreSQL)

A full-stack note-taking web application featuring JWT authentication, user-isolated notes, debounced real-time saving, and automatic tab-close persistence (`keepalive`).

## Quick Start (Docker Compose — Recommended)

1. **Clone the repository and configure environment variables:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd django-react-notes
   cp .env.example .env
   ```

2. **Start PostgreSQL, Django, and React:**
   ```bash
   docker compose up --build -d
   ```

3. **Create a user account to log in:**
   ```bash
   docker compose exec backend python manage.py createsuperuser
   ```

4. **Open the app:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://127.0.0.1:8000/api/notes/`

---

## Local Development Setup (Without Docker for Code)

If you prefer running Django and React directly in your terminal:

1. **Start PostgreSQL via Docker (or local Postgres):**
   ```bash
   cp .env.example .env
   docker compose up -d db
   ```

2. **Run the Django Backend:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

3. **Run the React Frontend (in a second terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```