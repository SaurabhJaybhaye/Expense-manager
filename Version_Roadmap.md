# Expense Manager — Version-Wise Feature Roadmap

This document outlines the versioned development release plan for the Expense Manager web application. Features are grouped into distinct phases to ensure incremental delivery, stability, and ease of testing.

---

## 📦 Version 1.0.0 — MVP Core Infrastructure & Manual Entry

**Focus:** Establish basic application structure, authentication, user data isolation, and core manual financial tracking.

### Features Included:
* **User Authentication:**
  * Email/Password Sign Up, Login, Logout via Firebase Auth.
  * Protected routes for authenticated users.
* **Account Management:**
  * Default accounts creation (Cash, Bank Account, Credit Card).
  * Account balances view.
* **Transaction Entry (Manual):**
  * Add, Edit, Delete Income & Expense transactions.
  * Fields: Date, Amount, Type (Income/Expense), Category, Payment Method/Account, Description.
* **Category Management (CRUD):**
  * Default transaction categories pre-populated.
  * Custom Category creation and deletion.
* **Data Import Engine (Core Focus):**
  * Support for bulk data import via **JSON** and **CSV/Excel** files.
  * Import validation (handling missing fields, bad dates, invalid numbers).
* **Currency Support:**
  * Default currency hardcoded to **INR (Indian Rupee - ₹)** across all components.

---

## 📈 Version 1.1.0 — Visual Dashboards & Financial Analytics

**Focus:** Transforming raw data into visual insights with interactive charts and reporting tools.

### Features Included:
* **Interactive Dashboard:**
  * Total Balance, Monthly Income vs. Expense summary cards.
  * Category Breakdown Pie/Doughnut Chart (Top spending categories).
  * Cash Flow Line/Bar Chart (Daily, Monthly, Yearly trends).
* **Time-Based Filtering:**
  * Filter transactions and charts by Date Range (Today, This Week, This Month, Custom Range).
* **Account-to-Account Transfers:**
  * Logic for transferring money between user accounts (e.g., Bank → Cash withdrawal) without skewing income/expense totals.
* **Recent Activity Feed:**
  * Scrollable list of recent transactions on the primary dashboard view.

---

## ⚙️ Version 1.2.0 — Settings, Personalization & UI Polish

**Focus:** Enhancing user flexibility, customizing preferences, and refining the Gen Z design theme.

### Features Included:
* **User Settings Module:**
  * Profile management (Update display name, avatar).
  * Currency Preference Switcher (Allows changing default currency from INR to USD, EUR, GBP, etc.).
* **Sub-Categories System:**
  * Hierarchical category grouping (e.g., *Food → Groceries*, *Entertainment → Streaming*).
* **Export Functionality:**
  * Export transaction history back into JSON or CSV formats.
* **Enhanced Gen Z UI Animations:**
  * Micro-interactions, smooth hover effects, and neon glowing borders using CSS variables from `theme.css`.

---

## 🤖 Version 2.0.0 — Smart Automation & AI Integration

**Focus:** Adding intelligent features to automate manual tasks and provide personalized financial insights.

### Features Included:
* **AI Auto-Categorization:**
  * Machine learning rule engine to automatically tag transaction categories based on merchant names or import descriptions (e.g., "Uber" → *Transportation*).
* **Duplicate Transaction Detection:**
  * Algorithmic flagging during JSON/CSV bulk import for identical transactions (matching timestamp + amount).
* **Smart Budgeting & Alerts:**
  * Monthly budget caps per category with visual progress bars and warnings when nearing limits.
* **AI Spending Insights:**
  * Automated summary reports providing spending anomaly highlights and monthly saving suggestions.