import State from './state.js';

class Renderer
{
	constructor()
	{
        gl.disable(gl.DEPTH_TEST);
	}

	draw(state, dt)
	{
		if (!state) { return; }
				
		gl.clearColor(0.2, Math.sin(state.time_s), 0.25, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
}

export default Renderer;