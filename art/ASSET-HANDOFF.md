# Spookier art - local integration handoff

Exports come from `spooky-potion-kitchen-named.aseprite`, a 300 x 300,
single-frame source. Fifteen PNGs were exported using Aseprite into the existing
`assets/imgs/*.pixelated.png` filenames. This asset handoff excludes code changes.

## Dimensions and placement

Background, assembled stage, customers, cauldron, mask, fire frames, combined
vials, and request bubble retain their 300 x 300 canvas. Preserve those canvas
offsets when layering them; do not independently center their visible bounds.
The existing 512 x 512 test image was not changed.

Individual vials were initially trimmed on export. The artist subsequently
replaced those PNGs with cleaned versions and intentional transparent padding:

| Asset | Previous size | New size |
| --- | --- | --- |
| primary-potion-vial-red | 69 x 176 | 64 x 163 |
| primary-potion-vial-yellow | 60 x 179 | 52 x 162 |
| primary-potion-vial-blue | 70 x 161 | 72 x 170 |

Current nontransparent bounds (exclusive right/bottom) are blue
`(5, 34, 67, 153)`, red `(0, 44, 64, 163)`, and yellow `(0, 39, 52, 162)`.
The previously identified blue outliers no longer expand its visible bounds.
Padding is preserved; do not automatically trim these artist-supplied replacements.
The named Aseprite copy predates this cleanup and must not be re-exported over
these PNGs without incorporating the artist's changes.

Cauldron visible bounds are `(70, 221, 232, 297)`; mask bounds are
`(73, 225, 227, 297)`, both on the same 300 x 300 canvas. The mask was exported
as authored (orange fill), not recolored to white. Check which mask channel the
eventual shader uses.

## Manual code integration for Kirk

- The current renderer uses the background, stage, cauldron, and individual
  vials. Customers, request bubble, mask, and fire frames are available but are
  not drawn by this renderer yet.
- Individual vials use an image aspect ratio and a fixed height scale. Check
  revised sizes, rope-top pivot, screen-aspect correction order during sway,
  and hit regions on both square and wide windows. Account for the transparent
  padding and visible bounds above when selecting the rope-top pivot.
- Four happy customer variants are still the previous artwork. This source
  provides one character image per customer; new expressions need artist review.
- The combined-vials layer was hidden in the source and was exported explicitly.
  Review it before using it as a substitute for the separate new vial layers.
- `src/client.js` already has a temporary, uncommitted local workaround:
  `customers.empty()` was replaced with `customers.length === 0`. This predates
  this export and must not be included in an asset-only commit.

Original PNGs are backed up outside the repository in this session's
`files/pre-spooky-style-assets` folder. The original Aseprite file is untouched.

## Local preview check

Before the artist's vial cleanup, at a 1200 x 800 viewport, all 22 listed resources finished loading, no runtime
exceptions occurred, and rendered frames continued animating. The new background,
stage, cauldron, and individual vials appear. The vial ropes extend beyond the top
edge and the bottles occupy a large part of the upper scene; Kirk should review
scale and hanging positions against the intended composition. This confirms a
working preview, not finished gameplay or correct final placement.
