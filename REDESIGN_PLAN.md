# SwiftSend Frontend Redesign

## Confirmed direction
Bold African fintech with a gold-led identity, light and dark themes, mobile-first navigation, and a simple app-like experience across the full frontend.

## Design system
- Primary gold: #E4B638; warm gold highlight: #F1CF72.
- Ink: #171717; light canvas: #F8F7F3; dark canvas: #10100F.
- Warm neutral surfaces and borders; high-contrast typography.
- Large readable amounts, compact content hierarchy, rounded touch targets.
- Gold is reserved for brand moments, selected navigation and primary actions.

## Mobile experience
- Fixed bottom navigation: Home, Send, Wallet and Activity.
- Safe-area spacing and touch-friendly forms.
- Responsive stacked transfer rows instead of requiring wide tables.
- Desktop retains a full sidebar and secondary destinations.

## API and product integrity
- Existing authentication, authFetch, route guards and backend endpoints are preserved.
- Send Money continues to call the corridor quote endpoint and authenticated remittance creation endpoint with the existing payload shape.
- History and Dashboard continue to read authenticated remittances.
- Tracking continues to use the public tracking endpoint and existing evidence/validation actions.
- Mock wallet balance and transactions removed; no live wallet balance endpoint exists in the current frontend contract.
- Random receive ID removed; no verified receive-ID endpoint is exposed.
- Static exchange-rate examples labelled indicative, not live.
- Withdrawal no longer displays a fabricated available balance or invented processing guarantees.
- Stellar showcase now distinguishes verified Testnet transactions from mock references.

## Implemented
- Gold/ink design tokens and light/dark theme support.
- Mobile bottom navigation and simplified desktop sidebar.
- Dashboard focused on actual transfer activity and quick actions.
- Three-step Send Money flow: corridor and amount, sender/recipient details, quote review and transfer creation.
- Responsive transaction history with search and status filters.
- Clearer tracking summary and progress timeline.
- Wallet, receive, withdraw, exchange rates, profile and help redesigned.
- Landing page palette and indicative capability language updated.
- Login, registration, admin navigation and admin login aligned to gold identity.
- Admin dashboard surfaces use theme-aware design tokens.
- CI path corrected; CI now runs frontend tests, production build and lint.

## Validation
- GitHub Actions is the source of truth for automated validation.
- Test failures from stale baseline expectations were identified and test fixtures updated to match the existing dashboard redirect and ThemeProvider contract.
- Do not merge to main until tests, build and lint complete successfully and manual mobile/desktop checks are done.

## Remaining manual QA
1. Test at 320px, 375px, 768px and desktop widths.
2. Verify light/dark theme on landing, authentication, user app and admin.
3. Test real backend quote and remittance creation against each configured corridor.
4. Confirm tracking status, evidence report and admin flows against the deployed API.
5. Confirm no demo/sandbox wording is mistaken for live payment settlement.
