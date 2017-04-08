


export const defaultWeights = {
	b : .681,
	hb: .713,
	s : .882,
	d : 1.272,
	t : 1.623,
	h : 2.127,
};

/**
 * calculates woba from stats object
 * @param {Object} stats  - contains key-valu pairs in uppercase standard MLB format
 * @param {Object} custom - custom weights to use
 */
export const wobaFromStats = (stats, custom) => {
	let i = parseInt;
	let d = i(stats['2B'])||0;
	let t = i(stats['3B'])||0
	let h = i(stats['HR'])||0
	stats['1B'] = stats['1B'] || (i(stats['H']) - d - t - h);
	return woba(
		i(stats['AB'])||0,
		i(stats['1B'])||0,
		d,
		t,
		h,
		i(stats['BB']) ||0,
		i(stats['IBB'])||0,
		i(stats['SF']) ||0,
		i(stats['HBP'])||0,
		custom
	);
};

/** function woba()
 * calculate woba from passed values
 * @param {Number} abs - number of at-bats
 * @param {Number} singles   - singles
 * @param {Number} doubles   - doubles
 * @param {Number} triples   - triples
 * @param {Number} homers    - home runes
 * @param {Number} walks     - walks
 * @param {Number} int_walks - intentional walks
 * @param {Number} sac_flys  - sacrifice flys
 * @param {Number} hbps      - hit by pitch
 * @param {Object} custom    - custom weights to use 
 */

export const woba = (abs, singles, doubles, triples, homers, walks, int_walks, sac_flys, hbps, custom) => {
	let ab = abs       || 0;
	let s  = singles   || 0;
	let d  = doubles   || 0;
	let t  = triples   || 0;
	let h  = homers    || 0;
	let b  = walks     || 0;
	let ib = int_walks || 0;
	let sf = sac_flys  || 0;
	let hb = hbps      || 0;

	let ubb = b-ib;

	let w = custom || defaultWeights;

	let wobaRaw = (w.b*ubb + w.hb*hb + w.s*s + w.d*d + w.t*t + w.h*h)/(ab + b - ib + sf + hb);
	return wobaRaw;
};

export const numericOrZero = thing => {
	let val = thing;
	let float = parseFloat(val);
	if (float.toString() == thing || float == thing) {
		return Number(thing);
	} else {
		return 0;
	}
};

/**
 * returns the sum of top-level numeric values in an object, or numeric values in an array
 * @param {any} collection - either an array or an object
 */
export const sumValues = collection => {
	let toReduce = collection;
	if ( !(collection instanceof Array) ) {
		toReduce = Object.keys(collection).map( k => { return collection[k] } );
	}
	return toReduce.reduce((a,b) => {
		return numericOrZero(a) + numericOrZero(b);
	}, 0);
};

export const isNumeric = n => { return !isNaN(parseFloat(n)) && isFinite(n) };

export const sortArrayByKey = (array, key, reverse) => {
	reverse = reverse || false;
	let l = reverse ? -1 :  1;
	let g = reverse ?  1 : -1;
	return array.sort((a,b) => {
		let x_orig = a[key], y_orig = b[key];
		let x = x_orig, y = y_orig;
		if(!isNumeric(x_orig) || !isNumeric(y_orig)){
			x = y_orig.toString().toLowerCase();
			y = x_orig.toString().toLowerCase();
		}
		return x < y ? l : ( x > y ? g : 0);
	});
};

export const ipToInt = ip => {
	let [innings, partial] = ip.toString().split('.');
	return parseInt(innings) + parseInt(partial)*.33333333333;
};

export default {
	woba,
	defaultWeights,
	wobaFromStats,
	sumValues,
	sortArrayByKey,
	ipToInt
};
