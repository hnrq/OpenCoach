# OpenCoach UI

A read-only viewer for OpenCoach data (diet plans, training sessions, body measurements) built with Astro and TuiCSS. Deployed to GitHub Pages.

## Stack

- [Astro 6](https://astro.build) — static site generation
- [TuiCSS](https://github.com/vinibiavatti1/TuiCss) — retro Turbo Vision-style UI
- [Tailwind CSS v4](https://tailwindcss.com) — utility layout classes
- GitHub Pages — hosting via `withastro/action`

## Project Structure

```
ui/
├── public/
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Window.astro        # Shared TuiCSS window wrapper (title prop + slot)
│   │   ├── DietCard.astro      # Diet entry detail view
│   │   ├── TrainingCard.astro  # Training session detail view
│   │   └── MeasuresCard.astro  # Body measurement detail view
│   ├── content.config.ts       # Astro content collections (diet, training, measures)
│   ├── layouts/
│   │   └── Layout.astro        # Base layout with TuiCSS nav
│   ├── styles/
│   │   └── global.css          # Tailwind import + TuiCSS overrides
│   └── pages/
│       ├── index.astro         # Homepage: goal, coach notes, latest summaries
│       └── [section]/
│           ├── index.astro     # Listing page (diet / training / measures)
│           └── [item].astro    # Detail page for a single entry
└── package.json
```

## Data Sources

Data is read at build time from the repo root via Astro Content Collections:

| Collection | Source folder | Key fields |
|---|---|---|
| `diet` | `/diet/*.json` | `daily_targets`, `meal_structure`, `adjustments` |
| `training` | `/training/*.json` | `circuits[].exercises[]`, `progression_logic` |
| `measures` | `/measures/*.json` | `core_metrics`, `mandatory_sites`, `appointment_notes` |

## Commands

Run from `ui/`:

| Command | Action |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server at `localhost:4321` |
| `pnpm build` | Build to `./dist/` |
| `pnpm preview` | Preview production build locally |

## Deployment

Deployed automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`. The `withastro/action@v5` handles build and upload; `site` and `base` are injected automatically.

To enable: go to **Settings → Pages → Source: GitHub Actions** in your repository.
