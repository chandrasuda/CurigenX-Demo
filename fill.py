from __future__ import annotations

import argparse
import os
import re
from typing import Any, Dict, List, Tuple

from dotenv import load_dotenv
from notion_client import Client

from parser import parse_snapshot

load_dotenv()
SNAPSHOT_PROP = "Research Snapshot (paste your semi-structured output)"
_PROPERTY_PAIRS = (
    "Company=company|Website=website|Person (Full Name)=person_full_name|Title=title|LinkedIn URL=linkedin_url|Revenue (Range)=revenue_range|"
    "Employees (Est.)=employees_est|Label Holder? (Y/N/Unknown)=label_holder|Label Holder Evidence=label_holder_evidence|Sales Channels (D2C/Amazon/Sephora/Ulta/Target/Walmart/Other)=sales_channels|"
    "Retailers: Sephora (Y/N)=retailer_sephora|Retailers: Ulta (Y/N)=retailer_ulta|Retailers: Target (Y/N)=retailer_target|Retailers: Walmart (Y/N)=retailer_walmart|Retailers: Other (list)=retailers_other|Reg/Quality Function (Y/N/Unknown)=rq_function|"
    "Reg/Quality Evidence=rq_evidence|Current Hiring (Reg/Quality)=hiring_rq|Product Categories=product_categories|Estimated SKU Count=sku_count|High-Risk: SPF (Y/N)=hr_spf|High-Risk: Drug-like Claims (Y/N)=hr_druglike|High-Risk: Actives (Y/N)=hr_actives|"
    "Digital: Instagram Followers (approx)=ig_followers|Digital: TikTok (Y/N/Unknown)=tiktok|Recent News #1 (date - summary - link)=news1|Recent News #2 (date - summary - link)=news2|Function / Seniority=function_seniority|Tenure @ Company (yrs)=tenure_company|Years in Industry (est)=years_in_industry|"
    "Decision Role: Hiring (Y/N/Unknown)=decision_hiring|Decision Role: Budget (Owner/Influencer/Gatekeeper/Unknown)=decision_budget|Preferred Channel (Email/LinkedIn/Unknown)=preferred_channel|Suggested Hook (one-liner)=suggested_hook|Fit Score (High/Med/Low/Disqualified)=fit_score|Fit Summary (✅ / ⚠️)=fit_summary|Sources (comma-separated)=sources"
)
PROPERTY_MAP: Dict[str, str] = dict(pair.split("=", 1) for pair in _PROPERTY_PAIRS.split("|"))

def load_client() -> Client:
    token = os.environ.get("NOTION_TOKEN")
    if not token:
        raise SystemExit("Missing NOTION_TOKEN in environment or .env file.")
    return Client(auth=token)

def clean_page_id(value: str) -> str:
    value = value.strip()
    if value.startswith("http"):
        value = value.split("/")[-1].split("?")[0]
    if "-" in value:
        value = value.split("-")[-1]
    return value.replace("-", "")

def plain(block: List[Dict[str, Any]]) -> str:
    return "".join(part.get("plain_text", "") for part in block)

READERS = {
    "title": lambda prop: plain(prop.get("title", [])), "rich_text": lambda prop: plain(prop.get("rich_text", [])),
    "select": lambda prop: (prop.get("select") or {}).get("name", ""),
    "multi_select": lambda prop: [item.get("name") for item in prop.get("multi_select", [])],
    "url": lambda prop: prop.get("url") or "", "number": lambda prop: prop.get("number"),
    "checkbox": lambda prop: prop.get("checkbox"),
}

def get_value(prop: Dict[str, Any] | None) -> Any:
    if not prop:
        return None
    reader = READERS.get(prop["type"])
    return reader(prop) if reader else None


def build_payload(properties: Dict[str, Any], parsed: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    updates: Dict[str, Any] = {}
    changes: List[str] = []
    for notion_prop, field in PROPERTY_MAP.items():
        if field not in parsed:
            continue
        prop = properties.get(notion_prop)
        if not prop:
            continue
        desired = parsed[field]
        if desired in (None, "", []):
            continue
        ptype = prop["type"]
        if ptype in {"title", "rich_text", "url", "select"}:
            desired_simple = str(desired)
            payload = {ptype: [{"text": {"content": desired_simple}}]} if ptype in {"title", "rich_text"} else (
                {ptype: desired_simple} if ptype == "url" else {ptype: {"name": desired_simple}}
            )
        elif ptype == "multi_select":
            items = desired if isinstance(desired, list) else [item.strip() for item in re.split(r"[\/,]", str(desired)) if item.strip()]
            if not items:
                continue
            desired_simple = items
            payload = {"multi_select": [{"name": item} for item in items]}
        elif ptype == "number":
            if isinstance(desired, (int, float)):
                desired_simple = float(desired)
            else:
                match = re.search(r"-?\d+(?:\.\d+)?", str(desired))
                desired_simple = float(match.group(0)) if match else None
            if desired_simple is None:
                continue
            payload = {"number": desired_simple}
        elif ptype == "checkbox":
            desired_simple = bool(desired)
            payload = {"checkbox": desired_simple}
        else:
            continue
        current = get_value(prop)
        if current == desired_simple:
            continue
        updates[notion_prop] = payload
        changes.append(f"{notion_prop}: {current!r} → {desired_simple!r}")
    return updates, changes


def process_page(page_id: str, client: Client) -> None:
    page = client.pages.retrieve(page_id=page_id)
    snapshot = get_value(page["properties"].get(SNAPSHOT_PROP)) or ""
    if not snapshot:
        print("No snapshot found; skipping.")
        return
    parsed = parse_snapshot(snapshot)
    if not parsed:
        print("Snapshot parsed with no fields; nothing to do.")
        return
    payload, changes = build_payload(page["properties"], parsed)
    if not payload:
        print("No property changes detected.")
        return
    client.pages.update(page_id=page_id, properties=payload)
    print("Updated page:")
    for line in changes:
        print(f"  - {line}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fill Notion properties from a Research Snapshot")
    parser.add_argument("--page", required=True, help="Notion page URL or ID")
    args = parser.parse_args()
    client = load_client()
    process_page(clean_page_id(args.page), client)


if __name__ == "__main__":
    main()
