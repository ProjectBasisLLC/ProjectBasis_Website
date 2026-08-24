# Project Basis — Website

A recreation of the Project Basis LLC marketing site + internal DIT Workspace tool,
rebuilt from a Base44 export after the original Base44 project could not be pulled
into this repo directly (Base44's GitHub export requires a paid plan and only
exports the frontend, not the backend/auth/data layer it depended on).

## What this is

A single-page app, plain HTML/CSS/JS, no build step, no dependencies:

- **`index.html`** — markup for all three "views" (see below)
- **`styles.css`** — all styling (dark theme, gold accent)
- **`script.js`** — SPA routing, auth, and the DIT Workspace tool logic
- **`assets/images/Logo3_withBG.png`** — the "PROJECT BASIS" badge logo, with
  real alpha transparency so it blends into the dark nav/hero with no edge seam

The page has three views, toggled by JS (`showView()`), not real routes:

1. **`#view-main`** — the public marketing site (hero, services, about, work, contact)
2. **`#view-login`** — sign in / register gate for the DIT Workspace
3. **`#view-workspace`** — the DIT Workspace tool: Production Reports (daily report +
   project completion report), Pre-Production Checklist, Post-Production Checklist,
   and a Services Contract generator

## Running it locally

No build step — just serve the folder statically, e.g.:

```
python -m http.server 8000
```

then open `http://localhost:8000/index.html`. (Opening `index.html` directly via
`file://` also works for the marketing site, but some browsers restrict
`localStorage` on `file://` origins, which the Workspace tool depends on.)

## ⚠️ Auth is a client-side demo, not production security

`script.js` stores accounts and sessions in `localStorage`, with a `simpleHash()`
function (not a real cryptographic hash) standing in for password hashing, and a
hardcoded `ACCESS_CODE` gate on registration. This is fine for a low-stakes
internal tool where the "worst case" is someone view-only browsing blank forms,
but it is **not** real authentication — anyone can read the "hashed" password
straight out of DevTools, and there's no server backing any of it. If this ever
needs to protect anything sensitive (real production data, client info), it
needs a real backend before that happens.

## Content accuracy — DIT domain knowledge

The Pre-Production Checklist, Post-Production Checklist, and Services Contract
tabs contain DIT-specific terminology, workflow steps, and industry practices
(checksums, LUTs, codecs, delivery specs, etc.). When extending or correcting
this content, cross-check it against the **`dit-workflow`** Claude Code skill at
`C:\Users\projectbasis\Documents\GitHub\DIT\skills` — that's the maintained
reference for Project Basis LLC's DIT knowledge (camera settings, codecs, color
science, business/legal paperwork, etc.) and should be the source of truth if
this site's copy ever drifts from it.

## Company info (for consistency across the site)

- Project Basis LLC — 1815 Vermilion Rd, Duluth, MN 55803 — (424) 325-8892 —
  projectbasisllc@gmail.com — EIN 81-4344394
- Brand colors used in the CSS: background `#0a0a0a`/`#111`/`#161616`, gold accent
  `#C8922A`, off-white text `#f5f0eb`
- DIT / signer on the contract template: William J Cox

## Known quirks fixed during recreation

The Base44 "Save As" export had two spots of corrupted/dropped markup (a missing
workspace nav bar, and a scrambled contract clause) and two pre-existing stray
`</div>` tags left over from Base44's own AI edits. All were identified and fixed
during the rebuild — see git history for details if something looks off.

## Source material

`website downloads/` holds the four raw Base44-exported HTML snapshots this
site was rebuilt from, kept for reference/diffing. They are not part of the live
site.
