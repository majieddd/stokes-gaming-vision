# Stokes Gaming creative launch vision

## Actual emoji previews · November 9, 2026

Thumbnail cards and the image viewer show each emoji actually received with its own count, including mixed reactions. Empty or not-yet-loaded counts use a neutral Reactions label. The breakdown follows the existing shared-feedback sync, is cached with the counts and supports all eight GitHub reactions. Version 3 of the count cache refreshes older totals that had no emoji breakdown. Reaction chips wrap within their card; the same control still opens shared feedback.

## World’s Greatest Video Game · 19 cut-based concepts · November 8, 2026

The first canvas collection now starts with 19 independently generated thumbnail concepts drawn from the 10:42 review cut: Rainbow Road crossovers, Titans/Godzilla in the GTA city, the Nether defense/Godrick round and the Galactus finale. Each concept includes source timecodes, a distinct visual question and an Influint packaging rationale. All 311 earlier cards, artwork paths and shared-review identities are retained; the canvas has 330 concepts.

`canvas-footage-thumbnails.js` adds the concepts without replacing source artwork. `footage-thumbnails/manifest.json` records every prompt, image hash, timestamp and applied Influint claim with its standing. Source share URLs and raw footage are excluded. These are visual packaging proposals, not literal frames, measured CTR winners or promised performance gains. Shared reactions and comments use the same automatic per-thumbnail system.

## Shared feedback on every thumbnail · November 8, 2026

All 330 canvas thumbnails support shared emoji reactions and comments, including the 164 cards without a pre-created Discussion. The 166 existing numbered Discussion bindings are retained. Cards without a binding use a strict, stable `Stokes thumbnail <card ID>` term; giscus creates the Discussion on the first signed-in reaction or comment. New thumbnails use this path automatically. Feedback follows the thumbnail ID when titles, collections or views change.

Each thumbnail gets its own review iframe so switching cards cannot reuse a different card's thread, draft or pending Discussion creation. Public count readers stay anonymous; missing threads show zero counts and do not stop the queue. Counts and the Reacted filter include all emoji types. Both existing GitHub sign-in routes remain supported.

`canvas-feedback-model.js` owns routing and metadata validation. Run `node checks/feedback.test.cjs` for full-catalog coverage, stable identity, existing-thread preservation and reaction-count checks.

## GTA 6 guest-mission series · November 1, 2026

**GTA 6 With Celebrity Guests** is a separate Videos to pitch idea with eight packages: Howie Mandel, Kai Cenat, IShowSpeed, MrBeast, Kevin Hart, Snoop Dogg, Ludwig and Mark Rober. Each guest has a standalone mission story and opening, while the overall room-completion challenge keeps filming. The original Howie vault thumbnail is reused unchanged; seven new images were generated. The two earlier Kai alternatives remain linked from the series brief and in the production timeline.

`gta-guest-missions.json` preserves the exact prompts, guest-specific conditions and Influint's dated October 22 public-export evidence. This is practitioner-guided creative work, with no new-channel Studio baseline or forecast. Guest bookings, actual GTA VI footage, mission availability and prize terms are unconfirmed. Kai's race can use sequential timed runs; supported multiplayer is not assumed.

`python3 scripts/build_video_briefs.py` rebuilds the guest canvas module and all brief routes. The new seed migrates into existing saved pitch collections without moving other videos. Guest episode titles remain attached to their own thumbnails when a series title is previewed. All earlier 298 concepts and shared-review identities remain intact. Downloads include all eight images and the prompt/evidence manifest in `guest-mission-thumbnails/eight-guest-packages.zip`.

Validation: `node checks/guest-missions.test.cjs` plus the existing planning, briefs and thumbnail checks.

[Vision doc](https://majieddd.github.io/stokes-gaming-vision/) · [Thumbnail canvas](https://majieddd.github.io/stokes-gaming-vision/canvas.html)

The launch view contains five individual crossovers plus a shared Godzilla finale, Alex’s staged GTA prank and actual GTA 6 completion with first-finisher group release. Exact worlds/builds remain proposals.

Six uploads form the base goal, with a seventh stretch. The original 100 ideas, all 166 active images, four archived originals and all 170 shared Discussion mappings remain available. Launch and All ideas are views of the same canvas. Team review opens a slideshow; shared Like/Comment stays on the page and in the slideshow. GitHub sign-in is required for shared writes.

Detailed budgets and personnel costs are excluded from this public repository and creative download. The user-authorized launch timeline exposes a planning projection only; it contains no personnel costs or guest bookings. Production profiles describe scope only.

Existing generated images are concepts, not episode footage. Original generator provenance is preserved. No private CTR or retention curves are supplied; public reference performance is adjacent evidence, not causal thumbnail proof.

GitHub Pages serves the root of main. The authenticated review provider and callback remain unchanged.

[Detailed launch briefs](https://majieddd.github.io/stokes-gaming-vision/episode-details.html) cover only the three priority videos. Each includes the first 30 seconds, cast roles, playable objectives/rules, escalation, endings, contingencies, packaging directions, capture/editing, Shorts and unresolved creative choices. Proposed worlds and mechanics are not approved builds.

The 15 updated-plan thumbnails (five per priority video) appear first within their collections. Choose Updated thumbnails in the canvas scope selector to review only the new set. Original PNGs, WebP previews, prompts and the new provenance manifest are included. The built-in generator model is unverified; supporting cast are concept performers rather than verified portraits. No fixed 100-hour claim is baked into the room-challenge art.

## Launch timeline · October 29, 2026

[Department timeline and calendar](https://majieddd.github.io/stokes-gaming-vision/production-timeline.html) · [GTA guest episodes](https://majieddd.github.io/stokes-gaming-vision/production-timeline.html#guests)

The first three videos have a department-colored timeline, month calendar, editable local date scenarios, and downloadable JSON. The default post baseline is 12 calendar days, anchored to the reported Monday October 26 edit start and desired November 7 upload. Video 1 pre-edit dates are reconstructed, Video 2 is projected backward from November 14 (November 15 buffer), and actual GTA VI capture is gated to the official November 19 release. The illustrative three-day room hold does not predict game completion. Main-film post retains 12 days after capture; guest blocks use separate rolling edit streams. Guest appearances, missions and staffing remain unconfirmed.

Source: `production-timeline-plan.json`; date/dependency calculation: `production-timeline-model.js`; UI: `production-timeline.html`, `.css`, `.js`. Changes to the date form are browser-local, not shared writes. Download a scenario to share changes. `timeline-thumbnails/` contains new AI concepts; the exact prompts and tool provenance are in the plan. No existing concepts or shared review mappings are replaced.

## Self-serve video collections

The canvas has two collection views: **All ideas** and **Approved ideas** (formerly Videos to pitch). The existing `canvas.html?scope=pitch` link still opens Approved ideas. All ideas is the default view. Other default and saved custom groups are removed; their videos remain available in All ideas. Existing approved membership, title ideas and shared reviews are preserved. The eleven requested pitches retain 75 original thumbnail concepts across their related source families; new title phrasings are additional options. The theft-reward pitch uses clearly labeled related artwork, and the killer/prison reframings retain their prior titles. Original card IDs, image paths and GitHub Discussion mappings are preserved.

**Organize** adds/removes whole video ideas from Approved ideas, reorders approved videos, adds title ideas and supports Undo. All ideas always includes every video. Version 1 collection backups migrate to this two-view layout; exports use version 2. Organization and title previews persist in browser storage; they are not shared/team edits. Export/import a JSON backup to transfer organization between devices. Clearing site data clears local organization. Shared reactions/comments retain the existing provider. `canvas-collections-model.js` owns catalog/defaults/import validation; `canvas-collections.js` owns the UI and persistence.

Validation: `node checks/planning.test.cjs` covers schedule dependencies, launch gating, rolling outputs, preservation of card/image/review identity, title retention and collection backup round-trips.

## Concise creative briefs · October 29 update

[Video briefs](https://majieddd.github.io/stokes-gaming-vision/episode-details.html) now cover 24 canvas video families plus three proposed guest episodes, with 100 original idea-bank title-specific openings. Each brief has three clear steps, exact spoken opening lines, visuals, a turn, a payoff, packaging direction and two linked public reference snapshots. The World’s Best Video Game brief follows the October 23 room / shared-world route / pickle-dunk script instead of the older independent-worlds/Godzilla proposal.

Two new Stokes Twins main-channel pitches—100 Minecrafters vs 100 Halo Players, and I Simulated Every Video Game Civilization—have new concept art and join Videos to pitch. All 166 earlier cards and shared-review identities are preserved; the canvas now has 168 concepts. The two new cards have no pre-created shared-review thread; the review controls show that state rather than binding them to an unrelated discussion. Existing collection backups migrate both new ideas into Videos to pitch without moving existing assignments.

Editorial source: `video-briefs-content.json`. Reference additions: `brief-reference-updates.json`. Build with `python scripts/build_video_briefs.py`. Generated routes: `canvas-brief-map.js`; current brief data: `video-briefs.json`. Existing vision-page research and title/thumbnail options are retained; its 100 idea openings now contain spoken lines and positive show directions. The dated public metrics are reference evidence, not private CTR/retention or promised video performance.


## October 30 thumbnail directions

`thumbnail-lab.html` adds ten independently generated options to each of the thirteen Videos to pitch ideas (130 new thumbnails). Filter by video, inspect at 160 × 90, open the full image, download it, and save a browser-local shortlist. Shortlists can be exported as JSON. They do not automatically sync between devices.

The same options are appended to their existing canvas groups by `canvas-thumbnail-refresh.js`; the original 168 concepts, title variants, and review bindings stay intact. The new `refreshed` scope isolates the 130 new options. Brief pages also include the new artwork.

`thumbnail-lab/research.json` restores the dated public channel snapshots from the original manifest and creative guidance from the original prompts. Its recovery note discloses that the exact original research file and written visual-review notes were unavailable. The visual guidance is practitioner theory or warning; public views are not thumbnail CTR measurements. No predicted uplift or winner is claimed.

Every independent prompt is in `thumbnail-lab/creative-directions.json`; `thumbnail-lab/provenance.json` records the built-in image generation and image hashes. Source image references supply likeness and thumbnail craft, while the new scene and composition are specified independently. Full JPEG images preserve the generated composition; WebP previews keep the gallery light.

To rebuild after generating assets: `python scripts/build_thumbnail_lab.py`. Then run `node checks/thumbnails.test.cjs` along with the existing brief and planning checks.


### Recovery and publication verification

All 130 full JPEG thumbnails were recovered with their original SHA-256 checksums. The 168 earlier canvas concepts, title variants and review mappings are retained, and all 498 earlier image files are unchanged. Some WebP previews were re-encoded from checksum-matched original PNGs. See `thumbnail-lab/recovery-report.json` for the recovery record and the disclosed research-record limitation. Private conversation records and browser caches are excluded from this repository.

[Download the 130 new thumbnails](https://github.com/majieddd/stokes-gaming-vision/releases/download/thumbnail-recovery-2026-10-30/Stokes-New-Thumbnails-130.zip).

## Data Scouting · November 1, 2026

[Data Scouting](https://majieddd.github.io/stokes-gaming-vision/data-scouting.html) ranks the top 100 YouTube channels in a gaming genre by average views per **long-form** video posted in the last 90 days. Only each channel's Videos tab counts; Shorts and livestream replays are excluded. Every channel is marked faceless or personality (real face in thumbnails or on camera) and placed by the country it lists, with inferred countries labeled as inferred. Channels under 0.3% likes per view on sampled videos are flagged as low engagement and can be hidden.

GTA is live. Minecraft, Roblox, Fortnite and all gaming are queued as tabs. Each genre is one data file: `data-scouting/<genre>.json` (all ranked channels plus refill channels), `data-scouting/<genre>.csv` (the top 100) and `data-scouting/avatars/`. To publish a new genre, add its file and set `live: true` for it in `GENRES` at the top of `data-scouting.js`. The scraping pipeline that produces these files is kept outside this repository.

Public YouTube data only: view counts are YouTube's rounded figures and upload dates come from its relative dates, so the 90-day edge is approximate by a few days.

