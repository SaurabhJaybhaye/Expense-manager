# Expense Manager — AI & Developer Engineering Guidelines

This document outlines the core architecture, security rules, code quality standards, and design conventions for building and maintaining the Expense Manager web application. 

All human developers and AI assistants **must** adhere strictly to these guidelines when generating, modifying, or refactoring code.

---

## 1. Security & Data Protection Rules

### 1.1 Authentication & Authorization
* **Owner-Only Data Access:** Every Firestore document representing user data must contain a `userId` field.
* **Security Rules:** Firestore rules must explicitly verify that `request.auth.uid == resource.data.userId` for all Read, Update, and Delete operations.
* **No Unauthenticated Routes:** All application routes except Login and Registration must be protected by authentication guards.

### 1.2 Data Sanitization & Input Validation
* **Client-Side Validation:** Validate all form fields (date formats, numerical amounts, non-empty strings) before submitting payloads to Firebase.
* **XSS Prevention:** Never use unsafe HTML injection (e.g., `dangerouslySetInnerHTML` in React) without sanitizing inputs using an established library like DOMPurify.
* **Payload Validation:** Strip unneeded or unexpected keys from objects before sending writes to Firestore.

---

## 2. Code Quality & Architectural Standards

### 2.1 File & Module Structure
Organize all source code within `src/` according to clear functional boundaries:

```text
src/
├── assets/          # SVGs, images, and static assets
├── components/      # Reusable UI elements (Button, Card, Input)
├── constants/       # Centralized constant files per feature
├── context/         # React Context (AuthContext, ThemeContext)
├── pages/           # Screen views (Dashboard, Transactions, Settings)
├── services/        # Firebase client configurations and API handlers
├── styles/          # Global styles and theme definitions
└── utils/           # Pure utility functions (formatting, validation)