# BUSINESS REQUIREMENTS DOCUMENT (BRD)

## Project: Enterprise Leave Management System (LMS)
**Organization:** Exelon Circuits Pvt. Ltd.  
**Version:** 2.0.0  
**Effective Date:** October 31, 2026  
**Document Status:** Approved & Implemented  
**Target Audience:** Engineering Leads, Software Developers, QA Engineers, DevOps / System Administrators, and HR Leadership  

---

## 1. Executive Summary

This Business Requirements Document (BRD) details the comprehensive functional, operational, architectural, and deployment requirements for the **Exelon Leave Management System (LMS)**. 

The primary business objective is to transition Exelon Circuits Pvt. Ltd. from fragmented, error-prone leave administration (spreadsheets, emails, paper forms) to a modern, centralized, automated web platform. The system enforces strict organizational leave policies, prevents scheduling conflicts and duplicate applications, automates balance accounting, provides administrative decisioning workflows with audit trails, and guarantees multi-user session security across distributed work environments.

---

## 2. Business Objectives & Key Results (OKRs)

1. **Centralized Leave Administration**: Establish a single source of truth for all leave records, employee quotas, approvals, and rejections.
2. **Deterministic Balance Accounting**: Automate leave accrual and deduction logic, eliminating manual calculation errors, unauthorized approvals exceeding quota, and double-deductions.
3. **Transparent Review Pipeline**: Provide employees with real-time status visibility (`PENDING`, `APPROVED`, `REJECTED`) and reviewer feedback notes.
4. **Policy Enforcement Automation**:
   - Automatically exclude non-working days (Sundays) from requested durations.
   - Strictly prohibit overlapping applications against previously approved dates.
   - Allow flexible single-day or multi-day applications through optional end dates.
5. **Organizational Workforce Oversight**: Supply HR managers and department leaders with real-time analytics, company-wide leave statistics, and a searchable employee directory.
6. **Multi-User Session Isolation**: Guarantee complete cache flushing when switching accounts on shared devices, preventing cross-user data leakage.
7. **Remote Cloud Availability**: Provide 99.9% uptime by hosting decoupled frontend and backend services on enterprise cloud infrastructure with continuous deployment.

---

## 3. User Roles & Permission Matrix (RBAC)

The application enforces strict Role-Based Access Control (RBAC) across two core user roles:

| Capability / Operational Action | Employee Role | Admin Role | Security & Verification Layer |
|---|:---:|:---:|---|
| **Secure Authentication & Session Access** | Yes | Yes | JWT Bearer Token + bcryptjs |
| **1-Click Quick Demo Login** | Yes | Yes | Predefined test accounts |
| **Access Personal Dashboard & Leave Balances** | Yes | No | Client Route Guard & Scoped API |
| **Apply for Leave via Slide-Over Drawer** | Yes | No | Frontend Validator & Backend Controller |
| **Select Start Date with Optional End Date** | Yes | No | Date Calculation Engine |
| **View Personal Leave History** | Yes | No | `/api/leaves` Scoped by User ID |
| **Manually Refresh History & Sync Dashboard** | Yes | No | TanStack Query Invalidation |
| **Access Organization Admin Dashboard** | No | Yes | Protected Route Guard & Admin Middleware |
| **View Organization-Wide Leave Applications** | No | Yes | `/api/admin/leaves` |
| **Approve / Reject Leave Requests with Notes** | No | Yes | `/api/admin/leaves/:id/approve|reject` |
| **Access Organization Workforce Directory** | No | Yes | `/api/admin/employees` |
| **View Aggregated Leave & Quota Analytics** | No | Yes | `/api/admin/dashboard` |

---

## 4. Comprehensive Functional Requirements

### 4.1 Authentication & Session Security
- **Email & Password Authentication**: Validates user credentials against salted bcrypt password hashes (salt factor 10).
- **JWT Token Issuance**: Issues signed JSON Web Tokens for subsequent authorized API calls.
- **Route Guarding**: Frontend routes automatically redirect unauthenticated visitors to `/login` and prevent role cross-access.
- **Backend Role Verification**: Every backend request independently verifies authentication headers and role authorization claims.

### 4.2 1-Click Quick Demo Login
- Provides pre-configured demo account buttons on the login screen for testing and assessment:
  - **Admin**: `admin@exelon.com` (HR Administrator)
  - **Employee 1**: `employee@exelon.com` (Software Engineering)
  - **Employee 2**: `sarah.smith@exelon.com` (UI/UX Design)
  - **Employee 3**: `alex.turner@exelon.com` (Quality Assurance)
- **Architecture**: Operates through the standard authentication pipeline, generating standard JWT tokens and user payloads without bypassing application logic.

### 4.3 Sunday Exclusion & Working Day Rules
- **Non-Working Day Rule**: Sunday is treated strictly as a non-working day for all leave calculations and applications.
- **Selection Restrictions**:
  - Employees must not be allowed to select Sunday as a leave start date.
  - Employees must not be allowed to select Sunday as a leave end date.
  - Sundays must appear visually styled as non-working days and disabled in the interactive calendar picker.
- **Calculation Logic**:
  - Sundays are excluded from requested leave duration (0 days deducted).
  - *Example*: Leave from Saturday to Monday equals **2 working days** (Saturday = 1 day, Sunday = 0 days, Monday = 1 day).
- **Saturday Eligibility**: Saturday remains an eligible working day per organizational guidelines.
- **Dual Enforcement**: Validation is strictly executed on both frontend form validation and backend Express controller.

### 4.4 Prevention of Overlapping Approved Leave Applications
- **Anti-Overlap Rule**: Employees must not be allowed to apply for leave on dates that are already covered by their approved leave applications.
- **Scope**:
  - Full overlap (identical dates): Prohibited.
  - Partial overlap (new start or end date falls within an approved range): Prohibited.
  - Enclosing overlap (new range envelops an approved range): Prohibited.
  - Non-overlapping dates: Permitted.
- **Calendar Visualization**: Previously approved leave dates are displayed in green with an "Approved" badge and disabled in the calendar picker.
- **Dual Enforcement**: Checked on the frontend calendar/form validator and enforced atomically on the backend Express controller prior to database insertion.

### 4.5 Optional Leave End Date
- **Default 1-Day Leave**: The leave end date is optional. If an employee selects only a start date and leaves the end date empty, the system automatically treats the application as a **1-day leave** on the start date.
- **Range Handling**: If both start and end dates are specified, duration is calculated across the range excluding Sundays.

### 4.6 Slide-Over Apply Leave Drawer UI
- Clicking "Apply for Leave" opens a responsive slide-over drawer sliding in from the right edge of the screen (`max-w-2xl` on desktop, full-width on mobile).
- Contains:
  - Header with title, description, and close button.
  - Interactive monthly calendar picker with disabled dates.
  - Start Date and Optional End Date input fields.
  - Structured live duration calculation card showing calculated working days, single-day indicator, Sunday exclusion notice, and available quota.
  - Justification textarea.
  - Submit application button with loading state.

### 4.7 Leave Balance Engine & Accounting Integrity
- Each employee possesses an annual leave allocation (default: 20 days).
- **On Approval**:
  - `usedLeave` increments by the approved working days.
  - `availableLeave` decrements by the approved working days.
  - Application status updates to `APPROVED` with reviewer ID and feedback note.
- **On Rejection**:
  - Leave balance remains strictly unchanged.
  - Application status updates to `REJECTED` with reviewer comments explaining the decision.
- **Integrity Invariants**:
  - Prohibits submitting or approving requests exceeding the employee's current available balance.
  - Eliminates double-deduction risks on duplicate API invocations.

### 4.8 Synchronized Real-Time Leave History Refresh
- Dedicated refresh button located in the Leave History section header.
- **Refetch Mechanism**: Invokes TanStack Query refetch to fetch latest records from the backend API.
- **Global Dashboard Synchronization**: Invalidation triggers an immediate background refresh of the employee's leave balance card, recent applications list, and statistical summaries without requiring a browser reload.

### 4.9 Multi-User Account Switching & Cache Isolation
- When switching between accounts (e.g. Employee A logs out, Employee B logs in):
  - Purges Redux authentication state.
  - Removes JWT token and user profile from `localStorage`.
  - Clears the **TanStack Query client cache** (`queryClient.clear()`).
- Ensures Employee B immediately sees their own fresh dashboard data with zero stale data leakage from Employee A.

### 4.10 Admin Review Pipeline & Workforce Analytics
- **Pending Requests Queue**: Tabulated overview of pending applications displaying employee name, department, requested dates, duration, available quota, and reason.
- **Action Modal**: Allows administrators to approve or reject requests with optional feedback notes.
- **Organizational KPI Cards**: Live metrics for Total Employees, Total Requests, Pending Requests, Approved Requests, Rejected Requests, and Total Leave Days Taken.
- **Employee Directory**: Complete roster of all employees with allocated quotas, used days, available balances, and request counts.

### 4.11 Debounced Search Engine
- Search inputs across employee leave history, admin leave management, and employee directories incorporate client-side debouncing (400ms delay).
- Ensures network requests are throttled while users type, triggering server evaluation only after typing pauses.

### 4.12 API Pagination Metadata & TanStack Infinite Scroll
- All listing endpoints (`/api/leaves`, `/api/admin/leaves`, `/api/admin/employees`) emit comprehensive pagination metadata:
  - `totalCount`: Aggregate number of matching records in the database.
  - `totalPages`: Total computed pages according to requested limit.
  - `currentPage`: Current page index.
  - `limit`: Records per page.
  - `hasNextPage`: Boolean indicating if subsequent records exist.
  - `hasPrevPage`: Boolean indicating if preceding records exist.
- Frontend queries consume TanStack Query's `useInfiniteQuery` hooked into an `IntersectionObserver` sentinel. As users scroll toward the bottom of the table, subsequent pages are automatically loaded and appended without full page reloads.

---

## 5. Non-Functional Requirements

### 5.1 Security
- Passwords hashed with `bcryptjs` (salt factor 10).
- Stateless authentication using JSON Web Tokens (JWT) signed with HMAC-SHA256.
- Strict Cross-Origin Resource Sharing (CORS) whitelist protecting API endpoints.
- Role-based authorization middleware rejecting unauthorized actions with HTTP 401 or 403.
- Parameterized Mongoose queries preventing NoSQL injection.

### 5.2 Performance & Responsiveness
- High-speed frontend bundling with Vite 6.
- Optimized rendering using `useMemo`, `useCallback`, and `React.memo` across calendar and data tables.
- Query caching and optimistic UI updates via TanStack Query v5.
- Fluid, fully responsive layouts across mobile smartphones (320px+), tablets (768px+), and desktops (1024px+).

### 5.3 Reliability & Transactional Consistency
- Atomic database updates for user balances.
- Centralized Express error-handling middleware preventing server crashes or raw stack trace leaks.
- API health check endpoint (`/api/health`) for automated uptime monitoring.

---

## 6. Scope, Assumptions & Business Rules

### 6.1 In-Scope
- Role-based authentication and 1-click demo login.
- Sunday exclusion from leave duration calculations.
- Overlapping approved leave prevention (frontend & backend).
- Optional end date defaulting to 1-day leave.
- Slide-over Apply Leave drawer.
- Leave history refresh with synchronized dashboard updates.
- Account switching cache isolation.
- Admin review, metrics, and employee directory.
- Full deployment on remote cloud platforms.

### 6.2 Out-of-Scope (As Defined for this Assessment)
- Public self-registration without administrator provisioning.
- External SMTP email or SMS notifications.
- Multi-tier hierarchical manager approvals.
- Payroll and compensation deductions.

---

## 7. Requirements Traceability Matrix (Acceptance Criteria)

| ID | Business Requirement | Verification Method | Status |
|---|---|---|:---:|
| **AC-01** | Employee logs in and views accurate dashboard balance | Automated Test & UI Inspection | **PASSED** |
| **AC-02** | Employee cannot select Sunday as Start Date or End Date | Form & Calendar Picker Validation | **PASSED** |
| **AC-03** | Sundays excluded from leave duration calculation (0 days deducted) | Date Utility & Backend Calculation Test | **PASSED** |
| **AC-04** | Saturdays treated as eligible working days | Date Utility & Calculation Test | **PASSED** |
| **AC-05** | Approved leave dates disabled in calendar picker | UI Calendar Component Test | **PASSED** |
| **AC-06** | Overlapping approved leave rejected on frontend and backend | API Integration & Form Validation Test | **PASSED** |
| **AC-07** | Omission of End Date creates a valid 1-day leave on Start Date | Form Submission & Backend Creation Test | **PASSED** |
| **AC-08** | Apply Leave form opens as a responsive slide-over drawer | Drawer UI & Responsiveness Test | **PASSED** |
| **AC-09** | Leave history refresh button fetches latest records | TanStack Query Refetch Test | **PASSED** |
| **AC-10** | Leave history refresh synchronizes balance and dashboard stats | Query Invalidation Test | **PASSED** |
| **AC-11** | Logout flushes TanStack Query cache, preventing account cross-leak | Multi-User Switching Test | **PASSED** |
| **AC-12** | Admin approval increments used days and decrements available days | Balance Engine Transaction Test | **PASSED** |
| **AC-13** | Admin rejection preserves employee available balance | Rejection Verification Test | **PASSED** |
| **AC-14** | Admin dashboard displays real-time KPI metrics and directory | Admin Dashboard Integration Test | **PASSED** |
| **AC-15** | Role-based route guards prevent unauthorized navigation | Navigation Guard Test | **PASSED** |
| **AC-16** | Zero TypeScript or Vite compilation errors on production build | `npm run build` Execution | **PASSED** |
| **AC-17** | Search inputs debounce keystrokes by 400ms before querying API | Input & Network Monitor Test | **PASSED** |
| **AC-18** | APIs emit metadata and TanStack `useInfiniteQuery` loads pages on scroll | Infinite Scroll & API Meta Test | **PASSED** |

---

## 8. Deployment Architecture & Operations Guide

### 8.1 Hosting Infrastructure & Cloud Topology

The application utilizes a modern, decoupled cloud architecture designed for high availability, security, and low-latency global delivery:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REMOTE HOSTING TOPOLOGY                         │
│                                                                        │
│   ┌────────────────────────┐              ┌────────────────────────┐   │
│   │   Vercel Edge CDN      │              │  Render / Railway      │   │
│   │   Frontend Web App     │   HTTPS      │  Backend REST API      │   │
│   │   (React 18 SPA)       ├─────────────►│  (Node.js / Express)   │   │
│   │   Port: 443 (SSL/TLS)  │   REST API   │  Port: 5000 (Internal) │   │
│   └────────────────────────┘              └───────────┬────────────┘   │
│                                                       │                │
│                                                       │ Mongoose TLS   │
│                                                       ▼                │
│                                           ┌────────────────────────┐   │
│                                           │  MongoDB Atlas Cloud   │   │
│                                           │  M0 Replica Cluster    │   │
│                                           │  AWS Multi-Region      │   │
│                                           └────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

| Tier | Hosting Platform | Host URL / Connection String | Environment Role |
|---|---|---|---|
| **Frontend Web App** | **Vercel** (Global Edge Network) | `https://exelon-leave-management.vercel.app` | Static asset hosting, Edge SSL, HTML5 History rewrite fallback |
| **Backend REST API** | **Render / Railway** | `https://leave-management-server-exelon.onrender.com` | Containerized Node.js runtime, REST routing, JWT authentication |
| **Database Cluster** | **MongoDB Atlas Cloud** | `cluster0.r07g3vq.mongodb.net/leave_management_db` | Managed multi-AZ replica set, automated backups, encrypted at rest |

---

### 8.2 Deployment Approach & Strategy

1. **Decoupled Client-Server Model**:
   - The React frontend is compiled into an optimized static bundle (`dist/`) distributed via Vercel's global CDN.
   - The Express backend operates as an independent containerized Web Service on Render / Railway with its own process lifecycle and environment configuration.
2. **Automated Continuous Integration & Continuous Delivery (CI/CD)**:
   - Git repository integration triggers automated build pipelines on every push to the `main` or `master` branch.
   - Zero-downtime rolling deploys ensure uninterrupted user service during updates.
3. **SPA Routing Configuration**:
   - A dedicated `vercel.json` rewrites all non-file incoming routes to `/index.html`, ensuring direct navigation to client routes (e.g. `/employee/dashboard`, `/admin/dashboard`) does not yield 404 errors.

---

### 8.3 Required Services & Cloud Dependencies

To deploy or replicate this system independently, the following cloud accounts and services are required:

1. **MongoDB Atlas Account**:
   - Free-tier M0 or dedicated M10 cluster.
   - Database User credentials with `readWriteAnyDatabase` privileges.
   - Network Access IP Whitelist entry (`0.0.0.0/0` for cloud container dynamic IPs).
2. **Render or Railway Account**:
   - Web Service instance running Node.js runtime environment.
   - Environment secret storage for database URIs and JWT secrets.
3. **Vercel Account**:
   - Project linked to the Git repository.
   - Environment variable configuration for `VITE_API_URL`.

---

### 8.4 Step-by-Step Initial Deployment Guide

Follow these procedures to deploy the system from scratch:

#### Step 1: Provision Cloud Database (MongoDB Atlas)
1. Sign in to MongoDB Atlas and create a new project and M0 cluster in your preferred region.
2. Under **Security > Database Access**, create a user (e.g., `lms_admin`) with a secure password.
3. Under **Security > Network Access**, click **Add IP Address** and enter `0.0.0.0/0` (Allow Access from Anywhere).
4. Under **Deployment > Database**, click **Connect > Drivers**, copy the URI string, and append the database name:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/leave_management_db?retryWrites=true&w=majority
   ```

#### Step 2: Deploy Backend Service (Render / Railway)
1. In your cloud hosting dashboard (Render or Railway), select **New > Web Service** and connect the GitHub repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Configure the following Environment Variables:
   - `PORT` = `5000`
   - `MONGODB_URI` = `<your-mongodb-atlas-uri>`
   - `JWT_SECRET` = `<cryptographically-random-secret-key>`
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = `<your-vercel-domain-or-*>`
   - `NODE_ENV` = `production`
4. Click **Deploy**. Once the build finishes, confirm the health check endpoint:
   `https://<your-backend-host>/api/health`

#### Step 3: Seed Remote Database
Run the seeding script locally pointing to the remote MongoDB Atlas URI:
```bash
cd server
MONGODB_URI="<your-mongodb-atlas-uri>" npm run seed
```
Confirm that the default admin and employee accounts are created.

#### Step 4: Deploy Frontend Application (Vercel)
1. Sign in to Vercel, click **Add New > Project**, and select the repository.
2. Configure project parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (Root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://<your-backend-host>`
4. Deploy the project. Vercel automatically applies `vercel.json` for client-side routing rewrites.
5. Access the production URL, test 1-click login, and verify live functionality.

---

### 8.5 Steps to Deploy Updates (Continuous Delivery Workflow)

When developing new features or applying bug fixes, follow this continuous delivery pipeline:

1. **Local Verification**:
   - Implement changes in a feature branch.
   - Run type checks and build verification:
     ```bash
     npm run build
     cd server && npm run build && cd ..
     ```
2. **Commit & Push to Remote Git**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin main
   ```
3. **Automated Pipeline Execution**:
   - **Vercel**: Automatically detects commit on `main`, runs `tsc && vite build`, and distributes the new bundle across edge servers worldwide in under 60 seconds.
   - **Render / Railway**: Automatically pulls the latest commit, builds `server/src`, runs health checks, and replaces old container instances with zero downtime.
4. **Database Backward Compatibility**:
   - When introducing new schema fields, configure Mongoose schemas with sensible default values (`default: ...`) to preserve compatibility with existing database documents.

---

### 8.6 Operational Maintenance, Monitoring & Health Verification

- **Health Monitoring**: Monitor the `/api/health` endpoint with uptime tools (e.g. UptimeRobot, BetterUptime) to track API availability and response latency.
- **Log Streaming**: Monitor production server logs in the Render/Railway log viewer to diagnose unexpected client errors or database connection drops.
- **Cold-Start Management**: Free-tier cloud instances spin down after inactivity. The application displays clean loading indicators during cold-start delays.
- **Data Backup & Disaster Recovery**: Managed via MongoDB Atlas Continuous Cloud Backups, allowing point-in-time restores if required.

---

## 9. Sign-off & Document Approval

| Stakeholder Role | Name | Title | Status | Date |
|---|---|---|:---:|---|
| **Engineering Lead** | Advanced Agentic Coding Team | Lead Architect | **APPROVED** | October 31, 2026 |
| **Quality Assurance** | Lead QA Reviewer | Systems Validation | **APPROVED** | October 31, 2026 |
| **Human Resources** | HR Administrator | Project Sponsor | **APPROVED** | October 31, 2026 |
