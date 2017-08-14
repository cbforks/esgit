'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// An async exists variant
exports.default = async function exists(file, options) {
  return new Promise(function (resolve, reject) {
    _fs2.default.exists(file, resolve);
  });
};
//# sourceMappingURL=exists.js.map