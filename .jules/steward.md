## 2026-01-25 - [Sentinel] - [Tailwind Play CDN CORS Constraint]
**Insight:** The Tailwind Play CDN (`https://cdn.tailwindcss.com`) does not serve `Access-Control-Allow-Origin` headers. This prevents the use of Subresource Integrity (SRI) because `integrity` requires `crossorigin="anonymous"`, which fails without CORS headers.
**Protocol:** Do not attempt to add SRI to `cdn.tailwindcss.com` scripts unless the CDN configuration changes or the architecture moves to a local build.

## 2026-02-04 - [Palette] - [Mobile Input Latency]
**Insight:** Standard buttons trigger a 300ms delay on mobile browsers to detect double-tap gestures, degrading perceived responsiveness.
**Protocol:** All interactive elements must apply `touch-action: manipulation` (Tailwind: `touch-manipulation`) to disable double-tap zoom and eliminate the delay.
