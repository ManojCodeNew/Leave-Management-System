# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## Leave Management System (LMS)
**Organization:** Exelon Circuits Pvt. Ltd.  
**Version:** 1.0.0  
**Date:** October 31, 2026  

---

## 1. Executive Summary

This Business Requirements Document (BRD) specifies the functional, operational, and non-functional requirements for the web-based **Leave Management System (LMS)**. The system provides an automated, centralized platform for employee leave application, supervisor review and decisioning, and transparent leave balance tracking.

---

## 2. Business Objectives

The key business goals achieved by this project include:
1. **Centralized Leave Administration**: Eliminate fragmented manual emails, spreadsheets, and paper slips by establishing a single source of truth.
2. **Real-time Balance Accounting**: Automatically maintain up-to-date available, used, and pending leave balances without mathematical inconsistencies.
3. **Transparent Review Pipeline**: Ensure employees can track the live status (`PENDING`, `APPROVED`, `REJECTED`) of their requests with administrative feedback.
4. **Administrative Visibility**: Provide leadership and HR administrators with live statistical dashboards and organizational workforce overviews.
5. **Enforcement of Policy Rules**: Prevent unauthorized leave approvals that exceed an employee's accrued balance and eliminate double-deduction risks.

---

## 3. User Roles & Permission Matrix

The system enforces strict Role-Based Access Control (RBAC) across two distinct user roles:

| Capability / Action | Employee Role | Admin Role |
|---|:---:|:---:|
| Secure Login & Session Authentication | Yes | Yes |
| Access Employee Dashboard & Personal Balances | Yes | No |
| Submit Leave Applications | Yes | No |
| View Personal Leave History | Yes | No |
| Access Admin Dashboard & System Metrics | No | Yes |
| View All Organization Leave Requests | No | Yes |
| Approve / Reject Leave Applications | No | Yes |
| View Organization Workforce & Allocations | No | Yes |
| Access Protected API Endpoints via JWT | Yes (Scoped) | Yes (Admin Scoped) |

---

## 4. Functional Requirements

### 4.1 Authentication & Security
- **Email & Password Authentication**: Validates user credentials against salted bcrypt password hashes.
- **JWT Token Issuance**: Issues signed JSON Web Tokens for subsequent authorized API calls.
- **Route Guarding**: Frontend routes automatically redirect unauthenticated visitors to `/login` and prevent role cross-access.
- **Backend Role Verification**: Every backend request independently verifies authentication headers and role authorization claims.

### 4.2 Employee Leave Lifecycle
- **Leave Submission**:
  - Employee specifies Start Date, End Date, and Reason.
  - End date must not precede the start date.
  - The system dynamically calculates duration in days (inclusive).
  - Validation ensures duration does not exceed the employee's available balance.
  - Initial status is assigned as `PENDING`.
- **Status & History Tracking**:
  - Employee can view all past and active applications.
  - Filtering by status (`ALL`, `PENDING`, `APPROVED`, `REJECTED`).
  - Clear presentation of submission date, reviewer identity, and administrative comments.

### 4.3 Leave Balance Engine
- Each employee is assigned an annual/policy leave allocation (e.g., 20 days).
- **On Approval**:
  - `usedLeave` increments by `duration`.
  - `availableLeave` decrements by `duration`.
  - Status updates to `APPROVED` with reviewer reference and timestamp.
- **On Rejection**:
  - Leave balance remains strictly untouched.
  - Status updates to `REJECTED` with reviewer comments explaining the decision.
- **Pending Requests**:
  - Tracked as pending days for visibility, but not deducted from available balance until formal approval.
- **Integrity Guarantee**:
  - Prevents approving requests that exceed current available balance.
  - Prohibits duplicate approval or rejection of already-decided requests.

### 4.4 Admin Oversight & Decisioning
- **Metrics Dashboard**:
  - Total registered employees count.
  - Total leave requests, pending requests, approved requests, and rejected requests count.
  - Total cumulative leave days approved across the organization.
- **Decision Workflow**:
  - List of pending requests with employee profile, available balance, dates, and justification.
  - Quick Approve / Reject action modals with optional feedback comments.
- **Employee Directory**:
  - Tabulated overview of all employees, departments, allocated quotas, used days, available balances, and request distribution.

---

## 5. Non-Functional Requirements

### 5.1 Security
- Passwords hashed using `bcryptjs` with salt factor 10.
- Secrets managed exclusively via `.env` files; never committed to version control.
- Strict cross-origin resource sharing (CORS) configured.
- Protected API routes reject unauthenticated requests with HTTP 401 and unauthorized requests with HTTP 403.

### 5.2 Performance & Responsiveness
- High-speed frontend bundling with Vite.
- Responsive design tailored for desktops, laptops, tablets, and mobile smartphones using Tailwind CSS.
- Client-side cache invalidation via TanStack Query to eliminate stale views and avoid redundant network roundtrips.

### 5.3 Reliability & Data Integrity
- Atomic balance modifications in MongoDB transactions / model updates.
- Centralized error-handling middleware preventing server crashes or raw stack trace leaks to end-users.

---

## 6. Assumptions and Constraints

### 6.1 Scope Assumptions
- All employees and administrators are pre-provisioned via the enterprise seeding script.
- Standard leave calculation operates on calendar days inclusive (configurable for business days).
- Default leave allocation is set per user profile (default: 20 days).

### 6.2 Out-of-Scope (As Defined in Assignment Assessment)
- Public user self-registration without administrator invitation.
- External SMTP email or SMS notifications.
- Departmental hierarchy / multi-tier manager escalations.
- Payroll deduction or compensation calculation.

---

## 7. Acceptance Criteria

| ID | Criterion | Verification Method | Status |
|:---:|---|---|:---:|
| **AC-01** | Employee logs in and views accurate dashboard balance | Automated Test & UI Inspection | **PASSED** |
| **AC-02** | Employee cannot submit leave with End Date < Start Date | Form & API Validation Test | **PASSED** |
| **AC-03** | Employee cannot request more days than available balance | Validation Engine Test | **PASSED** |
| **AC-04** | Submitted leave defaults to `PENDING` status | Database Record Check | **PASSED** |
| **AC-05** | Admin logs in and accesses organization dashboard metrics | Automated Test & UI Inspection | **PASSED** |
| **AC-06** | Admin approval reduces available balance by leave duration | Balance Engine Test | **PASSED** |
| **AC-07** | Admin rejection does not reduce available balance | Rejection Verification Test | **PASSED** |
| **AC-08** | Employee views updated decision status and reviewer notes | Live History Test | **PASSED** |
| **AC-09** | Role-based route guards prevent unauthorized access | Navigation Guard Test | **PASSED** |
| **AC-10** | Zero build errors in TypeScript and Vite production bundle | `npm run build` Execution | **PASSED** |

---

## 8. Deployment Information

- **Frontend Hosting Options**: Vercel, GitHub Pages, or Netlify.
- **Backend Hosting Options**: Render, Railway, or AWS EC2 / App Runner.
- **Database Service**: MongoDB Atlas Cloud (`cluster0.r07g3vq.mongodb.net`).
- **Build Output**: Static assets compiled to `/dist` directory.
- **API Target**: Node.js Express service running on port 5000 (proxied via `/api` in local Vite development, direct URL in production).

