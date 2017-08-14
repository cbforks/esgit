'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _write = require('../utils/write');

var _write2 = _interopRequireDefault(_write);

var _mkdirs = require('../utils/mkdirs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function init(dirpath /*: string */) {
  let folders = ['.git/hooks', '.git/info', '.git/objects/info', '.git/objects/pack', '.git/refs/heads', '.git/refs/tags'];
  folders = folders.map(dir => dirpath + '/' + dir);
  await (0, _mkdirs.mkdirs)(folders);
  await (0, _write2.default)(dirpath + '/.git/config', `[core]
  	repositoryformatversion = 0
  	filemode = false
  	bare = false
  	logallrefupdates = true
  	symlinks = false
  	ignorecase = true
`);
  await (0, _write2.default)(dirpath + '/.git/HEAD', `ref: refs/heads/master
`);
};
//# sourceMappingURL=init.js.map