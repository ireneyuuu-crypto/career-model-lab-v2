# Career Model Lab V2.5 — unified C-end reporting engine

## Changes (code, not a visual-only patch)
- New `career-features.js` is the **single shared annual GR/C projection** for `career-story.js` and `career-index.js`. The frozen GR/C and observed J/R classification modules are not altered.
- Income/value, formal position, opportunity and restructuring are tracked independently. Repeated aspects are deduplicated within each year and long events retain a single identity across years.
- Key windows are selected by **distinct career dimensions**, prioritizing value and formal position coverage, not simply raw aspects count. High activity is not by itself a positive outcome.
- Narrative distinguishes start, peak, follow-through and actor/target subtype. Specific months and year-to-year differences are attached to actual source windows; irrelevant generic cards are omitted.
- Weighted CDI remains Opportunity 15% / Expansion 25% / Position 25% / Value 35%. Explicitly experimental, no claim of empirical predictive validity; no automatic Cost subtraction from outer-planet aspects.
- Front-page summary, chart, annual text, print section and JSON now refer to the same career-story computation. Historical real-event verification remains separate and optional.
- Sample report rebuilt with **completely fictional 2030–2039 event windows**, in the same UI structure and using the same scoring/story functions. It contains no real-person demo chart.

## Critical limitations / honest acceptance status
- `npm test`: 64 passing automated tests including 6 new product regression cases; syntax checks pass.
- A Chromium/browser end-to-end test was **attempted but blocked by environment administrator** for both localhost and file URLs. No claim of browser smoke test success is made. GitHub Pages deployment is not verified.
- These tests establish internal rules and consistency, **not the accuracy of astrological predictions**. CDI 50 means neutral display baseline/no detected indicators, not average career performance or a pass mark.
- We do not fabricate actual salary, promotion, support (S), stability (ST), or J/R outcomes from transits. Those outcomes require real-world data.
- This version does not constitute an independently validated predictive product or a guarantee of a successful career event.

## Update-only deployment
Upload *all files* from `career-model-lab-v2-5-update-only.zip` to the GitHub repository root, preserving names. **New mandatory module:** `career-features.js`. Refresh after Pages finishes deploying.

## Files to update
`app.js`, `career-features.js`, `career-index.js`, `career-story.js`, `styles.css`, `index.html`, `sample.html`, `sample.js`.
The full package also includes engine, calendar, tarot, image assets, and ephemeris data as a complete rollback backup.
