## 2026-01-25 - [Sentinel] - [Tailwind Play CDN CORS Constraint]
**Insight:** The Tailwind Play CDN (`https://cdn.tailwindcss.com`) does not serve `Access-Control-Allow-Origin` headers. This prevents the use of Subresource Integrity (SRI) because `integrity` requires `crossorigin="anonymous"`, which fails without CORS headers.
**Protocol:** Do not attempt to add SRI to `cdn.tailwindcss.com` scripts unless the CDN configuration changes or the architecture moves to a local build.

## 2026-02-04 - [Palette] - [Mobile Input Latency]
**Insight:** Standard buttons trigger a 300ms delay on mobile browsers to detect double-tap gestures, degrading perceived responsiveness.
**Protocol:** All interactive elements must apply `touch-action: manipulation` (Tailwind: `touch-manipulation`) to disable double-tap zoom and eliminate the delay.

## 2026-02-02 - [Palette] - [Decorative Icon Noise]
**Insight:** Functional React components wrapping raw SVGs (like `Icon`) often lack accessibility context, causing screen readers to announce them as "group" or "image" without labels.
**Protocol:** All decorative icon components MUST strictly include `aria-hidden="true"` by default unless explicitly labeled.

## 2026-02-14 - [Bolt] - [Logic Extraction for Verification]
**Insight:** Embedding complex logic (like markdown generation) inside React hooks makes it inaccessible to external verification scripts (e.g., stress tests) without fragile string parsing.
**Protocol:** complex data transformation logic MUST be extracted into standalone pure functions outside the component to enable direct testing and benchmarking.

## 2026-02-15 - [Palette] - [Empty Thought Noise]
**Insight:** Empty "Thinking Process" blocks (whitespace only) degrade UX by displaying meaningless containers.
**Protocol:** The parser MUST filter out any thought parts that contain only whitespace or are empty before adding them to the conversation object.
