from __future__ import annotations

import re
from typing import Dict, List

PATTERNS = dict([
    ("company", r"##\s*COMPANY\s*SNAPSHOT\s*[—-]\s*(.+)"), ("website", r"-\s*Website:\s*([^\s]+)"),
    ("revenue_range", r"-\s*Revenue\s*\(est\.?\):\s*([^\n]+)"), ("employees_est", r"-\s*Employees\s*\(est\.?\):\s*([^\n]+)"),
    ("hiring_rq", r"-\s*Current\s*Hiring\s*\(Reg/Quality\):\s*([^\n]+)"), ("sku_count", r"-\s*Estimated\s*Sku\s*Count:\s*([^\n]+)"),
    ("ig_followers", r"-\s*Digital\s*Footprint:\s*IG\s*([^;\n]+);"), ("function_seniority", r"-\s*Function\s*/\s*Seniority:\s*([^\n]+)"),
    ("fit_score", r"-\s*Fit\s*Score:\s*([^\n]+)"), ("suggested_hook", r"-\s*Suggested\s*Hook:\s*([^\n]+)"),
])


def _match(pattern: str, text: str) -> str:
    found = re.search(pattern, text, re.IGNORECASE)
    return found.group(1).strip() if found else ""


def _split(value: str) -> List[str]:
    return [item.strip(" •-\t").strip() for item in re.split(r"[\/,;]", value or "") if item.strip()]


def _news(text: str) -> List[str]:
    block = re.search(r"-\s*Recent News.*?(\n(?:\s*[•\-].*\n?)+)", text, re.IGNORECASE)
    if not block:
        return []
    out: List[str] = []
    for line in block.group(1).splitlines():
        if line.strip().startswith(("•", "-")):
            cleaned = line.strip().lstrip("•-").strip()
            if cleaned:
                out.append(cleaned)
        if len(out) == 2:
            break
    return out
def _sources(lines: List[str]) -> List[str]:
    found: List[str] = []
    for idx, line in enumerate(lines):
        if line.strip().lower().startswith("sources:"):
            j = idx + 1
            while j < len(lines) and lines[j].strip().startswith("•"):
                entry = lines[j].strip().lstrip("•").strip()
                if entry:
                    found.append(entry)
                j += 1
    return found
def parse_snapshot(snapshot: str) -> Dict[str, object]:
    if not snapshot:
        return {}

    text = snapshot.strip()
    lines = snapshot.splitlines()
    data: Dict[str, object] = {key: _match(pattern, text) for key, pattern in PATTERNS.items()}

    label = re.search(r"-\s*Label\s*Holder\?:\s*([^\n—-]+)(?:[—-]\s*evidence:\s*(.*))?", text, re.IGNORECASE)
    if label:
        data.update({"label_holder": label.group(1).strip(), "label_holder_evidence": (label.group(2) or "").strip()})

    data["sales_channels"] = _split(_match(r"-\s*Sales\s*Channels:\s*([^\n]+)", text))
    data["product_categories"] = _split(_match(r"-\s*Product\s*Categories:\s*([^\n]+)", text))

    retailers = re.search(r"-\s*Retailers:\s*Sephora\s*([^;\n]+);\s*Ulta\s*([^;\n]+);\s*Target\s*([^;\n]+);\s*Walmart\s*([^;\n]+);\s*Other:\s*([^\n]+)", text, re.IGNORECASE)
    if retailers:
        data.update(dict(zip(["retailer_sephora", "retailer_ulta", "retailer_target", "retailer_walmart", "retailers_other"], [part.strip() for part in retailers.groups()])))

    rq = re.search(r"-\s*Regulatory/Quality\s*Function:\s*([^\n—-]+)(?:[—-]\s*evidence:\s*(.*))?", text, re.IGNORECASE)
    if rq:
        data.update({"rq_function": rq.group(1).strip(), "rq_evidence": (rq.group(2) or "").strip()})

    high = re.search(r"High-Risk\s*Signals:\s*SPF\?\s*([^•]+)•\s*Drug-like\s*claims\?\s*([^•]+)•\s*Actives.*?\?\s*([^\n]+)", text, re.IGNORECASE)
    if high:
        data.update(dict(zip(["hr_spf", "hr_druglike", "hr_actives"], [part.strip() for part in high.groups()])))

    for idx, item in enumerate(_news(text), start=1):
        data[f"news{idx}"] = item

    tiktok = _match(r"-\s*Digital\s*Footprint:\s*IG\s*[^;]+;\s*TikTok\s*([^\n]+)", text)
    if tiktok:
        data["tiktok"] = tiktok

    primary = re.search(r"-\s*Primary\s*Contact:\s*([^—]+)[—-]\s*([^—]+?)(?:\s*\([^)]*\))?[—-]\s*(https?://\S+)", text, re.IGNORECASE)
    if primary:
        data.update({"person_full_name": primary.group(1).strip(), "title": primary.group(2).strip(), "linkedin_url": primary.group(3).strip()})
    elif not data.get("person_full_name"):
        fallback = _match(r"##\s*CONTACT\s*SNAPSHOT\s*[—-]\s*([^,\n]+)", text)
        if fallback:
            data["person_full_name"] = fallback

    tenure = re.search(r"-\s*Tenure:\s*~?([\d\.]+)\s*yrs\s*@\s*company;\s*~?([\d\.]+)\s*yrs\s*industry", text, re.IGNORECASE)
    if tenure:
        data.update(dict(zip(["tenure_company", "years_in_industry"], [part.strip() for part in tenure.groups()])))

    scope = _match(r"-\s*Role\s*Scope\s*/\s*Decision\s*Power:\s*([^\n]+)", text)
    if scope:
        data["decision_budget"] = scope.split(";")[-1].strip()
    data["decision_hiring"] = "Unknown"

    summary = re.search(r"-\s*Fit\s*Summary:\s*(.*?)-\s*Fit\s*Score:", text, re.IGNORECASE | re.DOTALL)
    if summary:
        data["fit_summary"] = re.sub(r"\n\s*", " \n", summary.group(1).strip()).strip()

    sources = _sources(lines)
    if sources:
        data["sources"] = ", ".join(sources)

    for key in ("hr_spf", "hr_druglike", "hr_actives", "tiktok"):
        if key in data:
            lower = data[key].strip().lower()
            data[key] = "Y" if lower.startswith("y") else "N" if lower.startswith("n") else "Unknown" if "unk" in lower or not lower else data[key]

    return {k: v for k, v in data.items() if v not in ("", [], None)}
