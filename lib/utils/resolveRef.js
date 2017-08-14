'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _exists = require('./exists');

var _exists2 = _interopRequireDefault(_exists);

var _read = require('./read');

var _read2 = _interopRequireDefault(_read);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function resolveRef({ dir, ref }) {
  let sha;
  // Is it a SHA?
  if (/^[0-9a-fA-F]+$/.test(ref)) {
    // Is it a complete SHA (already dereferenced)?
    if (ref.length === 40) {
      if (await (0, _exists2.default)(`${dir}/.git/objects/${ref.slice(0, 2)}/${ref.slice(2)}`)) {
        return ref.trim();
      }
      // Is it a partial SHA?
    } else if (ref.length === 7) {
      // TODO: use file globbing to match partial SHAs
    }
  }
  // Is it a (local) branch?
  sha = await (0, _read2.default)(`${dir}/.git/refs/heads/${ref}`, { encoding: 'utf8' });
  if (sha) return sha.trim();
  // Is it a tag?
  sha = await (0, _read2.default)(`${dir}/.git/refs/tags/${ref}`, { encoding: 'utf8' });
  if (sha) return sha.trim();
  // Is it remote branch?
  sha = await (0, _read2.default)(`${dir}/.git/refs/remotes/${ref}`, { encoding: 'utf8' });
  if (sha) return sha.trim();
  // Do we give up?
  throw new Error(`Could not resolve reference ${ref}`);
};
//# sourceMappingURL=resolveRef.js.map