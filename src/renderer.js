import g from 'g.js/web';
import { State } from './state.js';

const lerp = (a, b, t) => a + (b - a) * t;

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
        .set_uniform('u_tint').vec4([1, 1, 1, 1])
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
        .set_uniform('u_tint').vec4([1, 1, 1, 1])
        .set_uniform('u_texture').texture(tex)
        .draw_tri_fan();

    return model;
};

const vial_model = (screen_w, screen_h, tex, p, t) => {
    const s = 0.5;
    return [].I(4)
    		 .mat_mul([].mat_scale([s * (tex.width/tex.height), s, 1]))
    		 .mat_mul([].translate([0, -0.4, 0]))
    		 .mat_mul([].rotation([0, 0, 1], t))
             .mat_mul([].translate([p[0], p[1], 0]));	
}

const draw_vial = (tex, stage_model, p, t) => {
    const W = g.web.gfx.width(), H = g.web.gfx.height();
    // the plane's uvs are flipped on both axes, so flip the quad to match
    const model = stage_model.mat_mul(vial_model(W, H, tex, p, t));

    g.web.assets['mesh/plane'].using_shader('sprite')
        .with_attribute({name:'a_position', buffer: 'positions', components: 3})
        .with_attribute({name:'a_tex_coord', buffer: 'texture_coords', components: 2})
        .set_uniform('u_model').mat4(model)
        .set_uniform('u_uv').vec4([0, 0, 1, 1])
        .set_uniform('u_tint').vec4([1, 1, 1, 1])
        .set_uniform('u_texture').texture(tex)
        .draw_tri_fan();

    return model;
};

const draw_fit = (tex) => {
	return draw_region(tex, [0, 0], [g.web.gfx.width() * (1/g.web.gfx.aspect()), g.web.gfx.height()], [0, 0, 1, 1]);
};

const draw_brew = (stage_model, tex, potion) => {
	const mask_ratio = 226/300;

	if (potion.color === null || potion.volume <= 0) { return stage_model; }

    // the plane's uvs are flipped on both axes, so flip the quad to match
    const model = stage_model.mat_mul([].translate([0, -2 + (1 - mask_ratio) * 2 * potion.volume, 0]));

    const v = lerp(mask_ratio, 1, 1 - potion.volume);
    let rgba = potion.color.RGB;
    rgba.push(1);

    g.web.assets['mesh/plane'].using_shader('sprite')
        .with_attribute({name:'a_position', buffer: 'positions', components: 3})
        .with_attribute({name:'a_tex_coord', buffer: 'texture_coords', components: 2})
        .set_uniform('u_model').mat4(model)
        .set_uniform('u_uv').vec4([0,v,1,1])
        .set_uniform('u_tint').vec4(rgba)
        .set_uniform('u_texture').texture(tex)
        .draw_tri_fan();

    return model;
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
        	blue_vial: g.web.assets['tex/primary-potion-vial-blue'],
        	cauldron_mask: g.web.assets['tex/cauldron-mask'],
        	cauldron_fire: g.web.assets['tex/cauldron-fire'],
        	cauldron_fire2: g.web.assets['tex/cauldron-fire-2'],
        	spooks: {
        		dracula: {
        			happy: g.web.assets['tex/customer-dracula-happy'],
        			sad: g.web.assets['tex/customer-dracula']
        		},
        		ghost: {
        			happy: g.web.assets['tex/customer-ghost-happy'],
					sad: g.web.assets['tex/customer-ghost']
				},
				mummy: {
					happy: g.web.assets['tex/customer-mummy-happy'],
					sad: g.web.assets['tex/customer-mummy']
				},
				pumpkin: {
					happy: g.web.assets['tex/customer-pumpkin-happy'],
					sad: g.web.assets['tex/customer-pumpkin']
				}
        	}
        };

        this.shaders = {
        	sprite: g.web.gfx.shader.create('sprite',
	            g.web.assets['shaders/sprite.vert'],
	            g.web.assets['shaders/sprite.frag']
	        )
        };

        this.transforms = [];
        this.last_pos = null;
        this.press_handlers = {};
        this.release_handler = null;

        g.web.pointer.on_press(event => {
        	let p = g.web.pointer.normalized_position(event)
        	this.last_pos = p;
        	console.log(`pos: ${p}`);

        	for (let [name, model] of Object.entries(this.transforms)) {
        		let center = [[0, 0, 0, 1]].mat_mul(model)[0];

        		let inv_model = model.inverse();
				let p_local = [[p[0], p[1], 0, 1]].mat_mul(inv_model)[0];
				let clicked = p_local[0] >= -1 && p_local[0] <= 1 && p_local[1] >= -1 && p_local[1] <= 1;

				if (clicked)
				{
					console.log(`name: ${name}`);
					console.log(`\tcenter: ${center}`);
					console.log(`\tp_local: ${p_local}`);
					console.log(`\tClicked!`);	

					if (this.press_handlers[name]) {
						this.press_handlers[name]();
					}
				} 
			}
		});

		g.web.pointer.on_release(event => {
			if (this.release_handler) { this.release_handler(); }
		});

		this.vial_phase_shift = [Math.random(), Math.random(), Math.random()];
	}

	on_press(name, cb) { this.press_handlers[name] = cb; }

	on_release(cb) { this.release_handler = cb; }

	draw(state, dt)
	{
		if (!state) { return; }
				
		gl.clearColor(0.2, 0.0, 0.25, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		draw_fit(this.textures.background);

		if (state.customers.last().satisfied_with_potion(state.cauldron.potion)) {
			draw_fit(this.textures.spooks[state.customers.last().type].happy);
		} else {
			draw_fit(this.textures.spooks[state.customers.last().type].sad);
		}
		
		let stage_model = draw_fit(this.textures.stage);

		let potion = state.cauldron.potion;
		draw_brew(stage_model, this.textures.cauldron_mask, potion);

		draw_fit(this.textures.cauldron);
		draw_fit(parseInt(state.time_s * 10) % 2 == 0 ? this.textures.cauldron_fire2 : this.textures.cauldron_fire);

    	const W = g.web.gfx.width(), H = g.web.gfx.height();
		this.transforms['red_vial'] = draw_vial(this.textures.red_vial, stage_model, [-250 / W, 1.25], Math.cos(state.time_s + this.vial_phase_shift[0]) * 0.1);
		this.transforms['blue_vial'] = draw_vial(this.textures.blue_vial, stage_model, [250 / W, 1.25], Math.cos(state.time_s + this.vial_phase_shift[1]) * 0.1);
		this.transforms['yellow_vial'] = draw_vial(this.textures.yellow_vial, stage_model, [0 / W, 1.25], Math.cos(state.time_s + this.vial_phase_shift[2]) * 0.1);
	}
}

export { Renderer, vial_model };