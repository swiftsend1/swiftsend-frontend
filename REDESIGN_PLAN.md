# SwiftSend Frontend Redesign

## Confirmed direction
Bold African fintech, gold-led identity, light and dark themes, mobile-first app-like navigation, and full frontend scope.

## Visual system
- Gold: #E4B638 and #F1CF72 for primary actions and brand moments.
- Ink: #171717 for contrast and dark surfaces.
- Light canvas: #F8F7F3; white cards; warm neutral borders.
- Dark canvas: #10100F; raised charcoal surfaces; warm grey borders.
- Large readable amounts, strong typography, rounded touch targets, simple hierarchy.
- Gold is used as an accent, never as low-contrast body text on white.

## Mobile experience
- Fixed bottom navigation: Home, Send, Wallet, Activity.
- Thumb-friendly controls, safe-area padding, compact task-focused pages.
- Secondary routes remain available through desktop navigation and contextual links.
- Dense transaction tables should become stacked cards on small screens.

## Compatibility rules
- Preserve route paths, guards, AuthProvider, authFetch, endpoints and payloads.
- Never fabricate balances, live rates, payment confirmation or settlement.
- Mark sandbox/demo values clearly.
- Preserve all existing workflows and improve presentation only.

## Progress
- Theme provider and toggle established.
- Gold/ink design tokens applied.
- Mobile bottom navigation introduced; desktop sidebar simplified.
- Dashboard uses existing /api/remittances/ data and does not invent wallet totals.
- CI workflow path corrected to repository root; validation pending.

## Remaining work
1. Landing, login and registration.
2. Send money flow and quote review.
3. Wallet, receive and withdrawal; clearly label demo values.
4. History and tracking; responsive transaction cards and timeline.
5. Rates, help, profile, admin and technical showcase.
6. Responsive, accessibility, API regression and CI verification.
