'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _ini = require('ini');

var _ini2 = _interopRequireDefault(_ini);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GitConfig {
  constructor(dir) {
    this.root = dir;
    this.path = dir + '/.git/config';
  }
  async parse() {
    if (this.ini) return;
    let text = await (0, _pify2.default)(_fs2.default.readFile)(this.path, { encoding: 'utf8' });
    this.ini = _ini2.default.decode(text);
  }
  async get(path) {
    await this.parse();
    return (0, _lodash2.default)(this.ini, path);
  }
}
exports.default = GitConfig;
//# sourceMappingURL=GitConfig.js.map