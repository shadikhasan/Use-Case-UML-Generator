# Use Case UML Generator

A Next.js web app for creating, refining, and exporting use case UML diagrams.

## Features

- Interactive UML builder at `/builder`
- Actor management with left/right side placement
- Use case management with module grouping
- Relationship types: `association`, `include`, `extend`, `generalization`
- Live diagram preview
- Click-to-edit from diagram nodes and relationship lines
- Undo/redo state history
- JSON import and export
- Export as PNG, SVG, and PDF

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- `html-to-image` (image export)
- `jspdf` (PDF export)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run Next.js lint checks
- `npm run typecheck` - Run TypeScript type checks

## Routes

- `/` - Landing page
- `/builder` - Interactive UML diagram builder
- `/contact` - Contact page

## JSON Format

The builder imports and exports this structure:

```json
{
  "systemName": "Online Shop",
  "actors": [
    { "label": "Customer", "side": "left" },
    { "label": "Admin", "side": "right" }
  ],
  "useCases": [
    { "label": "Browse Products", "module": "Shopping" },
    { "label": "Place Order", "module": "Shopping" }
  ],
  "relationships": [
    {
      "from": "Customer",
      "to": "Browse Products",
      "type": "association",
      "label": ""
    }
  ]
}
```

Notes:

- `side` defaults to `left` if omitted.
- `module` defaults to `General` if omitted.
- `from` and `to` can be labels (preferred for portability).

## Output Files

The builder exports with these default names:

- `use-case-diagram.json`
- `use-case-diagram.png`
- `use-case-diagram.svg`
- `use-case-diagram.pdf`
