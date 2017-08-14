'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pako = require('pako');

var _pako2 = _interopRequireDefault(_pako);

var _GitObject = require('../models/GitObject');

var _GitObject2 = _interopRequireDefault(_GitObject);

var _GitCommit = require('../models/GitCommit');

var _GitCommit2 = _interopRequireDefault(_GitCommit);

var _GitBlob = require('../models/GitBlob');

var _GitBlob2 = _interopRequireDefault(_GitBlob);

var _GitTree = require('../models/GitTree');

var _GitTree2 = _interopRequireDefault(_GitTree);

var _write = require('../utils/write');

var _write2 = _interopRequireDefault(_write);

var _read = require('../utils/read');

var _read2 = _interopRequireDefault(_read);

var _resolveRef = require('../utils/resolveRef');

var _resolveRef2 = _interopRequireDefault(_resolveRef);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _buffer = require('buffer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function writeTreeToDisk({ dir, dirpath, tree }) {
  for (let entry of tree) {
    let { type, object } = await _GitObject2.default.read({ dir, oid: entry.oid });
    let entrypath = `${dirpath}/${entry.path}`;
    console.log(`I'm writing out ${entrypath}`);
    switch (type) {
      case 'blob':
        await (0, _write2.default)(entrypath, object);
        break;
      case 'tree':
        let tree = _GitTree2.default.from(object);
        await writeTreeToDisk({ dir, dirpath: entrypath, tree });
        break;
      default:
        throw new Error(`Unexpected object type ${type} found in tree for '${dirpath}'`);
    }
  }
}

exports.default = async function checkout({ dir, remote, ref }) {
  // Get tree oid
  let oid;
  try {
    oid = await (0, _resolveRef2.default)({ dir, ref });
  } catch (e) {
    oid = await (0, _resolveRef2.default)({ dir, ref: `${remote}/${ref}` });
    await (0, _write2.default)(`${dir}/.git/refs/heads/${ref}`, oid + '\n');
  }
  var { type, object } = await _GitObject2.default.read({ dir, oid });
  let comm = _GitCommit2.default.from(object.toString('utf8'));
  let sha = comm.headers().tree;
  console.log('tree: ', sha);
  // Get top-level tree
  var { type, object } = await _GitObject2.default.read({ dir, oid: sha });
  console.log(type, object.toString('utf8'));
  let tree = _GitTree2.default.from(object);
  // Write files. TODO: Write them atomically
  await writeTreeToDisk({ dir, dirpath: dir, tree });
  // Update HEAD TODO: Handle non-branch cases
  (0, _write2.default)(`${dir}/.git/HEAD`, `ref: refs/heads/${ref}`);
};
//# sourceMappingURL=checkout.js.map