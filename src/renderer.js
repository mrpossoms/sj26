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

    return model;
};

const draw_region_ncd = (tex, p, s, t, uv) => {
    const W = g.web.gfx.width(), H = g.web.gfx.height();
    // the plane's uvs are flipped on both axes, so flip the quad to match
    const model = [].mat_scale([-s[0] * tex.width / W, -s[1] * tex.height / H, 1])
    				.mat_mul([].rotation([0, 0, 1], t))
                    .mat_mul([].translate([p[0], p[1], 0]));

    g.web.assets['mesh/plane'].using_shader('sprite')
        .with_attribute({name:'a_position', buffer: 'positions', components: 3})
        .with_attribute({name:'a_tex_coord', buffer: 'texture_coords', components: 2})
        .set_uniform('u_model').mat4(model)
        .set_uniform('u_uv').vec4(uv)
        .set_uniform('u_texture').texture(tex)
        .draw_tri_fan();

    return model;
};

const draw_vial = (tex, p, t) => {
    const W = g.web.gfx.width(), H = g.web.gfx.height();
    // the plane's uvs are flipped on both axes, so flip the quad to match
    const s = 0.5;
    const model = [].mat_scale([H/W, 1, 1])
    				.mat_mul([].mat_scale([-s * (tex.width/tex.height), -s, 1]))
    				.mat_mul([].translate([0, -0.4, 0]))
    				.mat_mul([].rotation([0, 0, 1], t))
                    .mat_mul([].translate([p[0], p[1], 0]));

    g.web.assets['mesh/plane'].using_shader('sprite')
        .with_attribute({name:'a_position', buffer: 'positions', components: 3})
        .with_attribute({name:'a_tex_coord', buffer: 'texture_coords', components: 2})
        .set_uniform('u_model').mat4(model)
        .set_uniform('u_uv').vec4([0, 0, 1, 1])
        .set_uniform('u_texture').texture(tex)
        .draw_tri_fan();

    return model;
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
        	red_vial: g.web.assets['tex/primary-potion-vial-red'],
			yellow_vial: g.web.assets['tex/primary-potion-vial-yellow'],
        	blue_vial: g.web.assets['tex/primary-potion-vial-blue']
        };

        this.shaders = {
        	sprite: g.web.gfx.shader.create('sprite',
	            g.web.assets['shaders/sprite.vert'],
	            g.web.assets['shaders/sprite.frag']
	        )
        };

        this.transforms = [];

        g.web.pointer.on_press(event => {
        	let p = g.web.pointer.normalized_position(event)
        	console.log(p);

        	for (let [name, model] of Object.entries(this.transforms)) {

        		let inv_model = [].inverse(model);
				let p_local = inv_model.mat_mul([p[0], p[1], 0, 1]);

				if (p_local[0] >= -0.5 && p_local[0] <= 0.5 && p_local[1] >= -0.5 && p_local[1] <= 0.5) {
					console.log(name);
				}
			}
		});

		g.web.pointer.on_release(event => {

		});

		this.vial_phase_shift = [Math.random(), Math.random(), Math.random()];
	}

	draw(state, dt)
	{
		if (!state) { return; }
				
		gl.clearColor(0.2, 0.0, 0.25, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		draw_fit(this.textures.background);
		// draw_fit(this.textures.state);
		draw_fit(this.textures.stage);
		draw_fit(this.textures.cauldron);

    	const W = g.web.gfx.width(), H = g.web.gfx.height();
		this.transforms['red_vial'] = draw_vial(this.textures.red_vial, [-250 / W, 1.25], Math.cos(state.time_s + this.vial_phase_shift[0]) * 0.1);
		this.transforms['blue_vial'] = draw_vial(this.textures.blue_vial, [250 / W, 1.25], Math.cos(state.time_s + this.vial_phase_shift[1]) * 0.1);
		this.transforms['yellow_vial'] = draw_vial(this.textures.yellow_vial, [0 / W, 1.25], Math.cos(state.time_s + this.vial_phase_shift[2]) * 0.1);
	}
}

export { Renderer };