'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _mkdirs = require('./mkdirs');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// An async writeFile variant that automatically creates missing directories,
// and returns null instead of throwing errors.
exports.default = async function write(filepath /*: string */, contents /*: string|Buffer */) {
  try {
    await (0, _pify2.default)(_fs2.default.writeFile)(filepath, contents);
    return;
  } catch (err) {
    // Hmm. Let's try mkdirp and try again.
    await (0, _mkdirs.mkdir)(_path2.default.dirname(filepath));
    await (0, _pify2.default)(_fs2.default.writeFile)(filepath, contents);
    return;
  }
};
//# sourceMappingURL=write.js.map