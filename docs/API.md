# API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success

```json
{
  "success": true,
  "message": "Optional message",
  "data": { }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Authentication

Rate limited to **20 requests per 15 minutes** per IP on register/login.

### POST /auth/register

Register a new user.

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-06-18T00:00:00.000Z"
    },
    "token": "jwt_token"
  }
}
```

### POST /auth/login

Authenticate a user.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):** Same structure as register.

### POST /auth/logout

Revoke the current JWT token. **Requires authentication.**

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /auth/me

Get the authenticated user's profile. **Requires authentication.**

---

## Projects

All project endpoints require authentication. Users can only access their own projects.

### GET /projects

List all projects for the authenticated user.

**Query Parameters:**

| Parameter  | Type   | Description                                      |
|------------|--------|--------------------------------------------------|
| search     | string | Search projects by name (case-insensitive)       |
| status     | enum   | NOT_STARTED, IN_PROGRESS, COMPLETED              |
| page       | int    | Page number (default: 1)                         |
| limit      | int    | Items per page (default: 20, max: 100)           |
| sortBy     | string | name, status, createdAt, startDate, endDate      |
| sortOrder  | string | asc or desc (default: desc)                      |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "Website Redesign",
        "description": "Redesign company website",
        "status": "IN_PROGRESS",
        "startDate": "2026-01-01T00:00:00.000Z",
        "endDate": "2026-06-30T00:00:00.000Z",
        "createdDate": "2026-01-01T00:00:00.000Z",
        "taskCount": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### GET /projects/:id

Get project details including tasks.

### POST /projects

Create a new project.

**Request Body:**

```json
{
  "name": "Website Redesign",
  "description": "Optional description",
  "status": "NOT_STARTED",
  "startDate": "2026-01-01",
  "endDate": "2026-06-30"
}
```

### PUT /projects/:id

Update a project. All fields are optional.

### DELETE /projects/:id

Delete a project and all its tasks.

---

## Tasks

All task endpoints require authentication. Users can only access tasks belonging to their projects.

### GET /tasks

List tasks for the authenticated user.

**Query Parameters:**

| Parameter  | Type   | Description                                      |
|------------|--------|--------------------------------------------------|
| search     | string | Search tasks by name (case-insensitive)          |
| status     | enum   | PENDING, IN_PROGRESS, COMPLETED                  |
| priority   | enum   | LOW, MEDIUM, HIGH                                |
| projectId  | uuid   | Filter by project                                |
| page       | int    | Page number (default: 1)                         |
| limit      | int    | Items per page (default: 20, max: 100)           |
| sortBy     | string | name, status, priority, dueDate, createdAt       |
| sortOrder  | string | asc or desc (default: desc)                      |

### GET /tasks/:id

Get a single task.

### POST /tasks

Create a new task.

**Request Body:**

```json
{
  "name": "Design homepage",
  "description": "Create wireframes",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-03-15",
  "projectId": "project-uuid"
}
```

### PUT /tasks/:id

Update a task. Use `{ "status": "COMPLETED" }` to mark as completed.

### DELETE /tasks/:id

Delete a task.

---

## Dashboard

### GET /dashboard/stats

Get dashboard statistics for the authenticated user.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalProjects": 5,
    "totalTasks": 20,
    "completedTasks": 8,
    "pendingTasks": 10,
    "projectsInProgress": 2
  }
}
```

---

## Health Check

### GET /health

```json
{
  "success": true,
  "message": "API is running"
}
```

---

## HTTP Status Codes

| Code | Description                    |
|------|--------------------------------|
| 200  | Success                        |
| 201  | Created                        |
| 400  | Validation error               |
| 401  | Unauthorized                   |
| 404  | Not found                      |
| 409  | Conflict (duplicate email)     |
| 429  | Too many requests (rate limit) |
| 500  | Internal server error          |
