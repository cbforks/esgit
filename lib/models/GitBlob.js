'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _buffer = require('buffer');

var _shasum = require('shasum');

var _shasum2 = _interopRequireDefault(_shasum);

var _pako = require('pako');

var _pako2 = _interopRequireDefault(_pako);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GitBlob {
  /*::
  _buffer : Buffer
  _oid : string
  */
  constructor(raw /*: string|Buffer*/) {
    this._buffer = _buffer.Buffer.from(raw);
  }
  static from(raw /*: string|Buffer*/) {
    return new GitBlob(raw);
  }
  wrapped() {
    return _buffer.Buffer.concat([_buffer.Buffer.from(`blob ${this._buffer.length}\0`), this._buffer]);
  }
  oid() {
    this._oid = this._oid || (0, _shasum2.default)(this.wrapped()); // memoize
    return this._oid;
  }
  zipped() {
    return _pako2.default.deflate(this.wrapped());
  }
}
exports.default = GitBlob;
//# sourceMappingURL=GitBlob.js.map