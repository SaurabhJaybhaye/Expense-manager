# Expense Manager — Version-Wise Feature Roadmap

This document outlines the versioned development release plan for the Expense Manager web application. Features are grouped into distinct phases to ensure incremental delivery, stability, and ease of testing.

---

## 📦 Version 1.0.0 — MVP Core Infrastructure & Manual Entry (✅ Completed & Merged into `v1`)

**Focus:** Establish basic application structure, authentication, user data isolation, and core manual financial tracking.

### Features Included:
* **User Authentication:** ✅
  * Email/Password Sign Up, Login, Logout via Firebase Auth.
  * Protected routes for authenticated users.
* **Account Management:** ✅
  * Default accounts creation (Cash, Bank Account, Credit Card).
  * Account balances view.
* **Transaction Entry (Manual):** ✅
  * Add, Edit, Delete Income & Expense transactions.
  * Fields: Date & Time ISO timestamps, Amount, Type (Income/Expense), Category, Payment Method/Account, Description.
* **Category Management (CRUD):** ✅
  * Default transaction categories pre-populated.
  * Custom Category creation and deletion.
* **Data Import Engine (Core Focus):** ✅
  * Support for bulk data import via **JSON**, **CSV**, and **Excel (`.xlsx`)** files.
  * Import validation (handling missing fields, bad dates, invalid numbers).
* **Currency Support:** ✅
  * Default currency hardcoded to **INR (Indian Rupee - ₹)** across all components.

---

## 📈 Version 1.1.0 — Visual Dashboards & Financial Analytics (✅ Completed & Merged into `v1`)

**Focus:** Transforming raw data into visual insights with interactive charts and reporting tools.

### Features Included:
* **Interactive Dashboard:** ✅
  * Total Balance, Monthly Income vs. Expense summary cards.
  * Category Breakdown Pie/Doughnut Chart (Top spending categories with center totals overlay).
  * Cash Flow Line/Bar Chart (Daily, Monthly, Yearly trends).
* **Time-Based Filtering:** ✅
  * Filter transactions and charts by Date Range (Today, This Week, This Month, Custom Range).
* **Account-to-Account Transfers:** ✅
  * Logic for transferring money between user accounts (e.g., Bank → Cash withdrawal) without skewing gross income/expense totals.
* **Recent Activity Feed:** ✅
  * Scrollable list of recent transactions on the primary dashboard view.

---

## ⚙️ Version 1.2.0 — Settings, Personalization & UI Polish (✅ Completed & Merged into `v1`)

**Focus:** Enhancing user flexibility, customizing preferences, and refining the Gen Z design theme.

### Features Included:
* **User Settings Module:** ✅
  * Profile management (Update display name, avatar overview).
  * Multi-Currency Preference Switcher (Instant switching between INR `₹`, USD `$`, EUR `€`, GBP `£`, JPY `¥`, and AUD `A$`).
* **Sub-Categories System:** ✅
  * Hierarchical category grouping (e.g., *Food → Groceries*, *Entertainment → Streaming*).
* **Export Functionality:** ✅
  * One-click export of transaction history into **CSV** spreadsheet or **JSON** backup formats.
* **Enhanced Gen Z UI Animations & Code-Splitting:** ✅
  * Sticky desktop navigation sidebar, custom dark glassmorphism select dropdowns, non-negative money form validations, and React lazy loading chunk optimizations (83.8% initial load size reduction).

---

## 🤖 Version 2.0.0 — Smart Automation & AI Integration (✅ Completed & Merged into `v2`)

**Focus:** Adding intelligent features to automate manual tasks and provide personalized financial insights.

### Features Included:
* **AI Auto-Categorization:** ✅
  * Machine learning rule engine to automatically tag transaction categories based on merchant names or import descriptions (e.g., "Uber" → *Transportation & Fuel*, "Swiggy" → *Food & Dining*). Real-time `✨ Auto-suggested` indicator badge in transaction form.
* **Duplicate Transaction Detection:** ✅
  * Algorithmic flagging during JSON/CSV/Excel bulk import for duplicate transactions (matching timestamp window + exact amount + description).
* **Smart Budgeting & Category Limits:** ✅
  * Monthly budget caps per category with visual neon progress bars (`On Track`, `Near Limit`, `Over Budget`) on `/budgets` and warning alerts.
* **AI Spending Insights & Health Score Widget:** ✅
  * Automated financial health score gauge (0 - 100) and AI advice cards on the main dashboard highlighting spending anomalies and saving tips.