# SwiftSend Premium Frontend Redesign

## Direction
- Visual direction: premium fintech
- Theme support: light and dark, persisted across sessions and initially respecting system preference
- Scope: all existing public, authenticated, and supporting pages
- Stack: retain React 19, Vite, React Router, Tailwind CSS, and lucide-react

## Non-negotiable compatibility rules
- Preserve all existing route paths and route guards.
- Preserve AuthProvider, authFetch usage, API endpoints, request/response payloads, and backend contracts.
- Do not invent live exchange rates, wallet balances, settlement states, or provider integrations.
- Keep demo/sandbox data visibly identified as demo.
- Do not remove existing workflows; improve their presentation and usability.

## Design system
- Midnight navy: #101D36
- Teal: #0E9F91 (primary actions and positive states)
- Gold: #E9B949 (small premium accent)
- Light canvas: #F4F7FB; dark canvas: #0B1220
- Inter/system sans typography, tabular numerals for financial values
- 12px controls, 16–20px cards, restrained shadows, subtle borders, generous whitespace
- Responsive navigation, clear focus states, reduced-motion support

## Delivery sequence
1. Foundation: theme context, tokens, global surfaces, navigation shell, reusable page framing.
2. Public experience: landing page, pricing/rates, help and verification.
3. Authentication: login and registration visual refinement while preserving auth logic.
4. Core money movement: dashboard, send flow, wallet, receive, withdrawals.
5. Visibility and trust: transaction history, tracking timeline, evidence and status states.
6. Supporting/admin: profile, admin area, Stellar showcase, mobile and accessibility pass.
7. Verification: lint, unit tests, production build, manual route/API regression checklist.

## Current implementation checkpoint
- Added a shared theme provider with persistent light/dark preference and system preference fallback.
- Reworked the authenticated application shell and sidebar into a consistent premium workspace.
- Existing route definitions and API-facing page components remain untouched in this foundation pass.
- Next: apply the shared visual system page by page, starting with dashboard and send money.
