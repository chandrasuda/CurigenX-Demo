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
