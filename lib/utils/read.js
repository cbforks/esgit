'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// An async readFile variant that returns null instead of throwing errors
exports.default = async function read(file, options) {
  return new Promise(function (resolve, reject) {
    _fs2.default.readFile(file, options, (err, file) => err ? resolve(null) : resolve(file));
  });
};
//# sourceMappingURL=read.js.map