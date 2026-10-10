import { State, Customer, Potion } from './state.js';
import { Color } from './color.js';
import { palette } from './palette.js';

function nextCustomer(state)
{
	const skill = state.player.skill;
	var color = null;
	var tolerance = 1 - skill;

	if (skill < 0.25) {
		// We don't care what color they choose
	} else if (skill < 0.5) {
		color = palette().primaries.pick();
	} else if (skill < 0.75) {
		color = palette().secondaries.pick();
	} else {
		color = palette().tertiaries.pick();
	}

	var minColor = null, maxColor = null;

	if (color) {
		minColor = new Color(color.h - tolerance * 360, color.s - tolerance, color.v - tolerance);
		maxColor = new Color(color.h + tolerance * 360, color.s + tolerance, color.v + tolerance);
	}

	// TODO: if we want volume to be part of the target, replace 0 and 1 with something skill derived
	const minPotion = new Potion(minColor, 0);
	const maxPotion = new Potion(maxColor, 1);

	// TODO: choose spook name
	return new Customer('ghost', minPotion, maxPotion);
}

function submitBrew(state)
{
	if (state.customers.length == 0) { return; }

	if (state.customers.last().satisfied_with_potion(state.culdron)) {
		state.player.correct += 1
		state.customers.pop();
	}
}

export { nextCustomer, submitBrew };