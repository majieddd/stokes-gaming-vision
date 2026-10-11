# New Channel Launch Vision Doc

A portable skill/plugin for producing the complete seven-chapter creator launch deliverable, with required vision intake and format feedback before large-scale expansion. The blueprint is at `skills/new-channel-launch-vision/references/blueprint.md`.

## Use in Codex

The skill folder can be placed at `$CODEX_HOME/skills/new-channel-launch-vision` (or `~/.codex/skills/new-channel-launch-vision`). Invoke `$new-channel-launch-vision` in a task that discovers it. This authoring session installed a copy in the user's local Codex skills folder; runtime discovery may require starting a new task or refreshing skills.

The bundle also includes Codex and Claude plugin manifests. These describe the same skill and references; no live plugin-manager installation is claimed. Claude Code supports loading the bundle as a local plugin via its existing plugin workflow. Retain the full folder so relative reference and asset links continue to work.

## Begin a project

Copy `assets/intake-template.json` and `assets/launch-plan-template.json` into a project as `intake.json` and `launch-plan.json`. Use `assets/vision-doc-template.md` for the document outline. The agent gathers vision, resources and delivery scope, researches actual evidence, reviews the format board with the user, then expands and generates the complete catalogue.

Python 3.10+ is sufficient for the included validator; it has no third-party dependencies. Selected originals are PNG/JPEG; responsive WebP previews are optional.

```text
python skills/new-channel-launch-vision/scripts/validate_launch_plan.py path/to/launch-plan.json --stage draft
python skills/new-channel-launch-vision/scripts/validate_launch_plan.py path/to/launch-plan.json --stage complete --asset-root path/to/project --report path/to/review.json
python skills/new-channel-launch-vision/scripts/test_validation.py
```

## Influint access

Start with the current public `https://majieddd.github.io/influint-channels-public/intelligence.html` and discovery document. The skill documents the authenticated MCP/API route but deliberately does not auto-configure an unknown host or credentials. Public exports are usable, with their source dates and access limitations preserved. Neither the skill nor the public connector generates private analytics by itself.

No source PDFs, credentials, client-private analytics or creator image assets are redistributed in this plugin. The supplied thumbnail guides are paraphrased into review criteria; the Stokes project brief stays outside the reusable bundle.
