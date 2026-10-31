# LeaveMate — Enterprise Leave Management System

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![State](https://img.shields.io/badge/State-Redux%20Toolkit%20%7C%20TanStack%20Query-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%203-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern, full-stack **Enterprise Leave Management System (LMS)** designed to streamline employee leave applications, supervisor review pipelines, leave quota tracking, and workforce oversight. Engineered with strict business logic enforcement, role-based access control (RBAC), intuitive slide-over drawer UX, and high-performance client-side caching.

---

## 🌐 Live Remote Deployment & Quick Access

The application is deployed and hosted on high-availability cloud infrastructure:

| Component | Hosting Platform | Live URL / Endpoint | Status |
|---|---|---|:---:|
| **Frontend Web App** | **Vercel** (Global Edge CDN) | https://leavemanagementsystemtask.vercel.app/ | 🟢 Live |
| **Backend REST API** | **Render** (Containerized Node.js Web Service) | [https://leave-management-system-5iol.onrender.com](https://leave-management-system-5iol.onrender.com) | 🟢 Live |
| **Cloud Database** | **MongoDB Atlas Cloud** | Multi-Region M0 Replica Cluster | 🟢 Connected |

> **Note for Evaluators**: If hosting platforms spin down idle free-tier instances (cold start), please allow 15–30 seconds for the backend service to resume on the initial request.

---

## 🔑 Pre-Configured Demo Accounts

For immediate evaluation, the database includes verified test accounts. You can log in manually or use the **1-Click Quick Demo Login** buttons directly on the login screen:

| Role | Account Name | Email Address | Password | Department & Quota |
|---|---|---|---|---|
| **Admin** | HR Administrator | `admin@demo.com` | `admin123` | Human Resources (Full Review Access) |
| **Employee** | Manoj Poojary | `employee@demo.com` | `employee123` | Software Engineering (12 Days Available) |
| **Employee** | Sarah Smith | `sarah.smith@demo.com` | `employee123` | UI/UX Design (15 Days Available) |
| **Employee** | Alex Turner | `alex.turner@demo.com` | `employee123` | Quality Assurance (10 Days Available) |

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features & Capabilities](#-key-features--capabilities)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Technology Stack](#-technology-stack)
5. [Monorepo Directory Structure](#-monorepo-directory-structure)
6. [Prerequisites & Local Installation Guide](#-prerequisites--local-installation-guide)
7. [Environment Variables Reference](#-environment-variables-reference)
8. [Comprehensive REST API Reference](#-comprehensive-rest-api-reference)
9. [Remote Deployment Guide (For Independent Developers)](#-remote-deployment-guide-for-independent-developers)
10. [Performance & Engineering Optimizations](#-performance--engineering-optimizations)
11. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🎯 Project Overview

In traditional enterprise settings, leave management is often fragmented across emails, spreadsheets, and paper forms, leading to scheduling conflicts, balance miscalculations, and lack of transparency.

**LeaveMate** eliminates these operational bottlenecks through:
- **An Employee Self-Service Portal**: Staff can apply for single-day or multi-day leaves via an intuitive slide-over drawer, interact with a real-time calendar picker, observe live quota calculations, and monitor request history.
- **An Administrative Portal**: Equips leadership and HR managers with real-time decisioning workflows (Approve/Reject with feedback), organization-wide leave metrics, and workforce allocation visibility.
- **Rigorous Business Rule Enforcement**:
  - Automatically deducts approved leaves from employee balances.
  - Preserves employee balances upon request rejection.
  - Strictly prevents overlapping leave applications against approved dates.
  - Automatically excludes Sundays from leave durations while maintaining Saturdays as eligible working days.
  - Isolates user sessions and cache data on logout, ensuring zero data leakage when switching accounts in shared environments.

---

## ✨ Key Features & Capabilities

### 1. 🔐 Authentication & Session Security (RBAC)
- **JWT-Based Authentication**: Secure token issuance on login with automated injection via Axios request interceptors.
- **Password Protection**: Passwords securely hashed with `bcryptjs` (salt factor 10).
- **Client Route Guarding**: Protected route wrappers redirect unauthenticated visitors to `/login` and block cross-role route tampering.
- **Backend Role Verification**: Every sensitive endpoint independently validates role authorization (`admin` vs `employee`).

### 2. 🚀 1-Click Quick Demo Login
- Provides instant one-click login for Admin and Employee roles directly on the login screen.
- Executes through the standard authentication pipeline (generates legitimate JWT tokens and user records) for 100% authentic behavioral testing.

### 3. 📅 Sunday Exclusion Engine
- **Non-Working Day Rule**: Sundays are strictly treated as non-working days (0 days deducted from leave balance).
- **Calendar & Form Validation**:
  - Sundays cannot be selected as leave start dates or end dates.
  - Sundays appear styled with dashed borders and disabled in the interactive calendar.
- **Duration Calculation**: When applying across weekends (e.g., Saturday to Monday), Saturday counts as 1 day, Sunday counts as 0 days, and Monday counts as 1 day (Total = 2 working days).
- **Saturday Eligibility**: Saturdays remain fully eligible working days per specification.

### 4. 🛡️ Overlap Prevention Engine
- **Strict Anti-Overlap Enforcement**: Employees cannot apply for leave on dates that overlap with any of their previously approved leaves (including partial overlaps).
- **Interactive Calendar Highlighting**: Dates covered by approved leaves are highlighted in green, marked "Approved", and disabled in the calendar picker.
- **Dual-Layer Validation**: Validated on the client before submission and re-validated atomically on the backend Express controller before record creation.

### 5. ⏳ Flexible Date Range & Optional Leave End Date
- **Optional End Date**: If an employee selects only a start date and leaves the end date empty, the system automatically treats the application as a **1-day leave** on the start date.
- **Range Support**: If both start and end dates are selected, duration is calculated across the range excluding Sundays.

### 6. 📊 Real-Time Duration & Quota Callout
- Displays a structured live calculation card as soon as dates are selected:
  - Calculated duration in working days.
  - "Single Day" badge when applicable.
  - Sunday exclusion note informing the user of zero-deduction non-working days.
  - Live available quota counter showing remaining balance.

### 7. 📑 Slide-Over Apply Leave Drawer UI
- Clicking "Apply for Leave" opens a modern slide-over drawer from the right side of the screen (`max-w-2xl` on desktop, full width on mobile).
- Houses an interactive monthly calendar picker, date range inputs, duration breakdown, and justification textarea with responsive padding and spacing.

### 8. 🔄 Synchronized Real-Time Leave History Refresh
- Dedicated refresh button in the Leave History section.
- Refetches the latest records from the backend API while displaying a live loading spinner.
- **Full Dashboard Synchronization**: Invalidates and synchronizes all related TanStack Query caches, instantly updating the employee's available balance card, recent requests, and statistics without a full browser reload.

### 9. 🧹 Multi-User Account Switching & Cache Isolation
- Resolves browser session data leakage when multiple employees log in consecutively on the same machine.
- Logging out completely clears the Redux authentication state, purges localStorage tokens, and **flushes the TanStack Query client cache** (`queryClient.clear()`).
- When Employee B logs in after Employee A, fresh authenticated user information is fetched immediately without displaying cached data from Employee A.

### 10. 👨‍💼 Comprehensive Administrative Decisioning & Analytics
- **Pending Review Pipeline**: Review pending requests with complete applicant profile, dates, working duration, available balance, and justification.
- **Action Modal**: Approve or reject with optional administrative feedback comments.
- **Organizational Analytics**: Real-time KPI cards for Total Employees, Total Requests, Pending Requests, Approved Requests, Rejected Requests, and Total Leave Days Taken.
- **Workforce Directory**: Searchable, paginated table of all registered employees, departments, quotas, used days, available balances, and request breakdowns.

### 11. 🔍 Instant Client-Side Search Filtering
- Real-time instant search across leave history and employee records.
- Filters updated data locally in-memory without unnecessary network requests or loading flicker.

### 12. 📜 TanStack useInfiniteQuery & Automatic Scroll-to-Load
- Listing endpoints (`/api/leaves`, `/api/admin/leaves`, `/api/admin/employees`) return standardized pagination metadata (`totalCount`, `totalPages`, `currentPage`, `limit`, `hasNextPage`, `hasPrevPage`).
- Frontend queries consume TanStack Query's `useInfiniteQuery` paired with an `IntersectionObserver` sentinel. As the user scrolls down the page, subsequent pages are automatically loaded and seamlessly appended.

---

## 🏗️ System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER (SPA)                          │
│                                                                         │
│   React 18  │  Vite  │  TypeScript  │  Tailwind CSS  │  Lucide Icons    │
│                                                                         │
│   ┌───────────────────────────┐       ┌─────────────────────────────┐   │
│   │   Redux Toolkit Store     │       │     TanStack Query v5       │   │
│   │   - Client Auth State     │       │   - Server State & Cache    │   │
│   │   - Token & User Profile  │       │   - Query Invalidation      │   │
│   └─────────────┬─────────────┘       └──────────────┬──────────────┘   │
│                 │                                    │                  │
│                 └─────────────────┬──────────────────┘                  │
│                                   ▼                                     │
│                     Axios Centralized Instance                          │
│                     - Bearer JWT Request Interceptor                    │
│                     - Uniform Error Response Interceptor                │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │  HTTPS / REST JSON
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS BACKEND SERVICE                           │
│                                                                         │
│   Node.js  │  Express 4  │  TypeScript  │  JWT  │  bcryptjs             │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Middlewares: CORS, JSON BodyParser, ErrorHandler, AuthGuard     │   │
│   └───────────────────────────────┬─────────────────────────────────┘   │
│                                   ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Modular Controllers & Route Handlers:                           │   │
│   │ - /api/auth   : Login, Logout, Profile Fetch                    │   │
│   │ - /api/leaves : Balance Engine, Overlap & Sunday Validator      │   │
│   │ - /api/admin  : Review Decisions, KPI Stats, Employee Directory │   │
│   └───────────────────────────────┬─────────────────────────────────┘   │
│                                   ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Mongoose ODM Layer (Schema Validation, Indexes, Timestamps)      │   │
│   └───────────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │  Mongoose TCP (TLS/SSL)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      MONGODB ATLAS CLUSTER (CLOUD)                      │
│                                                                         │
│   Collections:                                                          │
│   ├── users             (Credentials, Roles, Allocations, Balances)     │
│   └── leaveapplications (Dates, Durations, Status, Decision Notes)      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend Architecture
- **Framework**: [React 18](https://react.dev/) (Functional components with hooks)
- **Bundler & Tooling**: [Vite 6](https://vitejs.dev/) with TypeScript for high-speed HMR and production minification
- **State Management**:
  - **Client & Session State**: [Redux Toolkit](https://redux-toolkit.js.org/) + React Redux
  - **Server & Cache State**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
- **Routing**: [React Router DOM v6](https://reactrouter.com/) with nested role-protected route guards
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with PostCSS and Autoprefixer
- **HTTP Client**: [Axios](https://axios-http.com/) with automatic token injection interceptors
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend Architecture
- **Runtime**: [Node.js](https://nodejs.org/) (LTS v18.x / v20.x / v22.x)
- **Framework**: [Express.js 4](https://expressjs.com/) with modular TypeScript architecture
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) with [Mongoose 8](https://mongoosejs.com/)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (JWT) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Security**: CORS origin whitelisting, parameter sanitization, and structured error middlewares
- **Execution Engine**: `tsx` (TypeScript Execute) for zero-compilation development and `tsc` for production builds

---

## 📁 Monorepo Directory Structure

```text
Task Project/
├── .env.example                       # Root frontend environment template
├── .gitignore                         # Git exclusion rules for node_modules & build artifacts
├── BRD.md                             # Comprehensive Business Requirements Document
├── index.html                         # SPA HTML entry point
├── package.json                       # Root monorepo scripts & frontend dependencies
├── postcss.config.js                  # PostCSS plugins configuration
├── README.md                          # Master project documentation
├── tailwind.config.js                 # Tailwind CSS theme extensions
├── tsconfig.json                      # Frontend TypeScript compiler options
├── tsconfig.node.json                 # Node TypeScript config for Vite
├── vercel.json                        # Vercel deployment & SPA routing rewrites configuration
├── vite.config.ts                     # Vite build & development proxy settings
│
├── doc/                               # Technical Specifications & Standards
│   ├── AGENTS.md                      # Engineering guidelines and architectural mandates
│   └── PROJECT_REQUIREMENTS.md        # Core business requirements and evaluation checklist
│
├── server/                            # Backend Express Service
│   ├── .env.example                   # Backend environment template
│   ├── nodemon.json                   # Nodemon development watcher config
│   ├── package.json                   # Backend dependencies & runtime scripts
│   ├── tsconfig.json                  # Backend TypeScript compiler configuration
│   └── src/
│       ├── config/
│       │   └── db.ts                  # Mongoose connection & error handlers
│       ├── controllers/
│       │   ├── admin.controller.ts    # Admin KPIs, reviews, and employee directory logic
│       │   ├── auth.controller.ts     # User login, session fetch, and authentication
│       │   └── leave.controller.ts    # Leave submission, overlap checks, Sunday exclusion
│       ├── middlewares/
│       │   ├── auth.middleware.ts     # JWT authentication & role authorization guards
│       │   └── error.middleware.ts    # Centralized global error handler
│       ├── models/
│       │   ├── leave-application.model.ts # Leave schema with statuses and durations
│       │   └── user.model.ts          # User schema with roles and balance tracking
│       ├── routes/
│       │   ├── admin.routes.ts        # Admin endpoints (/api/admin/*)
│       │   ├── auth.routes.ts         # Auth endpoints (/api/auth/*)
│       │   └── leave.routes.ts        # Leave endpoints (/api/leaves/*)
│       ├── seed.ts                    # Enterprise database seeder with demo accounts
│       └── server.ts                  # Express server entry point & CORS configuration
│
└── src/                               # Frontend React Application
    ├── app.tsx                        # Root application component with providers
    ├── main.tsx                       # React DOM entry point
    ├── index.css                      # Tailwind base and custom utilities
    ├── vite-env.d.ts                  # Vite client type definitions
    │
    ├── assets/                        # Static assets (images, icons, fonts)
    ├── components/
    │   ├── admin-dashboard/           # Admin-specific UI components
    │   │   ├── admin-leaves-table.tsx
    │   │   ├── employee-statistics.tsx
    │   │   ├── leave-statistics.tsx
    │   │   └── pending-requests.tsx
    │   ├── employee-dashboard/        # Employee-specific UI components
    │   │   ├── leave-balance-card.tsx
    │   │   ├── leave-history-table.tsx
    │   │   ├── leave-request-form.tsx # Form with live calculations & validation
    │   │   └── recent-leave-requests.tsx
    │   └── ui/                        # Reusable global design system
    │       ├── buttons/               # AppButton, IconButton
    │       ├── inputs/                # AppInput, AppTextarea
    │       ├── modals/                # AppModal, AppDrawer (Slide-over)
    │       ├── calendar-picker.tsx    # Interactive calendar with disabled dates
    │       ├── card.tsx
    │       ├── empty-state.tsx
    │       ├── loading-spinner.tsx
    │       ├── navbar.tsx
    │       └── status-badge.tsx
    ├── config/
    │   ├── colors.ts                  # Hex color palette tokens
    │   ├── data.ts                    # Application static configurations & navigation links
    │   ├── endpoints.ts               # Centralized REST API endpoint routes
    │   └── query-client.ts            # TanStack Query client & cache reset utilities
    ├── hooks/
    │   ├── use-admin.ts               # Custom TanStack Query hooks for admin queries
    │   ├── use-auth.ts                # Redux authentication and session hook
    │   ├── use-infinite-scroll.ts     # IntersectionObserver hook for infinite scroll
    │   └── use-leave.ts               # Custom hooks for leave balance & applications
    ├── navigators/
    │   ├── app-navigator.tsx          # Main React Router switchboard
    │   └── protected-route.tsx        # Role-based route guard component
    ├── pages/
    │   ├── admin-dashboard.tsx        # Admin overview & metrics
    │   ├── admin-employees.tsx        # Employee directory table
    │   ├── admin-leaves.tsx           # Full organization leave requests table
    │   ├── employee-dashboard.tsx     # Employee dashboard with drawer trigger
    │   ├── leave-history.tsx          # Dedicated leave history page
    │   ├── login.tsx                  # Split-screen login with 1-click demo login
    │   └── not-found.tsx              # 404 handler
    ├── redux/
    │   ├── hooks.ts                   # Typed useSelector & useDispatch hooks
    │   ├── store.ts                   # Redux Toolkit store setup
    │   └── slices/
    │       └── auth.slice.ts          # Auth slice with login, logout, and token reducer
    ├── services/
    │   ├── api/
    │   │   └── axios-instance.ts      # Axios instance with interceptors
    │   ├── admin.service.ts
    │   ├── auth.service.ts
    │   ├── employee.service.ts
    │   └── leave.service.ts
    ├── types/                         # TypeScript interfaces and domain models
    ├── utils/
    │   ├── date.utils.ts              # Date calculation, Sunday detection, overlap checks
    │   └── format.utils.ts            # Formatting helpers
    └── validation/
        ├── auth.validation.ts         # Login input validation
        └── leave.validation.ts        # Comprehensive leave application rules
```

---

## 🚀 Prerequisites & Local Installation Guide

Follow these steps to set up and run the project locally on your machine.

### Prerequisites
- **Node.js**: Version `18.x`, `20.x`, or higher installed (`node -v`)
- **npm**: Version `9.x` or higher installed (`npm -v`)
- **Git**: Installed on your system (`git --version`)
- **MongoDB**: A free MongoDB Atlas cluster connection string or a local MongoDB service (`mongodb://localhost:27017/leave_management_db`)

---

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "Task Project"
```

---

### Step 2: Configure Environment Variables

1. **Backend Environment**:
   Create a `.env` file inside the `server/` directory:
   ```bash
   cp server/.env.example server/.env
   ```
   Open `server/.env` and update the values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/leave_management_db?retryWrites=true&w=majority
   JWT_SECRET=<your-secure-jwt-secret-key>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

2. **Frontend Environment**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set the backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
   *(In local development with the Vite proxy configured in `vite.config.ts`, requests to `/api` proxy automatically to port 5000).*

---

### Step 3: Install Dependencies

Install root (frontend) and server (backend) packages:
```bash
# 1. Install frontend root dependencies
npm install

# 2. Install backend dependencies
cd server
npm install
cd ..
```

---

### Step 4: Seed the Database

Populate your MongoDB database with the default Admin account, sample employees, and initial leave applications:
```bash
npm run seed
```
*Expected Console Output:*
```text
Connecting to MongoDB...
MongoDB Connected: <cluster-host>
Database Cleared successfully.
Seeded 4 Users (1 Admin, 3 Employees).
Seeded 5 Initial Leave Applications.
Database Seeded Successfully!
```

---

### Step 5: Start Development Servers

You can start both frontend and backend concurrently using a single command:
```bash
npm run dev:all
```

Alternatively, run them in two separate terminal tabs:
- **Terminal 1 (Backend API)**:
  ```bash
  cd server
  npm run dev
  ```
  *Server runs at `http://localhost:5000`*

- **Terminal 2 (Frontend Client)**:
  ```bash
  npm run dev
  ```
  *Frontend runs at `http://localhost:5173`*

Open your browser and navigate to `http://localhost:5173`.

---

## ⚙️ Environment Variables Reference

### Backend Configuration (`server/.env`)

| Variable Name | Required | Default Value | Description |
|---|:---:|---|---|
| `PORT` | Yes | `5000` | Port on which the Express HTTP server listens. |
| `MONGODB_URI` | Yes | `mongodb+srv://<username>:<password>@<cluster-url>/leave_management_db?retryWrites=true&w=majority` | Full MongoDB connection string (Atlas or local) including database name. |
| `JWT_SECRET` | Yes | `<your-secure-jwt-secret-key>` | Cryptographic secret key used to sign and verify JSON Web Tokens. |
| `JWT_EXPIRES_IN`| Yes | `7d` | Token expiration duration (e.g., `24h`, `7d`). |
| `CLIENT_URL` | Yes | `http://localhost:5173` | Allowed frontend origin for Cross-Origin Resource Sharing (CORS). |
| `NODE_ENV` | Yes | `development` | Runtime environment mode (`development` or `production`). |

### Frontend Configuration (`.env`)

| Variable Name | Required | Default Value | Description |
|---|:---:|---|---|
| `VITE_API_URL` | Yes | `http://localhost:5000` | Base URL of the backend API. In production, points to your deployed backend (e.g. `https://leave-management-system-5iol.onrender.com`). |

---

## 📡 Comprehensive REST API Reference

All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/login` | None | Authenticate with email & password. Returns JWT token and user profile. |
| `GET` | `/api/auth/me` | Bearer Token | Retrieve currently authenticated user's profile and latest leave balance. |
| `POST` | `/api/auth/logout` | Bearer Token | Invalidate client session. |

**Sample Login Request:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "employee@demo.com",
  "password": "employee123"
}
```

**Sample Login Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67246b9e28e1b212f483a001",
      "name": "Manoj Poojary",
      "email": "employee@demo.com",
      "role": "employee",
      "department": "Software Engineering",
      "totalLeaveQuota": 20,
      "usedLeave": 8,
      "availableLeave": 12
    }
  }
}
```

---

### 2. Employee Leave Lifecycle (`/api/leaves`)
| Method | Endpoint | Role | Description |
|---|---|:---:|---|
| `GET` | `/api/leaves/balance` | `employee` | Retrieve employee's leave balance, quota, and pending counts. |
| `POST` | `/api/leaves` | `employee` | Submit a new leave application with validation. |
| `GET` | `/api/leaves` | `employee` | Fetch personal leave history with optional query parameters (`?status=...&page=...&limit=...`). |
| `GET` | `/api/leaves/:id` | `employee` / `admin` | Fetch specific leave application details by ID. |

**Sample Leave Submission Request:**
```json
POST /api/leaves
Content-Type: application/json
Authorization: Bearer <token>

{
  "startDate": "2026-11-10",
  "endDate": "2026-11-12",
  "reason": "Attending annual technology conference."
}
```

*Note: If `endDate` is omitted or empty, the backend treats it as a single-day leave on `startDate`.*

---

### 3. Admin Review & Operations (`/api/admin`)
| Method | Endpoint | Role | Description |
|---|---|:---:|---|
| `GET` | `/api/admin/dashboard` | `admin` | Retrieve organizational KPI metrics and leave statistics. |
| `GET` | `/api/admin/leaves` | `admin` | Retrieve all submitted leave applications across the organization (supports `?status=...&page=...&limit=...`). |
| `POST` | `/api/admin/leaves/:id/approve` | `admin` | Approve leave, atomically deduct balance, record reviewer comments. |
| `POST` | `/api/admin/leaves/:id/reject` | `admin` | Reject leave, preserve balance, record reviewer comments. |
| `GET` | `/api/admin/employees` | `admin` | Retrieve complete employee directory with leave allocations (supports pagination). |

**Sample Approval Request:**
```json
POST /api/admin/leaves/67246b9e28e1b212f483a010/approve
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "adminComment": "Approved. Coverage arranged with team."
}
```

---

## 🌐 Remote Deployment Guide (For Independent Developers)

This section provides clear, step-by-step instructions for deploying and updating both the frontend and backend to remote cloud platforms.

### Architecture Overview
- **Database**: MongoDB Atlas Cloud Cluster
- **Backend API**: Render (Node.js runtime)
- **Frontend SPA**: Vercel (Edge CDN)

---

### Step 1: Deploy MongoDB Atlas Database
1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free shared M0 cluster (e.g., in `AWS / us-east-1` or closest region).
3. Under **Security > Database Access**:
   - Create a database user (e.g., `lms_admin`) with a secure password and read/write privileges.
4. Under **Security > Network Access**:
   - Add IP Address `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from Render cloud containers.
5. Under **Deployment > Database**:
   - Click **Connect** > **Drivers** > copy the connection string:
     ```text
     mongodb+srv://<username>:<password>@<cluster-url>/leave_management_db?retryWrites=true&w=majority
     ```

---

### Step 2: Deploy Backend API on Render
1. Sign in to [Render](https://render.com) and click **New + > Web Service**.
2. Connect your GitHub repository containing the project.
3. Configure service parameters:
   - **Name**: `leave-management-system-5iol`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. In the **Environment Variables** section, add:
   - `PORT` = `5000`
   - `MONGODB_URI` = `<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET` = `<your-secure-jwt-secret-key>`
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `https://leave-management-system-delta-ruddy.vercel.app` (or `*` during initial setup)
5. Click **Create Web Service**.
6. Once deployed, note your service URL: `https://leave-management-system-5iol.onrender.com`.

#### Seeding Remote Production Database:
To seed demo accounts into the remote database, run the seed script locally pointing to the remote database URI:
```bash
cd server
MONGODB_URI="<your-remote-atlas-uri>" npm run seed
```

---

### Step 3: Deploy Frontend SPA on Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New... > Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In the **Environment Variables** section, add:
   - `VITE_API_URL` = `https://leave-management-system-5iol.onrender.com`
5. Click **Deploy**.
6. The repository includes a pre-configured `vercel.json` file:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   This ensures HTML5 client-side routing works properly when users directly navigate or refresh URLs like `/employee/dashboard` or `/admin/dashboard`.

---

### Step 4: Updating the Application (Continuous Deployment)
Both Vercel and Render support automated Continuous Deployment (CD):
1. Create a feature branch or commit changes to `master` / `main`.
2. Push your changes to GitHub:
   ```bash
   git push origin main
   ```
3. **Automated Pipeline**:
   - Vercel automatically runs `npm run build` and deploys the new frontend bundle to edge locations worldwide.
   - Render automatically pulls the latest commit, builds the TypeScript server, and performs a zero-downtime rolling restart.

---

## ⚡ Performance & Engineering Optimizations

- **React Optimization Hooks**:
  - `useMemo`: Applied to expensive date filtering, Sunday calculations, timestamp intervals in calendar grids, and duration deductions.
  - `useCallback`: Applied to event handlers across the calendar picker, drawer form submitters, and interaction mechanisms.
  - `React.memo`: Applied to leaf components like `CalendarPicker` to prevent unnecessary re-rendering when parent state changes.
- **Smart Query Invalidation**: TanStack Query selectively invalidates only affected keys (`['leaveBalance']`, `['leaves']`, `['adminDashboard']`) upon mutations rather than refreshing the whole tree.
- **Cache Isolation**: Completely purges TanStack Query client cache upon logout via `queryClient.clear()`, guaranteeing clean multi-account transitions.

---

## 🔧 Troubleshooting & FAQ

### 1. Cross-Origin Resource Sharing (CORS) Issues
- **Symptom**: Browser console logs `CORS policy: No 'Access-Control-Allow-Origin' header is present`.
- **Solution**: In `server/src/server.ts`, verify that `process.env.CLIENT_URL` matches your deployed frontend domain. The server also permits any domain ending in `.vercel.app`.

### 2. Direct Browser Refresh Returns 404 on Deployed Frontend
- **Symptom**: Navigating to `https://your-site.vercel.app/admin/dashboard` directly returns a 404 Not Found.
- **Solution**: Ensure `vercel.json` is present in the root folder with the rewrite rule pointing to `/index.html`.

### 3. MongoDB Connection Timeout
- **Symptom**: `MongooseServerSelectionError: connect ECONNREFUSED` or IP whitelist error.
- **Solution**: In MongoDB Atlas, go to **Network Access** and ensure `0.0.0.0/0` is active.

### 4. Port Conflicts in Local Development
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::5000`.
- **Solution**: Kill the existing process holding port 5000:
  - *Windows (PowerShell)*: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force`
  - *macOS / Linux*: `lsof -ti:5000 | xargs kill -9`

---

## Thank You for Visiting!

Thank you for taking the time to explore this project. I hope you find it useful and easy to understand.

Your feedback and suggestions are always welcome!

**Made with ❤️ by Manoj C.**
