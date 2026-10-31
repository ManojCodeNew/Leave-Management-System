# Exelon LMS — Leave Management System

A web-based **Leave Management System (LMS)** designed to streamline employee leave applications, approval workflows, leave balance accounting, and administrative oversight.

---

## 1. Project Overview

The Leave Management System provides a role-based portal for organizations:
- **Employee Portal**: Apply for leave, monitor live leave balance, track application statuses (`PENDING`, `APPROVED`, `REJECTED`), and review leave history.
- **Admin Portal**: Review employee leave applications, approve or reject pending requests with feedback, monitor organization leave metrics, and track employee leave allocations.

The system ensures strict integrity in leave accounting:
- Approved leaves automatically deduct from the employee's available leave balance.
- Rejected leaves preserve the employee's leave balance.
- Employees cannot submit leave requests beyond their available balance.
- Administrators cannot approve leave requests exceeding available balance.
- Prevention of duplicate deductions for already processed applications.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Server State & Caching**: TanStack Query (React Query v5)
- **Global State Management**: Redux Toolkit & React Redux
- **HTTP Client**: Axios (Centralized instance with JWT interceptors)
- **Icons**: Lucide React

### Backend
- **Runtime & Framework**: Node.js & Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **Security**: Role-Based Access Control (RBAC), CORS, input validation

---

## 3. Project Architecture

```text
React Frontend (Vite + TS)
   │
   ├─► Redux Toolkit (Client Auth & User Session)
   ├─► TanStack Query (Server State, Caching, Mutation Invalidation)
   └─► Axios Instance (JWT Interceptor, Base URL)
         │
         ▼  (REST API / JSON)
Express Backend (Node.js + TS)
   │
   ├─► JWT Authentication & Role-Based Authorization Middleware
   ├─► Input Validation & Business Balance Accounting
   └─► Mongoose Models (User, LeaveApplication)
         │
         ▼
MongoDB Atlas Cloud Database
```

---

## 4. Folder Structure

```text
Task Project/
│
├── doc/
│   ├── AGENTS.md                  # Development guidelines and coding standards
│   └── PROJECT_REQUIREMENTS.md    # Business & functional requirements
│
├── server/                        # Express Backend Service
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── leave.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts # JWT verification & role authorization
│   │   │   └── error.middleware.ts
│   │   ├── models/
│   │   │   ├── leave-application.model.ts
│   │   │   └── user.model.ts
│   │   ├── routes/
│   │   │   ├── admin.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── leave.routes.ts
│   │   ├── seed.ts                # Database seeder with sample accounts
│   │   └── server.ts              # Express application entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── src/                           # React Frontend Application
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/
│   │   ├── admin-dashboard/       # Admin-specific components
│   │   │   ├── admin-leaves-table.tsx
│   │   │   ├── employee-statistics.tsx
│   │   │   ├── leave-statistics.tsx
│   │   │   └── pending-requests.tsx
│   │   ├── employee-dashboard/    # Employee-specific components
│   │   │   ├── leave-balance-card.tsx
│   │   │   ├── leave-history-table.tsx
│   │   │   ├── leave-request-form.tsx
│   │   │   └── recent-leave-requests.tsx
│   │   └── ui/                    # Reusable Global UI Components
│   │       ├── buttons/
│   │       ├── inputs/
│   │       ├── modals/
│   │       ├── card.tsx
│   │       ├── empty-state.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── navbar.tsx
│   │       └── status-badge.tsx
│   ├── config/
│   │   ├── colors.ts              # Theme tokens & status color mappings
│   │   ├── data.ts                # App constants, status options, nav links
│   │   ├── endpoints.ts           # Centralized API endpoint routes
│   │   ├── icons.ts               # Centralized icon exports
│   │   └── images.ts              # Centralized image exports
│   ├── hooks/
│   │   ├── use-admin.ts           # Admin dashboard & leave mutation queries
│   │   ├── use-auth.ts            # Authentication hook with Redux integration
│   │   └── use-leave.ts           # Leave balance, history, apply leave queries
│   ├── navigators/
│   │   ├── app-navigator.tsx      # Main application router
│   │   └── protected-route.tsx    # Role-based route protection
│   ├── pages/
│   │   ├── admin-dashboard.tsx
│   │   ├── admin-employees.tsx
│   │   ├── admin-leaves.tsx
│   │   ├── apply-leave.tsx
│   │   ├── employee-dashboard.tsx
│   │   ├── leave-history.tsx
│   │   ├── login.tsx
│   │   └── not-found.tsx
│   ├── redux/
│   │   ├── slices/
│   │   │   └── auth.slice.ts
│   │   ├── hooks.ts
│   │   └── store.ts
│   ├── services/
│   │   ├── api/
│   │   │   └── axios-instance.ts  # Axios client with interceptors
│   │   ├── admin.service.ts
│   │   ├── auth.service.ts
│   │   ├── employee.service.ts
│   │   └── leave.service.ts
│   ├── types/
│   │   ├── admin.types.ts
│   │   ├── auth.types.ts
│   │   ├── employee.types.ts
│   │   └── leave.types.ts
│   ├── utils/
│   │   ├── date.utils.ts
│   │   └── format.utils.ts
│   ├── validation/
│   │   ├── auth.validation.ts
│   │   └── leave.validation.ts
│   ├── app.tsx                    # Root application component
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 5. Local Setup and Installation

### Prerequisites
- Node.js (v18.x or v20.x or higher)
- npm (v9.x or higher)
- MongoDB instance or MongoDB Atlas Connection URI

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd "Task Project"
```

### Step 2: Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.r07g3vq.mongodb.net/leave_management_db?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_leave_management_system_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Install Dependencies
```bash
# Install frontend root dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 4: Seed Database with Demo Accounts
Run the seed script from the root to initialize sample admin and employee accounts:
```bash
npm run seed
```

### Step 5: Start Development Servers
You can run both frontend and backend concurrently from the root directory:
```bash
npm run dev:all
```
Or start them individually in separate terminals:
- **Backend**: `npm run server` (runs on `http://localhost:5000`)
- **Frontend**: `npm run dev` (runs on `http://localhost:5173`)

---

## 6. Default Demo Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@exelon.com` | `admin123` | Full administrative review and approval access |
| **Employee** | `employee@exelon.com` | `employee123` | Manoj Poojary — Software Engineering |
| **Employee** | `sarah.smith@exelon.com` | `employee123` | Sarah Smith — UI/UX Design |
| **Employee** | `alex.turner@exelon.com` | `employee123` | Alex Turner — Quality Assurance |

> The login page also features **1-Click Quick Demo Login** buttons for instant testing.

---

## 7. API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login`
  - Body: `{ "email": "employee@exelon.com", "password": "employee123" }`
  - Response: `{ "success": true, "data": { "token": "...", "user": { ... } } }`
- `GET /api/auth/me` (Protected)
  - Returns authenticated user details and current leave balance.
- `POST /api/auth/logout`
  - Clears session.

### Employee Leaves (`/api/leaves`)
- `GET /api/leaves/balance` (Protected: Employee)
  - Returns leave allocation, used days, available balance, and pending requests.
- `POST /api/leaves` (Protected: Employee)
  - Body: `{ "startDate": "2026-12-01", "endDate": "2026-12-03", "reason": "Medical consultation" }`
  - Validates dates, calculates duration, checks available balance, creates `PENDING` request.
- `GET /api/leaves?status=PENDING` (Protected: Employee)
  - Returns list of employee's own leave applications.
- `GET /api/leaves/:id` (Protected)
  - Returns detailed application by ID.

### Admin Management (`/api/admin`)
- `GET /api/admin/dashboard` (Protected: Admin)
  - Returns organization metrics: total employees, total requests, pending, approved, rejected, and approved days.
- `GET /api/admin/leaves?status=PENDING&search=smith` (Protected: Admin)
  - Returns all submitted leave applications with employee population.
- `POST /api/admin/leaves/:id/approve` (Protected: Admin)
  - Body: `{ "adminComment": "Approved. Have a great vacation!" }`
  - Validates employee available balance, deducts balance accurately, marks status `APPROVED`.
- `POST /api/admin/leaves/:id/reject` (Protected: Admin)
  - Body: `{ "adminComment": "Staffing shortfall during this period." }`
  - Preserves employee balance, marks status `REJECTED`.
- `GET /api/admin/employees` (Protected: Admin)
  - Returns all registered employees, departments, allocations, used days, and request statistics.

---

## 8. Deployment Guide

### Option A: Frontend on Vercel
1. Push code to GitHub.
2. Import repository in [Vercel](https://vercel.com).
3. Set Framework Preset to **Vite**.
4. Set Environment Variable:
   - `VITE_API_URL` = `<your-deployed-backend-url>`
5. Click **Deploy**.

### Option B: Backend on Render or Railway
1. Create a Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Connect your GitHub repository.
3. Configure settings:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Set Environment Variables:
   - `PORT` = `5000`
   - `MONGODB_URI` = `<your-mongodb-atlas-uri>`
   - `JWT_SECRET` = `<secure-secret-key>`
   - `CLIENT_URL` = `<your-deployed-frontend-url>`
   - `NODE_ENV` = `production`
5. Click **Deploy**.

---

## 9. License

This project was built for Exelon Circuits Pvt. Ltd. assessment according to the project specifications.

