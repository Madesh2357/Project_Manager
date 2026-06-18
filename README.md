# Project Management System

A full-stack web application for managing projects and tasks with user authentication, a dashboard, search/filtering, and role-based data isolation.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, React Router        |
| Backend  | Node.js, Express 5                  |
| Database | PostgreSQL with Prisma ORM            |
| Auth     | JWT + bcrypt password hashing         |

## Features

- **User Authentication** — Register, login, logout with JWT tokens
- **Project Management** — Full CRUD with status tracking and date ranges
- **Task Management** — Create, edit, delete, and mark tasks as completed
- **Dashboard** — Real-time statistics (projects, tasks, completion rates)
- **Search & Filtering** — Search by name, filter by status and priority
- **Security** — bcrypt hashing, JWT auth, input validation, rate limiting, authorization checks
- **Bonus** — Docker support, pagination, sorting, unit tests

## Project Structure

```
Project_Manager/
├── backend/           # Express REST API
│   ├── prisma/        # Database schema
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── utils/
│   └── tests/
├── frontend/          # React SPA
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── docs/              # API & schema documentation
└── docker-compose.yml
```

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or use Docker)

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL and backend
docker-compose up -d

# In a separate terminal — frontend
cd frontend
npm install
npm run dev
```

### Option 2: Manual Setup

#### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE project_manager;
```

#### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

npm install
npx prisma generate
npx prisma db push
npm run dev
```

The API runs at `http://localhost:5000`.

#### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Description                          | Example                                              |
|------------------|--------------------------------------|------------------------------------------------------|
| `PORT`           | Server port                          | `5000`                                               |
| `NODE_ENV`       | Environment                          | `development`                                        |
| `DATABASE_URL`   | PostgreSQL connection string         | `postgresql://user:pass@localhost:5432/project_manager` |
| `JWT_SECRET`     | Secret key for signing JWTs          | `your-secret-key`                                    |
| `JWT_EXPIRES_IN` | Token expiration                     | `7d`                                                 |
| `FRONTEND_URL`   | Allowed CORS origin                  | `http://localhost:5173`                              |

### Frontend (`frontend/.env`)

| Variable       | Description     | Example                      |
|----------------|-----------------|------------------------------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api`  |

## Running Tests

```bash
cd backend
# Ensure DATABASE_URL points to a test database
npm test
```

## API Documentation

See [docs/API.md](docs/API.md) for the complete API reference.

## Database Schema

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for the ER diagram and table definitions.

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT authentication on all protected routes
- Users can only access their own projects and tasks
- Input validation on all endpoints via express-validator
- Rate limiting on auth endpoints (20 req/15 min per IP)
- SQL injection prevention via Prisma ORM parameterized queries
- Sensitive fields (passwords) excluded from API responses

## Deployment URL

> Deploy the application to a hosting provider (e.g., Render, Railway, Vercel) and add the URL here.

## License

MIT
