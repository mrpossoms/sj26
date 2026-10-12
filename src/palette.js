import { Color } from '../src/color.js';

let g_palette = {
	primaries: [
		new Color(0, 1, 1),   // red
		new Color(61, 1, 1),  // yellow
		new Color(240, 1, 1)  // blue
	],
	secondaries: [
		new Color(120, 1, 1), // green
		new Color(180, 1, 1), // cyan
		new Color(300, 1, 1)  // magenta
	],
	tertiaries: []
};

export function palette()
{
	if (g_palette.tertiaries.length == 0) {
		for (let pi = 0; pi < g_palette.primaries.length; pi++) {
			let primary = g_palette.primaries[pi];
			for (let si = 0; si < g_palette.secondaries.length; si++) {
				g_palette.tertiaries.push(g_palette.secondaries[si].mix(primary, 0.5))
			}
		}
	}

	return g_palette;
}