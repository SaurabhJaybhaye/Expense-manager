# Expense Manager — Product Overview & Roadmap

## 1. Project Purpose
A secure, scalable, and intuitive web application designed for personal finance tracking. The platform empowers users to manage daily cash flow, organize accounts, track expenses/income, and analyze financial health with interactive visualizations.

---

## 2. Core Feature Specifications

### 2.1 Transaction Management
* **Manual Entry:** Record transactions with `Date`, `Amount`, `Category`, `Payment Method/Account`, and `Description`.
* **Dual Flow Support:** Full tracking for both Inflow (Income) and Outflow (Expenses).
* **Data Import Engine:** Parse structured JSON or Excel/CSV files to batch-import historical transactions.
* **Validation:** Client-side and server-side validation for missing fields, incorrect date formats, and duplicate entries.

### 2.2 Account & Multi-Asset Tracking
* **Account Types:** Support for Cash, Bank Accounts, Credit Cards, and Savings.
* **Account Transfers:** Internal transfer capability between user accounts (e.g., Cash withdrawal from Bank).
* **Multi-Currency Support:**
  * **Default:** Indian Rupee (INR - ₹).
  * **Flexibility:** Dynamic currency switching available via User Settings.

### 2.3 Category Management (CRUD)
* **Custom Categories:** Complete Create, Read, Update, and Delete operations for custom expense/income categories.
* **Sub-categories:** Hierarchical grouping (e.g., *Food → Groceries*, *Transportation → Fuel*).

### 2.4 Reporting & Dashboard Analytics
* **Time-based Reports:** Daily, monthly, and yearly summaries.
* **Visual Data:** Interactive pie charts (category breakdown) and bar/line charts (cash flow trends over time).

### 2.5 Smart & AI Features (Future Phase)
* **Auto-Categorization:** ML/Rule-based tagging based on merchant descriptions.
* **Personalized Insights:** Smart anomaly detection and monthly spending suggestions.

---

## 3. Development Phases & Feature Versioning

| Phase | Version | Core Focus | Features Included |
| :--- | :--- | :--- | :--- |
| **Phase 1** | `v1.0.0` | MVP & Data Entry | Manual CRUD, Accounts setup, JSON/CSV Import Engine, Default INR currency. |
| **Phase 2** | `v1.1.0` | Analytics & Reports | Interactive Dashboard (Daily/Monthly/Yearly charts), Category reports. |
| **Phase 3** | `v1.2.0` | Settings & Customization | Currency switcher in Settings, Custom themes, Sub-categories. |
| **Phase 4** | `v2.0.0` | Smart Intelligence | AI auto-categorization, duplicate detection rules, automated insights. |