"""Poll Notion for pages marked with Run Extractor and populate fields."""

from __future__ import annotations

import os
import time
from typing import List

from dotenv import load_dotenv
from notion_client import Client

from fill import load_client, process_page

CHECKBOX_PROP = "Run Extractor"


def get_database_id() -> str:
    load_dotenv()
    database_id = os.environ.get("NOTION_DATABASE_ID")
    if not database_id:
        raise SystemExit("Missing NOTION_DATABASE_ID in environment or .env file.")
    return database_id


def fetch_marked_pages(client: Client, database_id: str) -> List[str]:
    response = client.databases.query(
        database_id=database_id,
        filter={"property": CHECKBOX_PROP, "checkbox": {"equals": True}},
    )
    return [result["id"] for result in response.get("results", [])]


def reset_checkbox(client: Client, page_id: str) -> None:
    client.pages.update(page_id=page_id, properties={CHECKBOX_PROP: {"checkbox": False}})


def main() -> None:
    client = load_client()
    database_id = get_database_id()
    print("Polling for pages with Run Extractor enabled… (Ctrl+C to stop)")
    while True:
        try:
            for page_id in fetch_marked_pages(client, database_id):
                print(f"Processing {page_id}…")
                process_page(page_id, client)
                reset_checkbox(client, page_id)
        except Exception as exc:  # noqa: BLE001 - log and continue
            print(f"Error while polling: {exc}")
        time.sleep(15)


if __name__ == "__main__":
    main()
