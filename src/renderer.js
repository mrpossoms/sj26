import g from 'g.js/web';
import { State } from './state.js';
import { Color } from './color.js';

const lerp = (a, b, t) => a + (b - a) * t;

const draw_textured_quad = (tex, model, uv, tint=[1,1,1,1]) => {
    g.web.assets['mesh/plane'].using_shader('sprite')
        .with_attribute({name:'a_position', buffer: 'positions', components: 3})
        .with_attribute({name:'a_tex_coord', buffer: 'texture_coords', components: 2})
        .set_uniform('u_model').mat4(model)
        .set_uniform('u_uv').vec4(uv)
        .set_uniform('u_tint').vec4(tint)
        .set_uniform('u_texture').texture(tex)
        .draw_tri_fan();	
};

const draw_region = (tex, p, s, uv, tint=[1,1,1,1]) => {
    const W = g.web.gfx.width(), H = g.web.gfx.height();
    // the plane's uvs are flipped on both axes, so flip the quad to match
    const model = [].mat_scale([-s[0] / W, -s[1] / H, 1])
                    .mat_mul([].translate([2 * p[0] / W, 2 * p[1] / H, 0]));

    draw_textured_quad(tex, model, uv, tint);

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

const draw_fit = (tex, tint) => {
	return draw_region(tex, [0, 0], [g.web.gfx.width() * (1/g.web.gfx.aspect()), g.web.gfx.height()], [0, 0, 1, 1], tint);
};

const draw_brew = (stage_model, pos, tex, potion) => {
	const mask_ratio = 226/300;
	const volume = Math.min(1, potion.volume);
	if (potion.color === null || volume <= 0) { return stage_model; }

    // the plane's uvs are flipped on both axes, so flip the quad to match
    const model = stage_model.mat_mul([].translate([pos[0], pos[1] + -2 + (1 - mask_ratio) * 2 * volume, 0]));

    const v = lerp(mask_ratio, 1, 1 - volume);
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
        	request_bubble: g.web.assets['tex/customer-request-bubble'],
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
					happy: g.web.assets['tex/customer-pumpkin-head-happy'],
					sad: g.web.assets['tex/customer-pumpkin-head']
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
        this.selected_vial = null;

        g.web.pointer.on_press(event => {
        	let p = g.web.pointer.normalized_position(event)
        	this.last_pos = p;
        	console.log(`pos: ${p}`);

			if (g.song) {
				g.song.play();			
			}

        	for (let [name, model] of Object.entries(this.transforms)) {
        		let inv_model = model.inverse();
				let p_local = [[p[0], p[1], 0, 1]].mat_mul(inv_model)[0];
				let clicked = p_local[0] >= -1 && p_local[0] <= 1 && p_local[1] >= -1 && p_local[1] <= 1;

				if (clicked)
				{
					this.selected_vial = name;
					console.log(`name: ${name}`);
					console.log(`\tp_local: ${p_local}`);
					console.log(`\tClicked!`);	

					if (this.press_handlers[name]) {
						this.press_handlers[name]();
					}
				} 
			}

			if (p[1] < -0.5 && this.press_handlers['brew']) {
				this.press_handlers['brew']();
			}
		});

		g.web.pointer.on_release(event => {
			if (this.release_handler) { this.release_handler(); }
			this.selected_vial = null;
		});

		this.vial_phase_shift = {
			"yellow_vial": Math.random(), 
			"red_vial": Math.random(),
			"blue_vial": Math.random()
		};
	}

	on_press(name, cb) 
	{ 
		this.press_handlers[name] = cb; 
	}

	on_release(cb) { this.release_handler = cb; }

	draw_customer(state)
	{
		const customer = state.customers.last();

		if (!customer) { return; }

		let tex = this.textures.spooks[customer.type].sad;
		let pos = [customer.easer.value * 500, 0];
		if (customer.satisfied_with_potion(state.cauldron.potion)) {
			tex = this.textures.spooks[customer.type].happy;
			pos = [customer.easer.value * 500 + Math.cos(state.time_s * 2) * 10, Math.sin(state.time_s * 20) * 4];
		}

		draw_region(tex, pos, [g.web.gfx.width() * (1/g.web.gfx.aspect()), g.web.gfx.height()], [0, 0, 1, 1]);

		let tint = [1,0,0,1]

		if (customer.easer.is_done) {
			if (customer.potion.min.color === null || customer.potion.max.color === null) {
				let rgb = (new Color((state.time_s * 360) % 359, 1, 1)).RGB;
				tint = [rgb[0], rgb[1], rgb[2], 1];
			} else {
				let rgb = customer.potion.target.color.RGB;
				tint = [rgb[0], rgb[1], rgb[2], 1];
			}

			draw_fit(this.textures.request_bubble, tint);
		}
	}

	draw_cauldron(state, stage_model)
	{
	    const W = g.web.gfx.width(), H = g.web.gfx.height();
		let potion = state.cauldron.potion;
		let model = stage_model;

		let p = [0, 0];

		if (potion.volume > 0) {
			p = [20*(Math.random()-0.5)/W,10*(Math.random()-0.5)/H];
		}

	    // the plane's uvs are flipped on both axes, so flip the quad to match
	    const s = [g.web.gfx.width() * (1/g.web.gfx.aspect()), g.web.gfx.height()];
	    const fit_model = [].mat_scale([-s[0] / W, -s[1] / H, 1])
	                        .mat_mul([].translate([p[0], p[1], 0]));

		draw_brew(model, p, this.textures.cauldron_mask, potion);
		// draw_fit(this.textures.cauldron);
		// draw_region(this.textures.cauldron, [0, 0], [g.web.gfx.width() * (1/g.web.gfx.aspect()), g.web.gfx.height()], [0, 0, 1, 1]);
		draw_textured_quad(this.textures.cauldron, fit_model, [0, 0, 1, 1]);
		draw_textured_quad(parseInt(state.time_s * 10) % 2 == 0 ? this.textures.cauldron_fire2 : this.textures.cauldron_fire, [].mat_scale([-s[0] / W, -s[1] / H, 1]), [0, 0, 1, 1]);
	}

	draw(state, dt)
	{
		if (!state) { return; }
				
		gl.clearColor(0.2, 0.0, 0.25, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		draw_fit(this.textures.background);
		this.draw_customer(state)
		
		let stage_model = draw_fit(this.textures.stage);

		this.draw_cauldron(state, stage_model);

    	const W = g.web.gfx.width(), H = g.web.gfx.height();

    	const sway_speeds = [
    		this.selected_vial === 'red_vial' ? 0 : 0.1,
    		this.selected_vial === 'blue_vial' ? 0 : 0.1,
    		this.selected_vial === 'yellow_vial' ? 0 : 0.1
    	];

    	if (this.selected_vial) {
    		this.vial_phase_shift[this.selected_vial] = -state.time_s;
    	}

		this.transforms['red_vial'] = draw_vial(this.textures.red_vial, stage_model, [-250 / W, 1.25], Math.sin(state.time_s + this.vial_phase_shift['red_vial']) * 0.1);
		this.transforms['blue_vial'] = draw_vial(this.textures.blue_vial, stage_model, [250 / W, 1.25], Math.sin(state.time_s + this.vial_phase_shift['blue_vial']) * 0.1);
		this.transforms['yellow_vial'] = draw_vial(this.textures.yellow_vial, stage_model, [0 / W, 1.25], Math.sin(state.time_s + this.vial_phase_shift['yellow_vial']) * 0.1);
	}
}

export { Renderer, vial_model };