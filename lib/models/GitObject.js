'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _buffer = require('buffer');

var _pako = require('pako');

var _pako2 = _interopRequireDefault(_pako);

var _shasum = require('shasum');

var _shasum2 = _interopRequireDefault(_shasum);

var _read = require('../utils/read');

var _read2 = _interopRequireDefault(_read);

var _write = require('../utils/write');

var _write2 = _interopRequireDefault(_write);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wrapObject({ type, object /*: {type: string, object: Buffer}*/ }) {
  let buffer = _buffer.Buffer.concat([_buffer.Buffer.from(type + ' '), _buffer.Buffer.from(object.length.toString()), _buffer.Buffer.from([0]), object]);
  let oid = (0, _shasum2.default)(buffer);
  return {
    oid,
    file: _pako2.default.deflate(buffer)
  };
}


function unwrapObject({ oid, file /*: {oid: string, file: Buffer}*/ }) {
  let inflated = _buffer.Buffer.from(_pako2.default.inflate(file));
  if (oid) {
    let sha = (0, _shasum2.default)(inflated);
    if (sha !== oid) throw new Error(`SHA check failed! Expected ${oid}, computed ${sha}`);
  }
  let s = inflated.indexOf(32); // first space
  let i = inflated.indexOf(0); // first null value
  let type = inflated.slice(0, s).toString('utf8'); // get type of object
  console.log(`type = '${type}' ${type.length}`);
  let length = inflated.slice(s + 1, i).toString('utf8'); // get type of object
  console.log(`length = '${length}' ${length.length}`);
  let actualLength = inflated.length - (i + 1);
  // verify length
  if (parseInt(length) !== actualLength) throw new Error(`Length mismatch: expected ${length} bytes but got ${actualLength} instead.`);
  return {
    type,
    object: _buffer.Buffer.from(inflated.slice(i + 1))
  };
}

class GitObject {

  static async read({ dir, oid /*: {dir: string, oid: string}*/ }) {
    let file = await (0, _read2.default)(`${dir}/.git/objects/${oid.slice(0, 2)}/${oid.slice(2)}`);
    if (!file) throw new Error(`Git object with oid ${oid} not found`);
    let { type, object } = unwrapObject({ oid, file });
    return { type, object };
  }

  static async write({ dir, type, object /*: {dir: string, type: string, object: Buffer}*/ }) {
    let { file, oid } = wrapObject({ type, object });
    await (0, _write2.default)(`${dir}/.git/objects/${oid.slice(0, 2)}/${oid.slice(2)}`, file);
    return oid;
  }

}
exports.default = GitObject;
//# sourceMappingURL=GitObject.js.map