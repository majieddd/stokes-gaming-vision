"""Validate portable launch data and selected assets; no network or external writes."""
import argparse
import hashlib
import json
import math
import re
import struct
from collections import Counter
from pathlib import Path

CHAPTERS = ["Ideation", "Packaging", "Creative", "Production", "Post-Production", "Shorts Strategy", "Data Analysis"]
SECTIONS = ["packaging", "creative", "production", "post_production", "shorts_strategy", "data_analysis"]


def image_size(path):
    data = path.read_bytes()
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        return struct.unpack(">II", data[16:24])
    if data.startswith(b"\xff\xd8"):
        pos = 2
        while pos + 4 <= len(data):
            if data[pos] != 255:
                pos += 1
                continue
            while pos < len(data) and data[pos] == 255:
                pos += 1
            if pos >= len(data):
                break
            marker = data[pos]
            pos += 1
            if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
                continue
            length = int.from_bytes(data[pos:pos + 2], "big")
            if length < 2 or pos + length > len(data):
                break
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                height, width = struct.unpack(">HH", data[pos + 3:pos + 7])
                return width, height
            pos += length
    raise ValueError("Selected originals must be readable PNG or JPEG; WebP can be an auxiliary preview.")


def validate(plan, stage="draft", asset_root=None):
    errors, warnings, coverage = [], [], []
    complete = stage == "complete"
    root = Path(asset_root).resolve() if asset_root else None

    def fail(message, final_only=False):
        (warnings if final_only and not complete else errors).append(message)

    def required(row, fields, label):
        for field in fields:
            if not row.get(field):
                fail(f"{label}: missing {field}", True)

    def indexed(rows, key, label):
        counts = Counter(str(row.get(key)) for row in rows)
        for value, count in counts.items():
            if value in ("None", "") or count > 1:
                fail(f"{label}: missing or duplicate {key} {value}")
        return {str(row.get(key)): row for row in rows}

    if plan.get("schema_version") != "1.0":
        fail("Unsupported schema_version; expected 1.0")
    if plan.get("chapters") != CHAPTERS:
        fail("Seven chapters must appear in the declared order")
    project = plan.get("project", {})
    required(project, ["channel_name", "promise", "audience", "presentation", "language"], "project")
    scope = plan.get("scope", {})
    for field in ("format_count", "episodes_per_format"):
        value = scope.get(field)
        if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
            fail(f"scope: {field} must be a positive integer", True)
    threshold = scope.get("outlier_threshold", 2.0)
    if isinstance(threshold, bool) or not isinstance(threshold, (int, float)) or not math.isfinite(threshold) or threshold <= 0:
        fail("scope: outlier_threshold must be positive and finite")
        threshold = 2.0

    formats = indexed(plan.get("formats", []), "id", "formats")
    ideas = indexed(plan.get("ideas", []), "id", "ideas")
    sources = indexed(plan.get("sources", []), "id", "sources")
    profiles = indexed(plan.get("production_profiles", []), "id", "production profiles")
    thumbnails = indexed(plan.get("thumbnail_manifest", []), "idea_id", "thumbnails")
    if isinstance(scope.get("format_count"), int) and len(formats) != scope["format_count"]:
        fail("Format count does not match scope", True)
    review = plan.get("format_review", {})
    if review.get("status") != "reviewed":
        fail("Format direction has not been recorded as reviewed", True)
    if complete and set(map(str, review.get("selected_format_ids", []))) != set(formats):
        fail("Reviewed format IDs do not match the final portfolio")

    for key, source in sources.items():
        required(source, ["video_id", "title", "channel_id", "channel", "creator_group", "url", "thumbnail_url", "observed_at", "source_url", "source_kind"], f"source {key}")
        url = source.get("url", "")
        vid = source.get("video_id", "")
        if vid and not re.fullmatch(r"[A-Za-z0-9_-]{11}", vid):
            fail(f"source {key}: video_id is not a YouTube ID")
        if url and (not re.match(r"https://(www\.)?(youtube\.com|youtu\.be)/", url) or vid not in url):
            fail(f"source {key}: primary URL and video ID disagree")
        if complete and source.get("source_kind") == "test-fixture":
            fail(f"source {key}: synthetic fixture cannot be final evidence")
        metric = source.get("performance", {})
        lift = metric.get("lift")
        if lift is not None:
            if isinstance(lift, bool) or not isinstance(lift, (int, float)) or not math.isfinite(lift) or lift < 0:
                fail(f"source {key}: invalid lift")
            required(metric, ["basis", "window", "baseline_definition", "lift_origin"], f"source {key} performance")
            if metric.get("lift_origin") == "computed":
                baseline, views = metric.get("baseline_value"), metric.get("views")
                if not isinstance(baseline, (int, float)) or baseline <= 0 or not isinstance(views, (int, float)):
                    fail(f"source {key}: computed lift lacks numeric numerator/baseline")
                elif not math.isclose(lift, views / baseline, rel_tol=1e-5):
                    fail(f"source {key}: computed lift does not match its data")

    def bindings(refs, label):
        qualifying_channels, creator_groups = set(), set()
        for ref in refs:
            source = sources.get(str(ref.get("source_id")))
            if not source:
                fail(f"{label}: unknown source {ref.get('source_id')}")
                continue
            if ref.get("match") not in ("exact", "family", "adjacent"):
                fail(f"{label}: invalid match level")
            required(ref, ["relevance"], label)
            metric = source.get("performance", {})
            lift = metric.get("lift")
            valid = isinstance(lift, (int, float)) and not isinstance(lift, bool) and math.isfinite(lift) and lift >= threshold
            if valid and metric.get("basis") and metric.get("baseline_definition") and ref.get("match") in ("exact", "family"):
                qualifying_channels.add(source.get("channel_id"))
                if source.get("creator_group") not in (None, "", "unknown"):
                    creator_groups.add(source["creator_group"])
        return len(qualifying_channels), len(creator_groups)

    counts = Counter(str(idea.get("format_id")) for idea in ideas.values())
    for key, fmt in formats.items():
        required(fmt, ["name", "promise", "mechanic", "title_shape", "gamer_reward", "non_gamer_reward", "brand_transfer", "production_tier", "phase"], f"format {key}")
        for source_id in fmt.get("source_ids", []):
            if str(source_id) not in sources:
                fail(f"format {key}: unknown source {source_id}")
        if isinstance(scope.get("episodes_per_format"), int) and counts[key] != scope["episodes_per_format"]:
            fail(f"format {key}: expected {scope['episodes_per_format']} episodes, found {counts[key]}", True)

    for key, idea in ideas.items():
        if str(idea.get("format_id")) not in formats:
            fail(f"idea {key}: unknown format")
        required(idea, ["title", "summary", "title_shape", "ingredients", "why", "objective", "rules", "escalation", "payoff", "gamer_reward", "non_gamer_reward", "phase", "people"], f"idea {key}")
        intro = idea.get("intro", [])
        if [(beat.get("start"), beat.get("end")) for beat in intro] != [(0, 5), (5, 15), (15, 30)] or any(not beat.get("beat") for beat in intro):
            fail(f"idea {key}: needs three concrete 0-5 / 5-15 / 15-30 beats", True)
        if str(idea.get("production_profile_id")) not in profiles:
            fail(f"idea {key}: missing or unknown production profile", True)
        evidence = idea.get("evidence", {})
        axes = {axis: bindings(evidence.get(axis, []), f"idea {key} {axis}") for axis in ("shape", "ingredient")}
        coverage.append({"idea_id": idea["id"], "shape_channels": axes["shape"][0], "ingredient_channels": axes["ingredient"][0], "shape_creator_groups": axes["shape"][1], "ingredient_creator_groups": axes["ingredient"][1]})
        if min(v[0] for v in axes.values()) < 2:
            message = f"idea {key}: evidence below two outlier channels on both axes"
            (errors if scope.get("require_full_evidence_coverage") else warnings).append(message)
            if not evidence.get("gaps"):
                fail(f"idea {key}: unresolved coverage needs an explicit gap", True)
        if any(channels >= 2 and groups < 2 for channels, groups in axes.values()):
            warnings.append(f"idea {key}: channel diversity is not independent creator replication")
        if key not in thumbnails:
            fail(f"idea {key}: selected thumbnail missing", True)

    for key, profile in profiles.items():
        required(profile, ["currency", "cost_status", "line_items", "people", "prep_time", "record_time"], f"profile {key}")
        sums = [0.0, 0.0]
        pools = set()
        for line in profile.get("line_items", []):
            low, high = line.get("low"), line.get("high")
            if not all(isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x) and x >= 0 for x in (low, high)) or high < low:
                fail(f"profile {key}: invalid cost range")
                continue
            sums[0] += low
            sums[1] += high
            pools.add(line.get("pool"))
        if len(pools) > 1 or any(pool not in ("per-video", "one-time", "monthly") for pool in pools):
            fail(f"profile {key}: split cost pools into separate profiles")
        if any(not isinstance(profile.get(field), (int, float)) or not math.isclose(profile[field], total, abs_tol=0.01) for field, total in zip(("low", "high"), sums)):
            fail(f"profile {key}: totals do not equal additive line items")

    for key, item in thumbnails.items():
        if key not in ideas:
            fail(f"thumbnail {key}: has no idea")
        required(item, ["file", "sha256", "prompt_file", "prompt_sha256", "generator", "actual_model", "reference_source_ids"], f"thumbnail {key}")
        if item.get("review_status") != "reviewed":
            fail(f"thumbnail {key}: selected image has not been reviewed", True)
        requested, actual = item.get("requested_model"), item.get("actual_model")
        if requested and actual != requested and not item.get("model_substitution_approved"):
            fail(f"thumbnail {key}: model change/unverified route requires the user's recorded choice", True)
        for source_id in item.get("reference_source_ids", []):
            if str(source_id) not in sources:
                fail(f"thumbnail {key}: unknown reference source {source_id}")
        for field, hash_field in (("file", "sha256"), ("prompt_file", "prompt_sha256")):
            if not root:
                if complete:
                    fail("Complete asset checks require --asset-root")
                break
            path = (root / item.get(field, "")).resolve()
            if not path.is_relative_to(root):
                fail(f"thumbnail {key}: path escapes asset root")
                continue
            if not path.is_file():
                fail(f"thumbnail {key}: {field} file missing", True)
                continue
            if hashlib.sha256(path.read_bytes()).hexdigest() != item.get(hash_field):
                fail(f"thumbnail {key}: {field} checksum mismatch")
            if field == "file":
                try:
                    width, height = image_size(path)
                    if (width, height) != (item.get("width"), item.get("height")) or abs(width / height - 16 / 9) > 0.015:
                        fail(f"thumbnail {key}: actual dimensions disagree or are not 16:9")
                except (ValueError, ZeroDivisionError, struct.error) as exc:
                    fail(f"thumbnail {key}: {exc}")

    retention = plan.get("retention", {})
    if retention.get("status") not in ("measured", "qualitative", "unavailable"):
        fail("Invalid retention status")
    if retention.get("status") != "measured" and not retention.get("gap"):
        fail("Retention access/measurement gap must be stated", True)
    if retention.get("status") == "measured" and not retention.get("cases"):
        fail("Measured retention status requires actual cases", True)
    for case in retention.get("cases", []):
        if str(case.get("source_id")) not in sources:
            fail("Retention case points to an unknown video")
        required(case, ["basis", "data_source", "duration_sec"], "retention case")
        duration = case.get("duration_sec", 0)
        points = case.get("points", [])
        if retention.get("status") == "measured" and len(points) < 2:
            fail("Measured retention case lacks real curve points", True)
        for record in points + case.get("moments", []):
            sec = record.get("sec")
            if not isinstance(sec, (int, float)) or not 0 <= sec <= duration:
                fail("Retention timestamp lies outside the video")
        if any(not isinstance(point.get("retention_pct"), (int, float)) or point["retention_pct"] < 0 for point in points):
            fail("Invalid retention percentages")

    for short in plan.get("shorts_formats", []):
        required(short, ["id", "name", "promise", "hook", "beats", "source_ids", "production_need", "cost_basis"], "Shorts format")
        for key in short.get("source_ids", []):
            if str(key) not in sources:
                fail(f"Shorts format references unknown source {key}")
        for key in short.get("related_idea_ids", []):
            if str(key) not in ideas:
                fail(f"Shorts format references unknown idea {key}")
    if not plan.get("shorts_formats"):
        fail("Sourced Shorts formats are missing", True)
    for section in SECTIONS:
        if not plan.get("sections", {}).get(section):
            fail(f"Authored chapter missing: {section}", True)
    return {"stage": stage, "passed": not errors, "errors": list(dict.fromkeys(errors)), "warnings": list(dict.fromkeys(warnings)), "counts": {"formats": len(formats), "ideas": len(ideas), "sources": len(sources), "selected_thumbnails": len(thumbnails)}, "coverage": coverage}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", type=Path)
    parser.add_argument("--stage", choices=["draft", "complete"], default="draft")
    parser.add_argument("--asset-root", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    try:
        report = validate(json.loads(args.plan.read_text(encoding="utf-8")), args.stage, args.asset_root)
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as exc:
        report = {"stage": args.stage, "passed": False, "errors": [f"Could not validate plan: {exc}"], "warnings": []}
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
