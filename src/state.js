
class Player
{
	constructor()
	{
		this.correct = 0;
		this.incorrect = 0;
	}

	get skill()
	{
		if (this.correct + this.incorrect === 0) { return 0; }
		return this.correct / (this.correct + this.incorrect);
	}
}

class Potion
{
	constructor(color, volume)
	{
		this.color = color;
		this.volume = volume;
	}
}

class Cauldron
{
	constructor()
	{
		this._color = null;
		this._volume = 0;
	}

	get color() { return this._color; }

	get volume() { return this._volume; }

	get potion() { return new Potion(this._color, this._volume); }

	get is_overflowing() { return this.volume > 1; }

	drain(dt_s)
	{
		const drain_speed = 0.1;
		this._volume -= drain_speed * dt_s;		
	}

	update(dt_s)
	{
		if (this.is_overflowing) { this.drain(); }
	}

	add(color, amount)
	{
		this._volume += amount;
		
		if (this._color === null)
		{
			this._color = color;
		}
		else
		{
			this._color = this._color.mix(color, amount / this._volume);
		}
	}
}

class Easer
{
	constructor(value, rate, transfer_func=null)
	{
		this._current = value;
		this._target = 0;
		this._rate = rate;
		this._transfer_func = transfer_func
		this._finish_cb = null;
	}

	get is_done() { return this._current === this._target; }

	get value() {
		if (this._transfer_func) {
			return this._transfer_func(this._current);
		}
		return this._current;
	}

	target(value) { this._target = value; return this; }

	on_finish(cb) { this._finish_cb = cb; return this; }

	update(dt_s)
	{
		const delta = this._target - this._current;
		const step = this._rate * dt_s;
		if (Math.abs(delta) <= step)
		{
			this._current = this._target;
			if (this._finish_cb) {
				this._finish_cb(); 
				this._finish_cb = null; 
			}
		}
		else
		{
			this._current += Math.sign(delta) * step;
		}
	}
}

class Customer
{
	constructor(type, min_potion, max_potion)
	{
		this.type = type
		this.potion = {
			min: min_potion,
			max: max_potion
		};
		this.easer = new Easer(-1, 0.5);
	}

	static get types()
	{
		return ["dracula", "ghost", "mummy", "pumpkin"];
	}

	satisfied_with_potion(p)
	{
		if (p.color === null) { return false; }
		if (this.potion.min.color === null || this.potion.max.color === null) { return true; }

		return this.potion.min.volume <= p.volume && p.volume <= this.potion.max.volume &&
		       this.potion.min.color.h <= p.color.h && p.color.h <= this.potion.max.color.h;
	}

	update(dt)
	{
		this.easer.update(dt);
	}
}

class State
{
	constructor()
	{
		this.time_s = 0;
		this.cauldron = new Cauldron();
		this.customers = [];
		this.pouring_color = null;
		this.player = new Player();
	}
}

export { State, Cauldron, Customer, Potion, Player };