# Workspace Rules for Expense Manager

## Git Branching Strategy
- Version releases are tracked in Version_Roadmap.md.
- Whenever starting work on a new feature, always create a git branch following the pattern:
  `v<version_number>_<feature_name>` (e.g., `v1_auth`, `v1_transaction_crud`, `v1.1_analytics`).

## Mobile & Responsive Design Standard
- All UI layouts, components, tables, navigation bars, cards, and forms MUST be fully responsive across mobile (320px+), tablet, and desktop screens.
- Use mobile-friendly layouts (flex wrap, CSS grid `minmax`, horizontal table scroll wrappers, touch-friendly tap targets).
