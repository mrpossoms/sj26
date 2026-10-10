import g from 'g.js/web';
import { State } from './state.js';

const draw_region = (tex, p, s, uv) => {
    const W = g.web.gfx.width(), H = g.web.gfx.height();
    // the plane's uvs are flipped on both axes, so flip the quad to match
    const model = [].mat_scale([-s[0] / W, -s[1] / H, 1])
                    .mat_mul([].translate([2 * p[0] / W, 2 * p[1] / H, 0]));

    g.web.assets['mesh/plane'].using_shader('sprite')
        .with_attribute({name:'a_position', buffer: 'positions', components: 3})
        .with_attribute({name:'a_tex_coord', buffer: 'texture_coords', components: 2})
        .set_uniform('u_model').mat4(model)
        .set_uniform('u_uv').vec4(uv)
        .set_uniform('u_texture').texture(tex)
        .draw_tri_fan();
};

const draw_fit = (tex) => {
	draw_region(tex, [0, 0], [g.web.gfx.width() * (1/g.web.gfx.aspect()), g.web.gfx.height()], [0, 0, 1, 1]);
};

class Renderer
{
	constructor()
	{
        gl.disable(gl.DEPTH_TEST);

        this.textures = {
			background: g.web.assets['tex/shop-background'],
        	stage: g.web.assets['tex/shop-stage-frame'],
        	cauldron: g.web.assets['tex/cauldron'],
        	primary_vials: g.web.assets['tex/primary-potion-vials'],
        };

        this.shaders = {
        	sprite: g.web.gfx.shader.create('sprite',
	            g.web.assets['shaders/sprite.vert'],
	            g.web.assets['shaders/sprite.frag']
	        )
        };
	}

	draw(state, dt)
	{
		if (!state) { return; }
				
		gl.clearColor(0.2, 0.0, 0.25, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		draw_fit(this.textures.background);
		draw_fit(this.textures.stage);
		draw_fit(this.textures.cauldron);
		draw_fit(this.textures.primary_vials);
	}
}

export { Renderer };