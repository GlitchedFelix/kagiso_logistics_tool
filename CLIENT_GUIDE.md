# LogiTrack — User Guide

Your logistics dashboard for tracking trips, expenses, and profitability.

---

## Table of Contents

1. [Signing In](#1-signing-in)
2. [The Dashboard](#2-the-dashboard)
3. [Logging a Trip](#3-logging-a-trip)
4. [Tracking Expenses](#4-tracking-expenses)
5. [Filtering by Date](#5-filtering-by-date)
6. [Charts & Analytics](#6-charts--analytics)
7. [Exporting to Excel](#7-exporting-to-excel)
8. [Editing & Deleting Records](#8-editing--deleting-records)
9. [Using on Mobile](#9-using-on-mobile)

---

## 1. Signing In

Open the app link in your browser. Enter your email and password, then click **Sign In**. You'll land on the Dashboard.

> Your login credentials are provided separately. If you can't log in, contact your administrator.

---

## 2. The Dashboard

The Dashboard is your financial overview. All numbers update automatically based on your selected date range.

### What each number means

| Card | What it shows |
|---|---|
| **Income** | Total payout from all trips in the selected period |
| **Expenses** | Total costs (fuel, repairs, salary, etc.) in the selected period |
| **Net Profit** | Income minus Expenses |
| **Margin %** | What percentage of income you keep after costs |
| **Trips** | Number of trips logged in the selected period |
| **Avg Pay/Trip** | Average payout per trip |
| **This Month** | Current calendar month's income and net — always shows the current month regardless of your date filter |

The **trip breakdown** below the cards tells you at a glance how many were standard Deliveries vs OTO (dedicated truck) trips, how many were long distance runs, and how many were entered online vs manually.

---

## 3. Logging a Trip

Go to the **🚛 Trips** tab and click **+ Add Trip**.

### Field guide

| Field | Required | What to enter |
|---|---|---|
| **Date** | Yes | Date the trip ran (defaults to today) |
| **Trip Type** | Yes | `Delivery` for standard loads · `OTO` for dedicated full-truck jobs |
| **Status** | Yes | `Online` if dispatched through the system · `Manual` if recorded on paper |
| **Invoice #** | Optional | The invoice or waybill number for this trip |
| **Trip ID** | Optional | The dispatch/system trip reference number |
| **Distance (km)** | Yes | Door-to-door kilometres |
| **Weight (kg)** | Yes | Load weight in kilograms |
| **Grouped Invoices** | Optional | Use when multiple invoices are on one load — enter them comma-separated |
| **Grouped Trip IDs** | Optional | Same as above for trip IDs |
| **Notes** | Optional | Route, customer name, or any other remarks |

### Payout is automatic

You never need to calculate a payout yourself. As soon as you enter the distance and weight, the **Payout** field updates instantly. It applies your rate card and deducts the 15% VAT markdown — the number shown is what you actually receive.

### Long-distance trips

Any trip over **150 km** is automatically treated as long distance and billed at a flat **R23 per km** (before markdown). These trips show an amber **LD** badge in the trip list so they stand out.

---

## 4. Tracking Expenses

Go to the **💸 Expenses** tab and click **+ Add Expense**.

### Expense categories

| Category | Use it for |
|---|---|
| **Fuel** | Diesel or petrol fillups |
| **Repairs** | Mechanical work, tyres, servicing |
| **Breakages** | Damaged or lost cargo |
| **Salary** | Driver wages, helper pay |
| **Other** | Tolls, permits, anything else |

Every expense you log is deducted from your net profit on the Dashboard and included in the Expense Breakdown chart.

---

## 5. Filtering by Date

The **date range selector** in the top-right corner controls every tab — the Dashboard KPIs, the Trips list, Expenses list, and all Charts all update together.

Use the quick-select buttons (**This Month**, **Last Month**, **Year to Date**) for common periods, or set custom **From** and **To** dates manually.

### Saving a date range

If you regularly pull the same period (e.g. every quarter, every payroll cycle):
1. Set your **From** and **To** dates
2. Click **+ Save This Range**
3. Give it a name — it stays saved and is one click to reuse next time
4. To remove a saved range, click the **×** next to its name

---

## 6. Charts & Analytics

The **📋 Charts** tab gives you five visual breakdowns of your business, all filtered by your selected date range.

### Income vs Expenses vs Net

A monthly bar chart with a net profit line overlay. Use this to see at a glance whether your income is growing faster than your costs.

### 3-Month Projection

Shows where your income and expenses are heading based on your recent trend. Solid lines are your real data; dashed lines are the forecast for the next three months.

### Expense Breakdown

A doughnut chart showing what proportion of your total spend goes to each category (Fuel, Repairs, Salary, etc.).

### Delivery Tracking

A stacked monthly bar showing how many Delivery vs OTO trips you ran each month. Useful for spotting which service type is driving your volume.

### Local vs Long Distance

Shows what share of your trips triggered the long-distance rate (over 150 km) vs the standard rate card.

---

## 7. Exporting to Excel

On the **🚛 Trips** or **💸 Expenses** tab, click the **Export Excel** button.

The downloaded file contains:
- A **Trips** sheet with every column and a total payout row at the bottom
- An **Expenses** sheet with every column and a total amount row at the bottom
- Currency formatted as `R #,##0.00`

> The export includes all records, not just what's visible in your current date filter. You can filter or sort further in Excel as needed.

---

## 8. Editing & Deleting Records

### Editing a trip or expense

Click the **✏ Edit** button on any row. The row opens as an inline form directly in the table — change what you need, then click **Save**. Payout recalculates automatically if you change distance or weight.

### Deleting a record

Click the **🗑 Delete** button on the row. You'll be asked to confirm before it's removed.

---

## 9. Using on Mobile

LogiTrack works on phones and tablets. On smaller screens the layout adapts automatically:

- Navigation moves to a **bottom bar** — tap the icons at the bottom to switch tabs
- The trips and expenses tables become **stacked cards**, one card per record
- All buttons and inputs are sized for touch

---

*LogiTrack — Owner Dashboard*
