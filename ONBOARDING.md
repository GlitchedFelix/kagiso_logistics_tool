# LogiTrack — Owner Dashboard: Onboarding & Tutorial

**Version:** Current (`app.js` + `index.html`)
**Stack:** Vanilla JS · Supabase (PostgreSQL) · Chart.js · SheetJS
**Purpose:** A single-page logistics dashboard for delivery owners to track trips, calculate payouts, and monitor expenses.

---

## Table of Contents

1. [What Is LogiTrack?](#1-what-is-logitrack)
2. [Setup & Installation](#2-setup--installation)
   - 2a. [Create a Supabase Project](#2a-create-a-supabase-project)
   - 2b. [Create the Database Tables](#2b-create-the-database-tables)
   - 2c. [Configure Your Credentials](#2c-configure-your-credentials)
   - 2d. [Open the App](#2d-open-the-app)
   - 2e. [(Optional) Load Sample Data](#2e-optional-load-sample-data)
3. [Signing In](#3-signing-in)
4. [Dashboard Overview](#4-dashboard-overview)
5. [Logging a Trip](#5-logging-a-trip)
   - 5a. [How Payouts Are Calculated](#5a-how-payouts-are-calculated)
   - 5b. [Long-Distance Trips](#5b-long-distance-trips)
6. [Managing Expenses](#6-managing-expenses)
7. [Filtering & Date Ranges](#7-filtering--date-ranges)
8. [Analytics & Charts](#8-analytics--charts)
9. [Exporting to Excel](#9-exporting-to-excel)
10. [Editing & Deleting Records](#10-editing--deleting-records)
11. [Mobile Usage](#11-mobile-usage)
12. [Rate Card Reference](#12-rate-card-reference)
13. [SQL Scripts Reference](#13-sql-scripts-reference)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. What Is LogiTrack?

LogiTrack is a **web-based logistics management dashboard** built for South African delivery owners. It lives entirely in two files (`index.html` + `app.js`) with no server or build process. All data is stored in your private Supabase database.

**Core capabilities:**

| Feature | What it does |
|---|---|
| Trip logging | Record deliveries with auto-calculated payouts |
| Expense tracking | Log fuel, repairs, salary, breakages, and other costs |
| Financial KPIs | Income, expenses, net profit, margin % — updated live |
| Charts & analytics | Monthly trends, forecasting, expense breakdown |
| Excel export | Download full trips/expenses data as `.xlsx` |
| Saved date ranges | Named filters for recurring reporting periods |

**Currency:** South African Rand (R). Payouts apply a **15% VAT deduction** from the rate card value.

---

## 2. Setup & Installation

### 2a. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free tier is sufficient).
2. Click **"New project"**, name it (e.g. `logitrack`), choose a region close to you, and set a database password.
3. Wait ~2 minutes for provisioning.
4. From your project dashboard, copy two values you'll need shortly:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - **Anon/Public API Key** — a long JWT string under **Settings → API**

```
┌─────────────────────────────────────────┐
│  Supabase Dashboard — Settings → API    │
│                                         │
│  Project URL                            │
│  ┌─────────────────────────────────┐    │
│  │ https://xxxxxx.supabase.co      │ ◄─ copy this
│  └─────────────────────────────────┘    │
│                                         │
│  Project API Keys                       │
│  anon / public                          │
│  ┌─────────────────────────────────┐    │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI... │ ◄─ copy this
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

### 2b. Create the Database Tables

In your Supabase project, go to **SQL Editor** and run the following:

```sql
-- Trips table
CREATE TABLE trips (
  id            BIGSERIAL PRIMARY KEY,
  trip_date     TEXT NOT NULL,
  trip_type     TEXT,           -- 'Delivery' | 'OTO'
  status        TEXT,           -- 'Online' | 'Manual'
  invoice_number TEXT,
  trip_id       TEXT,
  distance_km   NUMERIC,
  weight_kg     NUMERIC,
  payout        NUMERIC,
  grouped_invoices  TEXT,
  grouped_trip_ids  TEXT,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id            BIGSERIAL PRIMARY KEY,
  expense_date  TEXT NOT NULL,
  category      TEXT,           -- 'Fuel' | 'Breakages' | 'Repairs' | 'Salary' | 'Other'
  amount        NUMERIC,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Saved date ranges table
CREATE TABLE saved_date_ranges (
  id            BIGSERIAL PRIMARY KEY,
  label         TEXT,
  start_date    TEXT,
  end_date      TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

> **Tip:** You can also enable Row Level Security (RLS) in Supabase and add policies so only authenticated users can read/write — recommended for production use.

---

### 2c. Configure Your Credentials

Open `app.js` in a text editor. Near the top, find these two lines and replace them with your own values:

```js
// app.js — lines ~65–66
const SB_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SB_KEY = 'YOUR_ANON_KEY_HERE';
```

Save the file. That's all the configuration needed.

> **Alternative — Settings Modal:** If you don't want to edit the file, open the app, click the ⚙ gear icon in the header, and paste in your URL and key at runtime. This overrides the hardcoded values for that browser session.

---

### 2d. Open the App

Because there is no build process, you have two options:

**Option A — Double-click (simplest):**
```
Open index.html directly in Chrome, Edge, or Firefox.
```
> Some browsers restrict local `fetch()` calls. If the app shows a blank screen or network errors, use Option B.

**Option B — Serve locally (recommended):**
```bash
# Python 3
cd /path/to/kagiso_logistics_tool
python3 -m http.server 8080

# Then open:  http://localhost:8080
```
Or with Node:
```bash
npx serve .
```

---

### 2e. (Optional) Load Sample Data

The repo includes `seed.sql` with **35 sample trips** and **16 expenses** spanning January–March 2026, so you can explore the dashboard without entering data manually.

1. In Supabase SQL Editor, open `seed.sql`
2. Paste the full contents and click **Run**
3. Refresh the app — you'll see 3 months of populated data

To remove all seed data later:
```sql
-- cleanup.sql
DELETE FROM trips;
DELETE FROM expenses;
```

---

## 3. Signing In

When you open the app you'll land on the login screen:

```
┌──────────────────────────────────────────┐
│                                          │
│          🚛  LogiTrack                   │
│          Owner Dashboard                 │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │  Email                           │   │
│   │  ┌────────────────────────────┐  │   │
│   │  │ you@example.com            │  │   │
│   │  └────────────────────────────┘  │   │
│   │                                  │   │
│   │  Password                        │   │
│   │  ┌────────────────────────────┐  │   │
│   │  │ ••••••••••••               │  │   │
│   │  └────────────────────────────┘  │   │
│   │                                  │   │
│   │  [ Sign In ]                     │   │
│   └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

- Use the **email and password** you registered in Supabase Auth (under **Authentication → Users** in your Supabase dashboard).
- To add a user: go to Supabase → **Authentication → Users → Add user**.
- There is no self-registration screen in the app.

Once signed in, you're taken directly to the Dashboard tab.

---

## 4. Dashboard Overview

The main screen is divided into **tabs** across the top. On desktop you'll see:

```
┌────────────────────────────────────────────────────────────────────┐
│  🚛 LogiTrack                           [Date Range ▼]  [⚙]  [↪]  │
├──────────────────────────────────────────────────────────────────  │
│  [📊 Dashboard]  [🚛 Trips]  [💸 Expenses]  [📋 Charts]           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ INCOME   │  │ EXPENSES │  │ NET PROF │  │ MARGIN % │          │
│  │ R 48,250 │  │ R 12,800 │  │ R 35,450 │  │   73.5%  │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐    │
│  │  TRIPS   │  │ AVG PAY  │  │  THIS MONTH                  │    │
│  │    35    │  │ R 1,379  │  │  Income R12,100 / Net R9,200 │    │
│  └──────────┘  └──────────┘  └──────────────────────────────┘    │
│                                                                    │
│  Trip breakdown                                                    │
│  Deliveries: 22  │  OTOs: 8  │  Long Distance: 5                  │
│  Online: 28      │  Manual: 7                                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**KPI cards explained:**

| Card | Definition |
|---|---|
| **Income** | Sum of all trip payouts in the selected date range |
| **Expenses** | Sum of all expense amounts in the selected date range |
| **Net Profit** | Income − Expenses |
| **Margin %** | Net Profit ÷ Income × 100 |
| **Trips** | Total number of trip records |
| **Avg Payout/Trip** | Income ÷ Trip count |
| **This Month** | Current calendar month's income and net, regardless of the date filter |

> All KPIs update instantly when you change the date range filter.

---

## 5. Logging a Trip

Click the **🚛 Trips** tab, then the **"+ Add Trip"** button.

```
┌──────────────────────────────────────────┐
│  Add Trip                                │
│  ──────────────────────────────────────  │
│  Date           [  2026-06-03  ]         │
│  Trip Type      [ Delivery ▼  ]          │
│  Status         [ Online ▼   ]           │
│  Invoice #      [ INV-0042    ]          │
│  Trip ID        [ T-0099      ]          │
│  Distance (km)  [  85         ]          │
│  Weight (kg)    [  350        ]          │
│                                          │
│  Payout ► R 573.16  ← auto-calculated   │
│                                ← live preview updates as you type
│  Grouped Invoices  [ INV-0040, INV-0041 ]│
│  Grouped Trip IDs  [ T-0097, T-0098     ]│
│  Notes             [ Sandton → Midrand  ]│
│                                          │
│  [ Cancel ]              [ Save Trip ]   │
└──────────────────────────────────────────┘
```

**Fields:**

| Field | Required | Notes |
|---|---|---|
| Date | Yes | Defaults to today |
| Trip Type | Yes | `Delivery` or `OTO` |
| Status | Yes | `Online` (app-dispatched) or `Manual` (paper) |
| Invoice # | Optional | Single invoice reference |
| Trip ID | Optional | Dispatch system ID |
| Distance (km) | Yes | Drives payout calculation |
| Weight (kg) | Yes | Drives payout calculation |
| Grouped Invoices | Optional | Comma-separated, for consolidated loads |
| Grouped Trip IDs | Optional | Comma-separated |
| Notes | Optional | Free text (route, customer, remarks) |

The **Payout** field is **read-only** and recalculates automatically every time you change the distance or weight.

---

### 5a. How Payouts Are Calculated

The rate card works in three tiers:

```
Is distance > 150 km?
   YES → Payout = distance × R23/km × 0.85
   NO  → Is Trip Type = OTO?
             YES → tons = max(1, weight ÷ 1000)
                   Payout = OTO_rate[distance_band] × tons × 0.85
             NO  → Is weight > 999 kg?
                       YES → Payout = HEAVY_rate[distance_band] × (weight ÷ 1000) × 0.85
                       NO  → Payout = LIGHT_rate[weight_band][distance_band] × 0.85
```

The **0.85 multiplier** is the 15% VAT/payout markdown. The final number shown is what the owner actually receives.

**Distance bands (12 breakpoints):**
`5 km · 10 km · 20 km · 30 km · 40 km · 50 km · 60 km · 70 km · 80 km · 100 km · 120 km · 150 km`

A trip is assigned the band of the first breakpoint ≥ its actual distance. E.g. a 75 km trip falls in the **80 km** band.

---

### 5b. Long-Distance Trips

Any trip where `distance > 150 km` is flagged as **Long Distance** and bypasses the rate card entirely:

```
Payout = distance_km × R23 × 0.85
```

Example: 800 km Joburg → Cape Town → **R 15,640**

In the trips list, long-distance trips show an amber **🟡 LD** badge so they're easy to spot at a glance.

---

## 6. Managing Expenses

Click the **💸 Expenses** tab. Use the **"+ Add Expense"** form at the top:

```
┌──────────────────────────────────────────────────────────┐
│  Add Expense                                             │
│  ──────────────────────────────────────────────────────  │
│  Date        [ 2026-06-03 ]                              │
│  Category    [ Fuel ▼     ]   ← Fuel / Breakages /       │
│                                  Repairs / Salary / Other │
│  Amount (R)  [ 1250.00    ]                              │
│  Description [ Diesel fillup — truck 1  ]                │
│                                                          │
│  [ Cancel ]                          [ Save Expense ]   │
└──────────────────────────────────────────────────────────┘
```

**Expense categories:**

| Category | Typical use |
|---|---|
| **Fuel** | Diesel / petrol fillups |
| **Repairs** | Mechanical, tyres, servicing |
| **Breakages** | Damaged cargo liability |
| **Salary** | Driver wages, helper pay |
| **Other** | Tolls, permits, miscellaneous |

All expenses feed into the **Expenses KPI** on the Dashboard and the **Expense Breakdown** doughnut chart.

---

## 7. Filtering & Date Ranges

The **date range picker** in the header controls what all tabs display. Click the date range selector:

```
┌──────────────────────────────────────────────────────┐
│  Date Range                                          │
│  ────────────────────────────────────────────────    │
│  From  [ 2026-01-01 ]    To  [ 2026-03-31 ]          │
│                                                      │
│  Quick select:  [This Month]  [Last Month]  [YTD]    │
│                                                      │
│  Saved ranges:                                       │
│  ┌───────────────────────┐  [ + Save This Range ]   │
│  │ 📌 Q1 2026            │                          │
│  │ 📌 Jan Review         │                          │
│  └───────────────────────┘                          │
└──────────────────────────────────────────────────────┘
```

**Saving a range:**
1. Set the From/To dates you want
2. Click **"+ Save This Range"**
3. Give it a name (e.g. "Q1 2026")
4. It appears in the list for one-click reuse — saved to Supabase so it persists across sessions

**Deleting a saved range:** Click the **×** next to the name in the list.

---

## 8. Analytics & Charts

Click the **📋 Charts** tab to see five visualizations, all responsive to the current date filter:

### Chart 1 — Income vs Expenses vs Net (Bar + Line)

```
R
50k ┤      ████                          ──── Net
40k ┤      ████  ────────────────────
30k ┤ ████ ████
20k ┤ ████ ████ ████
10k ┤ ████ ████ ████ ░░░░ ░░░░ ░░░░
  0 └────────────────────────────────
     Jan   Feb   Mar   Apr   May   Jun
          ████ Income  ░░░░ Expenses
```

Bars show monthly totals; the line tracks net profit. Use this to see whether income is keeping pace with costs.

---

### Chart 2 — 3-Month Projection (Linear Forecast)

```
R
60k ┤                        ╌╌╌╌╌╌
50k ┤              ──────────
40k ┤    ──────────
30k ┤────
  0 └────────────────────────────────
     Jan  Feb  Mar │ Apr  May  Jun
                   ↑ forecast starts (dashed)
```

Uses a least-squares linear regression on your historical data to project income and expenses 3 months forward. Dashed lines = forecast.

---

### Chart 3 — Expense Breakdown (Doughnut)

```
        ┌──────────┐
       /  Fuel 52%  \
      │  ░░░░░░░░░   │
       \ Repairs 23%/
        └──────────┘
         Salary 15%
         Other   10%
```

Shows proportional split of spending across all expense categories for the selected period.

---

### Chart 4 — Delivery Tracking (Stacked Bar)

```
Trips
12 ┤ ░░░
10 ┤ ░░░ ███
 8 ┤ ░░░ ███ ░░░
 6 ┤ ░░░ ███ ░░░
 4 ┤ ███ ███ ███
 0 └──────────────
    Jan  Feb  Mar
   ███ Delivery  ░░░ OTO
```

Month-by-month count of Delivery vs OTO trips. Useful for spotting which service type is driving volume.

---

### Chart 5 — Local vs Long Distance (Doughnut)

```
        ┌──────────┐
       /  Local 85% \
      │    ░░░░░░    │
       \ LD 15%     /
        └──────────┘
```

Shows the proportion of trips that triggered the long-distance flat rate (> 150 km) vs standard rate card trips.

---

## 9. Exporting to Excel

On the **🚛 Trips** or **💸 Expenses** tab, click the **"Export Excel"** button.

The export includes:
- A **Trips** sheet with all columns + a TOTAL row for payout
- An **Expenses** sheet with all columns + a TOTAL row for amount
- Auto-sized column widths
- Currency formatted as `R #,##0.00`

**Filename format:**
```
logitrack-trips-2026-06-03.xlsx
logitrack-expenses-2026-06-03.xlsx
```

> The export always reflects **all records** (not just the filtered date range). Download and filter in Excel if needed.

---

## 10. Editing & Deleting Records

### Editing a Trip

In the Trips table, click the **✏ Edit** button on any row. The row becomes an **inline edit form**:

```
┌─────────────────────────────────────────────────────────────────┐
│ 2026-01-15 │ [Delivery▼] │ [Online▼] │ INV-001 │ T-001 │ [85] │
│  [350]  │  Payout: R 573.16 (auto)  │ Notes: [Sandton run]      │
│                                    [ Cancel ]  [ ✔ Save ]       │
└─────────────────────────────────────────────────────────────────┘
```

Change any field; payout recalculates live. Click **Save** to write back to Supabase.

### Deleting a Record

Click the **🗑 Delete** button on any row. A confirmation toast appears — confirm to permanently remove the record.

> There is no bulk delete. Records must be deleted one at a time from the UI (or via Supabase SQL Editor for batch removal).

---

## 11. Mobile Usage

On screens narrower than 600 px, the layout switches to a **mobile-optimized view**:

```
┌──────────────────────┐
│  🚛 LogiTrack    [⚙] │
├──────────────────────┤
│                      │
│  Income   R 48,250   │
│  Expenses R 12,800   │
│  Net      R 35,450   │
│  Margin   73.5%      │
│                      │
│  ┌──────────────────┐│
│  │ 2026-01-15       ││
│  │ Delivery · Online││
│  │ 85 km · 350 kg   ││
│  │ Payout: R 573.16 ││
│  │     [Edit] [Del] ││
│  └──────────────────┘│
│  ┌──────────────────┐│
│  │ ...              ││
│  └──────────────────┘│
│                      │
├──────────────────────┤
│[📊][🚛][💸][📋]      │  ← bottom nav
└──────────────────────┘
```

- Navigation moves to a **bottom tab bar**
- Tables transform into **stacked cards**
- All buttons and inputs are at least 44 px tall for touch
- Charts resize to fill the screen width

---

## 12. Rate Card Reference

### Light Goods (≤ 999 kg) — Payout before markdown (R)

| Weight \ Distance | 5km | 10km | 20km | 30km | 40km | 50km | 60km | 70km | 80km | 100km | 120km | 150km |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ≤ 20 kg | 198 | 198 | 198 | 216 | 338 | 400 | 450 | 495 | 540 | 563 | 585 | 607 |
| ≤ 40 kg | 243 | 243 | 243 | 252 | 374 | 437 | 486 | 531 | 576 | 598 | 620 | 644 |
| ≤ 100 kg | 288 | 288 | 288 | 306 | 410 | 472 | 522 | 567 | 612 | 635 | 657 | 679 |
| ≤ 400 kg | 324 | 324 | 324 | 333 | 445 | 509 | 558 | 603 | 648 | 670 | 692 | 716 |
| ≤ 600 kg | 330 | 339 | 345 | 367 | 465 | 524 | 573 | 616 | 666 | 713 | 737 | 760 |
| ≤ 800 kg | 343 | 369 | 385 | 434 | 504 | 556 | 602 | 641 | 700 | 799 | 824 | 848 |
| ≤ 999 kg | 360 | 406 | 447 | 536 | 563 | 604 | 644 | 680 | 752 | 899 | 946 | 981 |

### Heavy Goods (> 999 kg) — Per-ton rates before markdown (R/ton)

| Distance | 5km | 10km | 20km | 30km | 40km | 50km | 60km | 70km | 80km | 100km | 120km | 150km |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Per-ton | 412 | 495 | 528 | 626 | 655 | 698 | 742 | 781 | 858 | 1047 | 1076 | 1105 |

### OTO (Dedicated Truck) — Per-ton rates before markdown (R/ton, min 1 ton)

| Distance | 5km | 10km | 20km | 30km | 40km | 50km | 60km | 70km | 80km | 100km | 120km | 150km |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Per-ton | 250 | 333 | 366 | 432 | 536 | 565 | 582 | 615 | 681 | 811 | 831 | 873 |

### Long Distance (> 150 km)

```
Payout = distance_km × R23.00 × 0.85
```

All rates above have the **15% markdown already excluded** from the final payout shown in the app.

---

## 13. SQL Scripts Reference

The repo includes three SQL utility files:

| File | Purpose | When to use |
|---|---|---|
| `seed.sql` | Insert 35 trips + 16 expenses (Jan–Mar 2026) | First-time demo / testing |
| `cleanup.sql` | Delete all trips and expenses | Reset to empty state |
| `migrate_ibt_to_oto.sql` | Rename legacy `IBT` trip_type to `OTO` | If you have old data from before the rename |

Run any of these in **Supabase → SQL Editor**.

---

## 14. Troubleshooting

### App shows blank / no data after login

- Check that `SB_URL` and `SB_KEY` in `app.js` match your Supabase project
- Check that all three tables (`trips`, `expenses`, `saved_date_ranges`) exist
- Open the browser DevTools console (F12) — Supabase errors appear there

### "Failed to fetch" or CORS errors

- You're likely opening `index.html` directly as a `file://` URL
- Use `python3 -m http.server 8080` and open `http://localhost:8080` instead

### Payout shows R 0.00

- Both **Distance (km)** and **Weight (kg)** must be non-zero
- Trip Type must be selected (`Delivery` or `OTO`)

### Login fails / "Invalid credentials"

- Create the user in Supabase → **Authentication → Users → Add user**
- Passwords are case-sensitive

### Saved date ranges don't persist

- The `saved_date_ranges` table must exist (see [section 2b](#2b-create-the-database-tables))
- Check Supabase → Table Editor to confirm the table is present

### Excel export is empty

- Export pulls all records regardless of date filter; if the table is empty in Supabase, the file will have headers only
- Load sample data via `seed.sql` to test the export

---

*Document generated from codebase inspection — `app.js` · `index.html` · `seed.sql`*
