function wrap(h)
{
	while(h < 0) h += 360;
	while(h >= 360) h -= 360;
	return h
}

class Color
{
	constructor(h, s, v)
	{
		this.h = wrap(h);
		this.s = s;
		this.v = v;
	}

	mix(other, t)
	{
		var h_o = [
			other.h,
			other.h - 360,
			other.h + 360,
		];

		var distances = h_o.map(h => Math.abs(h - this.h));
		var minIndex = distances.indexOf(Math.min(...distances));
		h_o = h_o[minIndex];

		var h = this.h * (1 - t) + h_o * t;

		h = wrap(h);

		const s = this.s * (1 - t) + other.s * t;
		const v = this.v * (1 - t) + other.v * t;
		return new Color(h, s, v);
	}

	distance_to(other)
	{
		var h_o = [
			other.h - 360,
			other.h,
			other.h + 360,
		];

		var distances = h_o.map(h => Math.abs(h - this.h));
		var minIndex = distances.indexOf(Math.min(...distances));
		h_o = h_o[minIndex];

		const dh = h_o - this.h;
		const ds = other.s - this.s;
		const dv = other.v - this.v;

		return { dh: dh, ds: ds, dv: dv };
	}

	get RGB()
	{
		let c = this.v * this.s;
		let h_prime = parseInt(this.h / 60);

		let x = c * (1 - Math.abs((this.h / 60) % 2 - 1));
		let m = this.v - c;

		// const h_prime_in_range = h_prime >= 0 && h_prime <= 5;
		// if (!h_prime_in_range) {
		// 	debugger;
		// }
		// console.assert(h_prime_in_range, `h_prime is out of range: ${h_prime}`);

		return [
			[c, x, 0],
			[x, c, 0],
			[0, c, x],
			[0, x, c],
			[x, 0, c],
			[c, 0, x]
		][h_prime];
	}
}

export { Color };