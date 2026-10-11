# Portable data contract

Use `assets/intake-template.json` for conversations and `assets/launch-plan-template.json` for the complete plan. Preserve stable IDs across edits. Keep raw research snapshots separately. The validator uses this contract; extra project fields are allowed. Existing richer data can be adapted rather than discarded.

## Root records

`project` contains channel name, promise, audience, presentation, language and mode. `scope` supplies `format_count`, `episodes_per_format`, `outlier_threshold` (normally 2.0), and whether full evidence coverage is mandatory. Counts are project inputs, not a universal default. `format_review` records status and selected format IDs. `intelligence` records route, dates, queries, claims, snapshots and gaps. `chapters` preserves the seven names in order.

`sections` contains substantive authored content or structured blocks for packaging, creative, production, post_production, shorts_strategy and data_analysis. The idea catalogue supplies Ideation. Do not mark placeholder paragraphs complete. `delivery` records audience, actual publication authorization, site URL and verification evidence.

## Formats

Each format has unique `id`, `name`, `promise`, `mechanic`, `title_shape`, `gamer_reward`, `non_gamer_reward`, `brand_transfer`, `production_tier`, `phase`, `dependencies`, `source_ids`, `review_status` and test question. `mechanic` is the repeatable engine, not merely the title. Source IDs point into the source registry. A proposal board can exist before ideas/images; it is not the complete deliverable.

## Ideas

Each idea has unique `id`, `format_id`, `title`, `summary` (one sentence), `title_shape`, `ingredients` (list), `intro` (three records with `start`, `end`, `beat`: 0/5, 5/15, 15/30), `why`, `objective`, `rules`, `escalation`, `payoff`, `gamer_reward`, `non_gamer_reward`, `game`, `phase`, `people`, `production_profile_id`, and `evidence`.

`evidence.shape` and `evidence.ingredient` are lists of `{source_id, match, relevance}`. `match` is `exact`, `family`, or `adjacent`. Only exact/family bindings with an actual qualifying outlier count toward coverage; adjacent references remain useful but do not satisfy it. `evidence.gaps` explains missing support. Different videos from one channel do not raise the distinct-channel count.

## Source registry

Each source has unique `id`, `video_id`, exact `title`, `channel_id`, `channel`, `creator_group` (known owner/group or explicit unknown), primary video `url`, `thumbnail_url`, `published_at`, `observed_at`, `source_url`, `source_kind`, and `performance`.

`performance` holds `views`, `basis`, `window`, `baseline_definition`, `baseline_sample_n`, `lift`, and `lift_origin`. `lift_origin` is `source-reported`, `computed`, or `unavailable`. Missing fields are null. Computed lift requires a numeric `baseline_value` and same-basis numerator; calculate it in code. Source-reported lift retains the source's baseline note even when sample size is not exposed. Never make first-28-day claims from public lifetime values.

Real source URLs and metadata still need read-back verification. The structural validator does not contact YouTube or prove that the contents match a claim. Source records labeled `test-fixture` are disallowed in a complete handoff.

## Production profiles

Each profile has `id`, `currency`, `cost_status` (`planning-allowance`, `quote`, `actual`), `line_items` with `label`, `low`, `high`, `pool` (`per-video`, `one-time`, `monthly`), `low`, `high` totals, `people`, `prep_time`, `record_time`, and `assumptions`. Do not mix pools in one profile: create separately linked profiles for setup/upkeep and per-video expense. Owned equipment may be listed as a dependency, not charged again. Each idea links its main per-video profile and optional additional setup/monthly profiles.

## Thumbnail manifest

One selected record per idea: `idea_id`, `file`, `sha256`, `prompt_file`, `prompt_sha256`, `reference_source_ids`, `requested_model`, `actual_model`, `generator`, `width`, `height`, `review_status`, and adaptation notes. Actual model may be `unverified` when appropriate. Use local paths relative to the project root for portable assets; no path traversal. Prompt files contain the exact final generation prompt. Additional variants can be separate auxiliary records rather than replacing the selected record. Final selection must be 16:9 and link to real episode/source IDs.

## Retention and Shorts

`retention.status` is `measured`, `qualitative`, or `unavailable`; `gap` states limitations. Each case has `source_id`, `basis`, `data_source`, `duration_sec`, `points` (`sec`, `retention_pct`) for measured data, and `moments` (`sec`, `observation`, `hypothesis`, `proposed_edit`, source footage link). Never invent a curve to satisfy the schema. With no curves, use verified qualitative moments and say what is unavailable. Retention can exceed 100% through rewatches; do not clamp real data blindly.

Each `shorts_formats` record has `id`, `name`, `promise`, `hook`, `beats`, `source_ids`, `production_need`, `cost_basis`, `related_idea_ids`, and `conversion_evidence`. Include actual Shorts records in sources, with Shorts-specific metric windows. Do not use long-form performance as a Shorts baseline.

## Workflow and validation

Draft mode reports incomplete counts/fields without calling the project complete. Complete mode requires reviewed formats, full episode counts, core fields, nonempty chapters, valid mappings, additive profiles, source evidence or explicit gaps, selected reviewed image/prompt files and matching hashes. Coverage below target is a warning unless full coverage is required; disclose it in the final work.

The script validates data, not visual quality, source truth, distinctness of creative engines, actual one-sentence prose, current game capability, browser behavior or publication. Check those independently. Use `--report path.json` for a durable validation result.
