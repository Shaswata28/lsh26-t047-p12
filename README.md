# Personal Ledger — Spending & Savings Pockets (PWA)

[![Live Deployment](https://img.shields.io/badge/Live%20App-lsh26--t047--p12.vercel.app-10B981?style=for-the-badge&logo=vercel)](https://lsh26-t047-p12.vercel.app/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-white?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini 3.5 Flash](https://img.shields.io/badge/AI%20OCR-Gemini%203.5%20Flash%20Vision-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

> **A smart, mobile-first personal finance application tailored for salaried professionals living and working in Dhaka.** Track expenses effortlessly with AI photo receipt OCR, forecast month-end cash runways, receive deterministic data-driven financial insights, and schedule savings pockets with integrated 7.5% Deposit Pension Scheme (DPS) simulations.

---

## 📌 Project Overview

| Metric | Details |
| :--- | :--- |
| **Team ID** | `lsh26-t047` |
| **Problem ID** | `P12` / `P01` (Personal Ledger: Professional Spending & Savings Pockets) |
| **Live URL** | [https://lsh26-t047-p12.vercel.app](https://lsh26-t047-p12.vercel.app/) |
| **GitHub Repository** | [https://github.com/Shaswata28/lsh26-t047-p01.git](https://github.com/Shaswata28/lsh26-t047-p01.git) |
| **Platform** | Mobile-First Progressive Web App (PWA) |

---

## 🚀 Setup and Run Steps

### Prerequisites
- **Node.js**: `v18.18.0` or higher
- **npm** or **pnpm**
- **Supabase Account** (PostgreSQL with Auth & Storage)
- **Google Gemini API Key** (for multimodal receipt OCR vision scanning)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Shaswata28/lsh26-t047-p01.git
cd lsh26-t047-p01
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash
```

### 3. Database Migration
Execute the SQL schema located in `supabase/schema.sql` within your Supabase SQL Editor. It creates:
- `profiles` table (salary, name, currency with Row-Level Security).
- `expenses` table (amount, merchant, date, category, notes, receipt image URL).
- `pockets` table (target amount, item details, monthly contribution, saved amount).
- `pocket_contributions` table (contribution audit trail).
- Automatic triggers for profile creation on new user signup.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. (Optional) Seed Benchmark Dhaka Ledger Data
To populate the database with the benchmark 41 Dhaka transactions:
```bash
npm run seed
```

---

## ✅ Proof of Requirements Met

### 1. Income & Expense Entry with Photo Receipt OCR
- **Monthly Salary Setup**: Configurable in onboarding (`/welcome`), directly on the dashboard card, or in settings (`/settings`).
- **Manual Expense Entry**: Streamlined bottom sheet with category dropdown selection, amount, date, shop, and notes.
- **Multimodal AI Receipt OCR**:
  - Powered by **Google Gemini 3.5 Flash Vision** (`/api/ocr`).
  - Extracts **amount, merchant/shop name, transaction date, and category** from uploaded bill photos or bKash/Nagad payment screenshots.
  - **Two-Step Verification**: Scanned details are displayed on a verification review modal with confidence scoring, allowing the user to review, edit, or correct any field before committing to the ledger.

### 2. Monthly Dashboard & Analytics
- **Spent vs. Salary**: Top KPI hero gauge calculating total committed/spent against net salary, remaining cash runway, and daily safe burn limit.
- **Category Breakdown**: Interactive SVG donut chart and category expense bars tracking Rent, Groceries, Dining Out, Commute, Utilities, Entertainment, and Mobile.
- **Largest Expenses**: Ranked top single transactions highlighting high-impact expenditures.
- **Month-over-Month (MoM) Delta**: Comparative table calculating percentage changes and net variances between consecutive months.

### 3. Forecast & Written Insights from Actual Data
- **Rest-of-Month Forecast**: Computes daily burn velocity:
  $$\text{Daily Burn Velocity} = \frac{\text{Spent So Far}}{\text{Days Elapsed}}$$
  $$\text{Expected Month-End Total} = \text{Spent So Far} + (\text{Daily Burn Velocity} \times \text{Days Remaining})$$
- **Expected Surplus / Shortfall**: Live calculation of remaining take-home balance at month end.
- **≥3 Specific Written Insights**: The analytical engine generates concrete, category-named insights with real amounts:
  1. *Category Dominance Insight* (e.g. *"Rent is your highest cost, taking 32.0% of your income (৳ 16,000)."*)
  2. *Month-over-Month Surge Insight* (e.g. *"DESCO electricity spending surged by 204.0% compared to last month."*)
  3. *Burn Rate & Runway Insight* (e.g. *"At your current burn rate of ৳ 1,324/day, you have 20.4 days of cash runway remaining."*)

### 4. Savings Pockets & 7.5% DPS Simulation
- **Goal Parameters**: Each pocket tracks goal name, target cost, item details/specs, and monthly contribution.
- **Forecast-Driven Completion Date**: Target dates are computed from actual disposable forecast surplus:
  $$\text{Effective Contribution} = \min(\text{Monthly Contribution}, \text{Forecast Surplus})$$
  $$\text{Completion Months} = \left\lceil \frac{\text{Target Amount} - \text{Saved Amount}}{\text{Effective Contribution}} \right\rceil$$
- **7.5% Annual DPS Simulation**:
  - Uses the standard compound interest formula for regular monthly deposits:
    $$FV = P \times \left[\frac{(1 + r/12)^n - 1}{r/12}\right] \times (1 + r/12)$$
    *(where $P = \text{monthly deposit}$, $r = 0.075$, $n = \text{forecasted months})$.*
  - Generates opportunity cost comparisons (e.g. *"Based on your current spending, you will reach this goal in November 2027 (15 months). If you deposited this amount into a 7.5% Annual DPS instead, you would earn an extra ৳ 3,089 in interest."*).
- **Balance Deduction**: Depositing money into a pocket automatically records a ledger transaction and cuts the amount from the checking runway.

---

## 🛠️ Major Decisions Made

1. **Mobile-First Progressive Web App (PWA)**:
   - Designed around a native mobile container with bottom dock navigation, thumb-zone floating action buttons (`+`), and safe-area notch insets.
   - Installable on iOS (Safari Add to Home Screen) and Android/Desktop (Web App Manifest).
2. **Deterministic Analytical Engine for Insights**:
   - Rather than relying on generative LLM calls for numbers (which can hallucinate or introduce latency), insights are computed via a rule-based TypeScript math engine (`src/lib/engine/forecast.ts`). This guarantees instant 0ms latency and 100% mathematical accuracy.
3. **Immutable Activity Ledger**:
   - Following standard accounting principles, transactions are immutable once committed. Modifications happen during the initial entry or during the AI receipt OCR review step.
4. **Clean Onboarding Wizard (`/welcome`)**:
   - 3-step setup (Name $\rightarrow$ Monthly Net Income $\rightarrow$ Fixed Start-of-Month Commitments like Rent & DESCO) ensuring the cash runway is accurate from day one.

---

## ⚠️ Known Limitations

1. **Supabase Auth Rate Limits**:
   - The Supabase free-tier SMTP enforces hourly rate limits on confirmation emails. The authentication flow handles automatic fallback session creation on direct registration.
2. **Receipt OCR Variations**:
   - Accuracy for faded paper thermal receipts or low-resolution handwritten slips depends on image clarity and lighting conditions.

---

## 📱 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, React 19)
- **Styling**: Tailwind CSS (Onyx & Mint Emerald design tokens)
- **State Management**: Zustand (Client-side reactive stores)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)
- **AI & Multimodal Vision**: Google Gemini 3.5 Flash Vision SDK
- **Date & Math Utilities**: `date-fns`, custom compound interest engine
