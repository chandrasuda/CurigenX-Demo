# CurigenX

CurigenX is a SaaS platform built for regulatory, clinical, and medical writing teams in the pharmaceutical and biotech industries. Its core function is to automate and streamline quality control (QC) of Clinical Study Reports (CSRs), ensuring regulatory dossier accuracy, consistency, and scientific integrity before submission to health authorities.

## Features
- **Automated PDF Upload & Indexing:** Effortlessly upload and analyze PDF documents.
- **Intelligent Content Indexing:** Extract and organize key information from CSRs.
- **Minimal, Technical UI:** Monospace typography, black & white theme, and grid-based layout for clarity and focus.
- **Real-time Feedback:** Loading states and progress indicators for all operations.
- **Designed for Pharma & Biotech:** Built with regulatory and scientific rigor in mind.

## Tech Stack
- **Framework:** Next.js (App Router, React)
- **Styling:** Tailwind CSS, custom minimalist design
- **UI Components:** shadcn/ui, Radix Icons
- **File Uploads:** UploadThing
- **Package Manager:** [bun](https://bun.sh/)

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended over npm/yarn)
- Node.js 18+

### Installation
```sh
bun install
```

### Development
```sh
bun run dev
```

### Build
```sh
bun run build
```

### Lint
```sh
bun run lint
```

## Folder Structure
- `app/` — Next.js app directory (pages, API routes, styles)
- `components/` — UI and custom React components
- `public/` — Static assets (SVGs, images)
- `lib/` — Utility libraries (document store, upload logic)

## License
MIT

---

*Ensuring scientific integrity & regulatory accuracy for every submission.*

---

## Notion Research Snapshot Utility

Use the lightweight Python utilities in this repository to extract fields from a semi-structured Notion "Research Snapshot" block and push them into typed database properties.

### 1. Create a Notion integration

1. Visit [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) and create a new internal integration.
2. Copy the **Internal Integration Token**. This becomes `NOTION_TOKEN`.
3. Share the target database with the integration so it can read and write pages.

### 2. Prepare environment variables

1. Duplicate `.env.example` to `.env`.
2. Paste the integration token into `NOTION_TOKEN`.
3. Find the database ID (Notion → open database as full page → copy the 32-character ID from the URL) and set `NOTION_DATABASE_ID`.

### 3. Match database properties

Ensure your database contains the columns listed in the prompt (e.g. `Research Snapshot (paste your semi-structured output)`, `Run Extractor`, `Company`, `Revenue (Range)`, etc.). The scripts will silently skip properties that are missing, so you can roll out gradually.

### 4. Install Python dependencies

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 5. Run the one-shot CLI

```sh
python fill.py --page <Notion page URL or ID>
```

The script reads the snapshot, parses the fields with regular expressions, updates the page, and prints a diff of changed properties.

### 6. Run the background daemon

```sh
python daemon.py
```

Leave the process running. Every 15 seconds it checks for pages where the `Run Extractor` checkbox is true, fills properties, and toggles the checkbox off.

### 7. Customise property mapping

`fill.py` contains a `PROPERTY_MAP` dictionary (`Notion property name → parsed field key`). Rename keys there if your database uses different column titles.
