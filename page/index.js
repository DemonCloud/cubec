import c from '../src/c';

window.c = c;

let modal = c.model({
	name: "modal",
	verify: {
		"a": c.verify.isObject,
		"a.b": c.verify.isNumber
	}
});

window.modal = modal;

