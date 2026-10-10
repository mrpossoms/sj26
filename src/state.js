class Culdron
{
	constructor()
	{
		this._color = null;
		this._level = 0;

	}

	get color() { return this._color; }

	get level() { return this._level; }

	get is_overflowing() { return this.level > 1; }

	drain(dt_s)
	{
		const drain_speed = 0.1;
		this._level -= drain_speed * dt_s;		
	}

	update(dt_s)
	{
		if (this.is_overflowing) { this.drain(); }
	}

	add(color, amount)
	{
		this._level += amount;
		
		if (this._color === null)
		{
			this._color = color;
		}
		else
		{
			this._color = this._color.mix(color, amount / this._level);
		}
	}
}

class State
{
	constructor()
	{
		this.time_s = 0;
		this.culdron = new Culdron();
	}
}

export { State, Culdron };

// export State;
// export Culdron;