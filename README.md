# PaisaPilot — Personal Finance Manager

> **A secure, local-first personal finance platform engineered for exact monetary accuracy, privacy, and actionable financial insights.**

---

## 1. Overview & Architectural Philosophy

**PaisaPilot** is a full-stack, local-first personal finance web application designed to help individuals track their income, monitor expenses, enforce monthly budgets, manage multi-account balances, automate recurring transactions, and reach savings goals with complete privacy and data ownership.

### Core Architectural Principles

- **Local-First & Zero Paid Services:** Requires zero cloud accounts, external databases, or paid API keys. All state is persisted in an encrypted/local SQLite database file on your machine (`prisma/dev.db`).
- **Exact Monetary Precision:** All financial amounts are stored as **integer minor units (paise)** (i.e. `₹100.50 = 10050` paise). Ordinary IEEE-754 floating-point arithmetic is strictly banned from financial calculations to avoid rounding drift.
- **Indian Financial Localization:** Formats numbers natively using `en-IN` numbering (lakhs and crores, e.g., `₹12,34,567.89`), default currency symbol `₹` (INR), and calendar calculations anchored to `Asia/Kolkata`.
- **Defensive Security & Privacy:** Salted password hashing with `bcryptjs`, secure HTTP-only session cookies with `jose` JWTs, route-level server protection middleware, parameterized queries via Prisma ORM, and protection against CSV Formula Injection (`=`, `+`, `-`, `@`).
- **Real User Data Only:** No fabricated or decorative financial metrics. Balances, cash flows, and analytics reflect real user ledger entries.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** | High-performance React 18 framework with server-side rendering and static optimization |
| **Styling & Icons** | **Tailwind CSS + Lucide React** | Accessible, responsive design system with custom emerald palette and dark/light modes |
| **Data Visualizations** | **Recharts** | Interactive SVG charts: Cash flow bars, category expense donuts, and monthly trends |
| **Backend & APIs** | **Next.js Route Handlers** | Type-safe REST API endpoints with cookie-based session verification |
| **Database & ORM** | **SQLite + Prisma ORM 6.4.0** | Zero-dependency local persistence with type-safe schema definitions and automated migrations |
| **Data Validation** | **Zod v4** | Strict schema validation on both client forms and server endpoints |
| **Authentication** | **Bcrypt.js + Jose JWT** | Salted password hashing (`bcryptjs`) and stateless cryptographically signed HTTP-only cookies |
| **Testing** | **Vitest 2.1** | Fast unit testing suite for financial mathematics and authentication security rules |

---

## 3. Quick Start & Launch Instructions (Windows)

### Option A: One-Click Launchers (Recommended for Windows)

1. **First-Time Setup:**
   Double-click `setup.bat`. This automatically:
   - Verifies that Node.js is installed.
   - Creates your `.env` configuration file from `.env.example`.
   - Installs all dependencies (`npm install`).
   - Generates the Prisma Client and initializes the local SQLite database schema.

2. **Starting the App:**
   Double-click `start.bat`. This will:
   - Launch the development server on `http://localhost:3000`.
   - Automatically open `http://localhost:3000` in your default browser within 3 seconds.

---

### Option B: Manual Command-Line Setup

```bash
# 1. Clone or navigate to the project directory
cd c:\Users\Hp\OneDrive\Desktop\personal_expense

# 2. Configure environment variables
copy .env.example .env

# 3. Install dependencies
npm install

# 4. Generate Prisma Client & Sync Database
npx prisma generate
npx prisma db push

# 5. Run automated test suites
npm test

# 6. Start the development server
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## 4. Key Feature Modules

### 1. Onboarding & Single-User Security
- When launched for the first time, PaisaPilot directs you to the setup screen (`/setup`).
- Enter your name, username, and master password.
- Subsequent administrative registration is locked down to prevent unauthorized user creation.
- Pre-seeds 16 default Indian expense categories (Groceries, Housing, Dining Out, Utilities, Transportation, etc.), 5 income categories, and starter Bank/Cash accounts.

### 2. Live Financial Dashboard (`/`)
- **Key Metric Cards:** Total Income, Total Expenses, Net Cash Flow, and Total Liquid Balance.
- **Account Balances Breakdown:** Real-time balances of all Bank, Cash, Credit Card, and Investment accounts.
- **Dynamic Visualizations:**
  - Net Cash Flow Monthly Comparison (Bar Chart)
  - Expense Category Distribution (Donut Chart)
- **Financial Health Insights:** Rule-based smart notifications for high budget utilization (>80%), negative cash flows, or category spending spikes.
- **Quick-Add Actions:** Instant keyboard shortcut modal (`Ctrl+K` or button) to record income, expense, or transfers.

### 3. Comprehensive Transaction Ledger (`/transactions`)
- Filter by date range (This Month, Last Month, Last 90 Days, This Year, or Custom range), Transaction Type (Expense, Income, Transfer), Category, and Account.
- Debounced real-time text search across descriptions, notes, and tags.
- Direct inline transaction creation, editing, and deletion with instant balance recalculation.
- CSV Export with formula injection protection and bulk CSV Import with duplicate detection.

### 4. Account Management & Internal Transfers (`/accounts`)
- Supports `BANK`, `CASH`, `CREDIT_CARD`, and `INVESTMENT` account types.
- Dedicated **Inter-Account Transfers** modal that simultaneously credits the destination account and debits the source account without double-counting as income or expense.

### 5. Monthly Budgets & Spending Limits (`/budgets`)
- Set monthly spending ceilings per category.
- Real-time progress bars with color-coded alerts:
  - **Normal** (<80% utilized)
  - **Warning** (80% - 100% utilized)
  - **Exceeded** (>100% overspent)

### 6. Automated Recurring Transactions (`/recurring`)
- Configure scheduled transactions (Daily, Weekly, Monthly, Yearly).
- Automated engine calculates `nextRunDate` and auto-posts due transactions upon application login/dashboard loading.
- One-click "Run Due Now" manual execution.

### 7. Savings Goals (`/goals`)
- Create target savings goals with target dates.
- Link contributions directly to existing bank accounts to deposit or withdraw funds.
- Visual progress rings and days remaining countdown.

### 8. Analytics & Financial Reports (`/reports`)
- Comprehensive breakdown of Income vs Expenses over customizable periods.
- Category breakdown tables showing transaction counts and percentage share of spending.
- Savings rate calculation: `(Income - Expenses) / Income * 100`.

### 9. Data Portability & Backup (`/settings`)
- **Full Database JSON Backup:** Download a full JSON snapshot of all user accounts, transactions, categories, budgets, and goals.
- **JSON Database Restore:** Upload a previously exported backup file to restore application state.
- **Safe Reset / Data Wipe:** Purge financial records while retaining user credentials if a clean slate is desired.

---

## 5. Security & Administrative Password Recovery

### Security Hardening Measures
- **Password Protection:** Encrypted using `bcryptjs` with salt rounds = 10. Passwords are never logged or stored in plain text.
- **Session Tokens:** Stateless, cryptographically signed JSON Web Tokens (`jose`) stored in `HttpOnly`, `SameSite=Lax` cookies.
- **Route Protection:** Next.js middleware interceptor (`src/middleware.ts`) guards `/api/*` (except public auth) and internal dashboard routes.
- **SQL Injection Prevention:** Parameterized database interactions guaranteed by Prisma ORM.
- **CSV Formula Injection Sanitization:** Exported CSV text beginning with `=`, `+`, `-`, or `@` is automatically prefixed with `'` to prevent spreadsheet code execution.

### Administrative Password Reset (CLI)
Since PaisaPilot is completely local and does not rely on an external SMTP email server, an administrative CLI utility is provided for emergency password recovery:

```bash
# Syntax: node scripts/reset-password.js <username> <new_password>
node scripts/reset-password.js admin NewStrongPassword123!
```

---

## 6. Verification & Automated Tests

Run the Vitest test suite:
```bash
npm test
```

### Verified Test Suites:
1. `test/financial-calculations.test.ts`:
   - Exact conversion between Rupees and integer Paise (`rupeesToPaise`, `paiseToRupees`).
   - Rounding accuracy on half-paise edges.
   - `en-IN` currency formatting (`₹1,23,456.78`).
   - Net cash flow and percentage utilization mathematics.
2. `test/security-validation.test.ts`:
   - Bcrypt hashing salt uniqueness and verification.
   - Auth setup schema validation.
   - CSV formula injection escaping.

### Production Build Verification:
```bash
npm run build
```
Generates 100% statically optimized and type-checked production assets with 0 compiler errors.

---

## 7. Future Cloud Deployment & PostgreSQL Migration

While PaisaPilot is configured out-of-the-box for zero-setup local SQLite usage, its Prisma ORM architecture is fully prepared for cloud deployment (e.g., Vercel, Docker, AWS, Railway):

1. **Switch Database Provider:**
   In `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. **Update Environment Variable:**
   In your cloud `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/paisapilot?sslmode=require"
   ```
3. **Execute Migration:**
   ```bash
   npx prisma migrate dev --name init_postgres
   ```
4. **Deploy:** Deploy Next.js to your hosting environment with Node.js 18+ runtime.

---

## 8. License

Personal & Open Source use under the MIT License. Designed and engineered for absolute financial clarity and security.
