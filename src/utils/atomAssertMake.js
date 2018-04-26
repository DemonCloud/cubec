import struct from 'ax-struct-js';

const _cool = struct.cool();
const _isString = struct.type("string");
const _isArray = struct.type("array");
const _each = struct.each("array");
const _identify = struct.broken;

function atomAssertMake(list, callback){
	let LIST = this._assert(_cool, _identify);
	let target = _isString(list) ? [list] : (_isArray(list) ? list : []);

	_each(target, (name)=>callback.call(this,LIST,name));

	return this;
}

export default atomAssertMake;
