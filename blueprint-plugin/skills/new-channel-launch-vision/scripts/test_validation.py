"""Exercise observable data/asset failure cases without network or publication."""
import copy
import hashlib
import json
import struct
import tempfile
import zlib
from pathlib import Path
from validate_launch_plan import validate


def png(width, height):
    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))
    pixels = (b"\0" + b"\x80\x80\x80" * width) * height
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(pixels)) + chunk(b"IEND", b"")


def main():
    template = Path(__file__).resolve().parents[1] / "assets/launch-plan-template.json"
    with tempfile.TemporaryDirectory(prefix="launch-vision-validation-") as directory:
        root = Path(directory)
        data = json.loads(template.read_text(encoding="utf-8"))
        data["project"] = {key: "Validator fixture" for key in ("channel_name", "promise", "audience", "presentation", "language")}
        data["scope"].update(format_count=1, episodes_per_format=1)
        data["format_review"] = {"status": "reviewed", "selected_format_ids": ["test"]}
        data["formats"] = [{"id": "test", **{key: "Fixture field" for key in ("name", "promise", "mechanic", "title_shape", "gamer_reward", "non_gamer_reward", "brand_transfer", "production_tier", "phase")}}]
        source = {"id": "IuWj5GAPdWo", "video_id": "IuWj5GAPdWo", "title": "BUSTING 100 MYTHS IN 24 HOURS!!", "channel_id": "UCbp9MyKCTEww4CxEzc_Tp0Q", "channel": "Stokes Twins", "creator_group": "Stokes Twins", "url": "https://www.youtube.com/watch?v=IuWj5GAPdWo", "thumbnail_url": "https://i.ytimg.com/vi/IuWj5GAPdWo/mqdefault.jpg", "observed_at": "2026-10-05", "source_url": "https://majieddd.github.io/influint-channels-public/channels/UCbp9MyKCTEww4CxEzc_Tp0Q.html", "source_kind": "public-catalogue", "performance": {"lift": None, "lift_origin": "unavailable"}}
        data["sources"] = [source]
        idea = {"id": 1, "format_id": "test", **{key: "Fixture field" for key in ("title", "summary", "title_shape", "why", "objective", "rules", "escalation", "payoff", "gamer_reward", "non_gamer_reward", "phase", "people")}, "ingredients": ["Fixture"], "intro": [{"start": a, "end": b, "beat": "Concrete fixture beat"} for a, b in ((0, 5), (5, 15), (15, 30))], "production_profile_id": "test", "evidence": {"shape": [], "ingredient": [], "gaps": ["No performance evidence is asserted by this mechanical fixture."]}}
        data["ideas"] = [idea]
        data["production_profiles"] = [{"id": "test", "currency": "USD", "cost_status": "planning-allowance", "line_items": [{"label": "Fixture", "low": 20, "high": 50, "pool": "per-video"}], "low": 20, "high": 50, "people": "Fixture", "prep_time": "Fixture", "record_time": "Fixture"}]
        image = root / "selected.png"
        image.write_bytes(png(160, 90))
        prompt = root / "prompt.txt"
        prompt.write_text("Validator fixture; not a generated deliverable.", encoding="utf-8")
        data["thumbnail_manifest"] = [{"idea_id": 1, "file": image.name, "sha256": hashlib.sha256(image.read_bytes()).hexdigest(), "prompt_file": prompt.name, "prompt_sha256": hashlib.sha256(prompt.read_bytes()).hexdigest(), "reference_source_ids": [source["id"]], "requested_model": None, "actual_model": "unverified", "generator": "mechanical test fixture", "width": 160, "height": 90, "review_status": "reviewed"}]
        data["shorts_formats"] = [{"id": "test", **{key: "Fixture" for key in ("name", "promise", "hook", "beats", "production_need", "cost_basis")}, "source_ids": [source["id"]], "related_idea_ids": [1]}]
        data["sections"] = {key: "Mechanical fixture content; not a published plan." for key in data["sections"]}
        baseline = validate(data, "complete", root)
        assert baseline["passed"], baseline
        assert baseline["warnings"], "Evidence gap must remain visible"
        checks = ["valid structure with explicit evidence gap"]

        def reject(name, change):
            case = copy.deepcopy(data)
            change(case)
            result = validate(case, "complete", root)
            assert not result["passed"], name
            checks.append(name)

        reject("duplicate idea ID", lambda d: d["ideas"].append(copy.deepcopy(d["ideas"][0])))
        reject("wrong per-format count", lambda d: d["scope"].update(episodes_per_format=5))
        reject("unknown evidence reference", lambda d: d["ideas"][0]["evidence"].update(shape=[{"source_id": "missing", "match": "exact", "relevance": "Fixture"}]))
        reject("incorrect budget arithmetic", lambda d: d["production_profiles"][0].update(high=60))
        reject("mixed cost pools", lambda d: d["production_profiles"][0]["line_items"].append({"label": "Setup", "low": 0, "high": 0, "pool": "one-time"}))
        reject("missing opening beat", lambda d: d["ideas"][0]["intro"].pop())
        reject("wrong image checksum", lambda d: d["thumbnail_manifest"][0].update(sha256="0" * 64))
        reject("wrong actual image dimensions", lambda d: d["thumbnail_manifest"][0].update(width=1280, height=720))
        reject("asset path traversal", lambda d: d["thumbnail_manifest"][0].update(file="../outside.png"))
        reject("unapproved model substitution", lambda d: d["thumbnail_manifest"][0].update(requested_model="a-specific-model"))
        reject("synthetic source in final evidence", lambda d: d["sources"][0].update(source_kind="test-fixture"))
        reject("claimed measured curve without points", lambda d: d["retention"].update(status="measured", cases=[{"source_id": source["id"], "basis": "Fixture", "data_source": "Fixture", "duration_sec": 100, "points": []}]))
        reject("measured status without any cases", lambda d: d["retention"].update(status="measured", cases=[]))
        reject("strict evidence coverage cannot be faked", lambda d: d["scope"].update(require_full_evidence_coverage=True))
        draft = validate(json.loads(template.read_text(encoding="utf-8")), "draft")
        assert draft["passed"] and draft["warnings"]
        checks.append("intake template remains incomplete in draft")
        print(json.dumps({"passed": len(checks), "checks": checks}, indent=2))


if __name__ == "__main__":
    main()
