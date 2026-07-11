
Redesign the Uptime Monitor dashboard with a modern, polished visual identity — this currently looks like a bare functional prototype (plain white cards, default browser-ish styling) and needs to feel like a real product.

**Overall design direction:**
Build this as a technical monitoring tool for engineers — think Vercel/Linear/Grafana-adjacent aesthetic: dark-mode-first, dense but legible, status color-coding as the primary visual language. Use a near-black background (not pure black — something like `#0A0B0D` or `#0D0E12`), a single accent color for interactive elements (pick one deliberate accent — e.g., electric blue or cyan, not the generic terracotta/orange that's an AI-design default), and reserve red/green *only* for status (down/up) so they stay meaningful and don't compete visually with the UI chrome.

Use a clean sans-serif for UI text (e.g., Inter or similar) and a monospace font for URLs, response times, and timestamps — this reinforces the "technical tool" feel and makes numeric/status data easy to scan.

**Header / top bar:**
- App title on the left, kept small and understated (this is a tool, not a marketing page).
- Move the "Add URL" action to a **button in the top-right corner** of the header. Clicking it opens a **modal/popup dialog** (centered overlay with backdrop blur or dim) containing the URL input field and a submit button. Do NOT keep the input inline on the page — remove the current always-visible input bar entirely.
- Modal should support closing via an X button, clicking the backdrop, and Escape key.
- Modal should show inline validation errors (invalid URL, duplicate URL) without closing.

**URL list / cards (main dashboard):**
- Redesign cards with better visual hierarchy: status badge should be a solid pill with color-coded background (not just colored text), using green for UP and red for DOWN, both with sufficient contrast for dark mode.
- Show URL, response time, and "checked X ago" with clear typographic hierarchy — URL should be the most prominent text, metadata (time/response time) should be visually secondary (smaller, muted color).
- Error messages (timeout, HTTP 404, etc.) should be visually distinct — subtle red-tinted background or left border accent, not just red text floating in white space.
- Add subtle hover state on cards (slight elevation/border-color change) to signal they're clickable.
- Replace the current inline expand-in-place history with: clicking a card **navigates to a dedicated full-page history view** for that URL (use client-side routing — add React Router if not already present, since this is now a real navigation need, not an inline toggle).
- **Add pagination to the main URL list.** Use the existing `getUrls({ page, limit })` API (already supports this server-side). Default to a reasonable page size (e.g., 10–15 URLs per page). Show page controls at the bottom of the list (Previous/Next + current page indicator, or numbered pages if URL count can grow large). Only fetch the current page's data — don't fetch everything and paginate client-side.

**Full-page history view (new page, not inline expansion):**
- Header with the URL name, current status, and a back button to return to the dashboard.
- Below that, a **response-time chart** (line or bar) showing recent check history visually — this is the "more visual" real estate the full page enables. Use a lightweight charting approach (e.g., simple SVG sparkline/line chart, or a minimal chart library) plotting response time over time, with down/failed checks visually marked (e.g., red dots or gaps in the line). Chart should reflect only the currently loaded/paginated data, not attempt to plot unbounded history at once.
- Below the chart, a **paginated list** of individual check records (status, response time, timestamp, error message if any) — same data as before, just given a full page with better spacing and readability instead of a cramped inline scroll box.
- **Add pagination to the check history list.** If the backend `GET /api/urls/:id/checks` doesn't currently support `page`/`limit` query params, add that support (mirror the pattern already used in `listUrls`/`getUrls` — `LIMIT`/`OFFSET` in the query, return `{ items, pagination: { page, limit, total, totalPages } }`). Default to a reasonable page size (e.g., 20 checks per page), newest-first. Add Previous/Next controls below the list.
- Fetch the current page of data on load and on page-change — no polling needed on this view.

**General polish:**
- Consistent spacing scale (e.g., 4/8/16/24/32px system), not ad-hoc margins.
- Visible keyboard focus states on all interactive elements (accessibility).
- Smooth but restrained transitions — modal open/close, card hover, page navigation, pagination page-change. Avoid excessive animation; this is a utility tool, not a landing page.
- Fully responsive — should remain usable on a narrower viewport, even though it's primarily a desktop tool.
- Pagination controls should disable/gray out Previous on page 1 and Next on the last page, and show a loading state while fetching a new page (don't blank the list while switching pages).

**Do not:**
- Use a warm cream/beige background with serif fonts (generic "AI design" look) — this needs to read as a technical/engineering tool, not a blog or marketing site.
- Add unnecessary decorative elements, illustrations, or gradients unrelated to status data.
- Break the existing polling behavior on the main dashboard (still poll every ~10s) — only the history view is a static, on-load fetch, re-fetched on page change.
- Client-side-paginate a fully-fetched dataset — pagination must be server-driven (page/limit params sent to the API) on both views.