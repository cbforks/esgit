'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mkdir = mkdir;
exports.mkdirs = mkdirs;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function mkdir(dirpath /*: string */) {
  try {
    await (0, _pify2.default)(_fs2.default.mkdir)(dirpath);
    return;
  } catch (err) {
    // If err is null then operation succeeded!
    if (err === null) return;
    // If the directory already exists, that's OK!
    if (err.code === 'EEXIST') return;
    // If we got a "no such file or directory error" backup and try again.
    if (err.code === 'ENOENT') {
      let parent = _path2.default.posix.dirname(dirpath);
      // Check to see if we've gone too far
      if (parent === '.' || parent === '/' || parent === dirpath) throw err;
      // Infinite recursion, what could go wrong?
      await mkdir(parent);
      await mkdir(dirpath);
    }
  }
}
async function mkdirs(dirlist /*: string[] */) {
  return Promise.all(dirlist.map(mkdir));
}
//# sourceMappingURL=mkdirs.js.map