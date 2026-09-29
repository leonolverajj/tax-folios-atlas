# Background workflow: art that supports the folio, never replaces it

Each folio sits on a generated background (`countries/<id>/background.webp`). The background carries **atmosphere only**: the country's silhouette, a geographic motif, astrolabe rings, faint nebulae behind each level. It carries **no lines, no sockets, no labels and no hit areas**: those are drawn live from the core coordinates and would drift if baked into an image.

## The loop (per country)

1. **Finalise the data**: levels, parents, instruments (`country.json`, `taxes.json`).
2. **Choose sizes and positions** in the defined coordinate system: a 1600 × 1000 canvas in `layout.json`. Sizes come from revenue (the national total), not from taste. `npm run layouts:init -- <id> --force` proposes an arrangement; the layout editor refines it.
3. **Render the real folio without any art**: `node scripts/shot-bare.mjs <id>` writes `docs/workflow/<id>-1-bare.png` (the app with `?nobg`). This is the ground truth that the art must serve.
4. **Create the background** from the real positions: `npm run backgrounds -- <id>` writes `background.webp` and a preview `docs/workflow/<id>-2-background.png`. The generator places each level's nebula behind its actual cores, keeps the silhouette out from under the labels, and lets the country's motif fill the empty space.
5. **Overlay the live cores on the art**: `node scripts/shot-overlay.mjs <id>` writes `docs/workflow/<id>-3-overlay.png`.
6. **Compare** the overlay with the bare folio and with the intent: is every label still legible, does the silhouette read as the country, do the nebulae group the levels? If cores were moved, re-run step 4 (the nebulae follow the cores).
7. **Revise** the art (opacity, motif, projection) or the positions, and repeat from 3 until they work together.
8. **Verify**: `node scripts/verify.mjs all --only=<id>` measures in Chrome that every edge still joins its cores after selecting, zooming, resizing and dragging, on desktop, tablet and phone.

## Per-country motifs

| Country | Motif key | What it draws |
|---|---|---|
| Canada | `aurora` | Auroral ribbons over the boreal Shield with glacial-lake speckle |
| United States | `survey-grid` | The Public Land Survey township-and-range grid over contour lines, with a time-zone meridian arc |
| Brazil | `river-basin` | A branching river-basin network and canopy texture, the Southern Cross among the stars |
| Mexico | `sierra-belt` | The Sierra Madre ranges converging on the volcanic belt, the Tropic of Cancer |
| Colombia | `three-cordilleras` | The three Andean cordilleras fanning out from the Colombian Massif, the equator line |
| Japan | `island-arc` | The volcanic island arc and the Nankai Trough, with a solar disc rising and seigaiha waves |
| Bolivia | `salt-altiplano` | Salt-crust hexagons of the Uyuni flats and stepped Andean ridgelines |
| any new country | `topo` | Generic topographic contours; replace with a bespoke motif when there is one |

## Rules

- Never put information in the art that the data does not have. The motif note in `country.json` (`theme.motifNote`) states its geographic reference in one line, and the country panel shows it.
- Keep the file size reasonable (about 0.6 to 1 MB as WebP). The art fades to transparent at the edges, so panning past the canvas shows no seam.
- A new country works with no code change: a Mercator fit and the generic motif are used until you add a `GEO` projection entry or a motif in `scripts/generate-backgrounds.ts`.
