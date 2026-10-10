
class Player
{
	constructor()
	{
		this.skill = 0;
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

class Culdron
{
	constructor()
	{
		this._color = null;
		this._volume = 0;
	}

	get color() { return this._color; }

	get volume() { return this._volume; }

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

class Customer
{
	constructor(type, min_potion, max_potion)
	{
		this.type = type
		this.potion = {
			min: min_potion,
			max: max_potion
		};
	}

	satisfied_with_potion(p)
	{
		return min_potion.volume <= p.volume && p.volume <= max_potion.volume &&
		       min_potion.color.h <= p.color.h && p.color.h <= max_potion.color.h;
	}
}

class State
{
	constructor()
	{
		this.time_s = 0;
		this.culdron = new Culdron();
		this.customers = [];
		this.player = new Player();
	}
}

export { State, Culdron, Customer, Potion, Player };