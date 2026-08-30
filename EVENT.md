# EVENT.md

## 🏆 Hackathon Event Declaration

| Field | Details |
| :--- | :--- |
| **Team ID** | `lsh26-t047` |
| **Problem ID** | `P12` / `P01` (Personal Ledger: Professional Spending & Savings Pockets) |
| **Live Application** | [https://lsh26-t047-p12.vercel.app](https://lsh26-t047-p12.vercel.app/) |
| **GitHub Repository** | [https://github.com/Shaswata28/lsh26-t047-p01.git](https://github.com/Shaswata28/lsh26-t047-p01.git) |

---

## 🔑 Event Start Code
- **Event Start Code / Token**: Declared as per official participant pack instructions for `lsh26-t047`.

---

## 📋 Pre-Event Material Declaration

In accordance with hackathon competition rules:

1. **Pre-Existing Frameworks & Open-Source Libraries**:
   - Next.js 15 (React 19 framework)
   - Tailwind CSS & Lucide Icons (UI styling and iconography)
   - Supabase Client SDK (`@supabase/supabase-js`, `@supabase/ssr`)
   - Google Generative AI SDK (`@google/generative-ai` / Gemini 3.5 Flash Vision)
   - Zustand (Client-side state management)
   - `date-fns` (Date utility functions)
   - `framer-motion` (Micro-animations and sheet transitions)

2. **Work Created During the Event**:
   - All domain-specific business logic, database schema (`supabase/schema.sql`), and API routes (`/api/ocr`, `/auth/callback`).
   - Multimodal AI receipt OCR scanner with two-step review modal and confidence scoring.
   - Deterministic burn rate velocity, month-end projection formulas, and category-specific written insights engine (`src/lib/engine/forecast.ts`).
   - Savings pockets with forecast-constrained dynamic target dates and stated 7.5% DPS compound regular deposit simulation engine (`src/lib/engine/dps.ts`).
   - Mobile-first UI components, 3-step onboarding wizard (`/welcome`), and PWA manifest / service worker implementation (`public/manifest.json`, `public/sw.js`).
   - No pre-written application code for this problem existed prior to the official event kickoff.
