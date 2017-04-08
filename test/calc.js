import * as assert    from 'assert';
import { log as _log} from 'mocha-logger';

import calc from '../src/lib/calc';

const weights = {
	b : .691,
	hb: .721,
	s : .878,
	d : 1.242,
	t : 1.569,
	h : 2.015,
};

const trout2016 = {
	ab: 549,
	s : 107,
	d : 32,
	t : 5,
	h : 29,
	b : 116,
	ib: 12,
	sf: 5,
	hb: 11,
	woba: .418
};

const trout2016Standard = {
	'AB'  : 549,
	'H'   : 173,
	'2B'  : 32,
	'3B'  : 5,
	'HR'  : 29,
	'BB'  : 116,
	'IBB' : 12,
	'SF'  : 5,
	'HBP' : 11,
	'wOBA': .418
};

describe('Calculators', () => {
	describe('#woba', () => {
		it('matches sample data from FanGraphs', done => {

			let t = trout2016;
			let raw = calc.woba(t.ab,t.s,t.d,t.t,t.h,t.b,t.ib,t.sf,t.hb,weights);

			assert.equal(t.woba.toFixed(3), raw.toFixed(3));
			done();
		});
	});
	describe('#wobaFromStats', () => {
		it('correctly splits data from H value', done => {

			let t = trout2016Standard;
			let raw = calc.wobaFromStats(t, weights);

			assert.equal(t.wOBA.toFixed(3), raw.toFixed(3));
			done();
		});
	});
	describe('#sumValues', () => {
		it('gets the sum of numeric values from array', done => {
			let sum = 44.4;
			let arr = [11.1, "11.1", 11.1000, "11.1000"];
			assert.equal(calc.sumValues(arr), sum);
			done();
		});
		it('get the sum of the values of top-level keys in an object', done => {
			let sum = 44.4;
			let obj = {
				one: 11.1,
				two: "11.1",
				three: 11.1000,
				four: "11.1000"
			};
			assert.equal(calc.sumValues(obj), sum);
			done();
		});
	});
});