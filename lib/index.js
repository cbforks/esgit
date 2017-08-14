'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Git = undefined;
exports.default = git;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _githubUrlToObject = require('github-url-to-object');

var _githubUrlToObject2 = _interopRequireDefault(_githubUrlToObject);

var _GitConfig = require('./models/GitConfig');

var _GitConfig2 = _interopRequireDefault(_GitConfig);

var _init = require('./commands/init.js');

var _init2 = _interopRequireDefault(_init);

var _fetch = require('./commands/fetch.js');

var _fetch2 = _interopRequireDefault(_fetch);

var _checkout = require('./commands/checkout.js');

var _checkout2 = _interopRequireDefault(_checkout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We want to be able to do

// git('.').branch('master').tree.checkout()
// git('.').head('master').tree.checkout()
// git('.').tag('v1.0').tree.checkout()
// git('.').tree.addFile(filepath)
// git('.').branch('master').commit(author, etc)
// git('.').branch('master').push(upstream, upstreambranch)
// git('.').fetch(upstream, upstreambranch)
// git('.').branch('master').merge(git('.').remotes('origin/master'))
// or should it be assumed we have all remotes/heads/tags fetched and explore directly
// git('.').branch.master.merge(git('.').remotes.origin.master

// then it's hard to tell that master is a name and merge is an operation. Maybe putting names in strings is good.
// we could though, do this:
// git('.').branch('master').merge(git('.').remotes('origin').branch('master'))
// That's probably the clearest by far.

// Class is merely a fluent command/query builder
function git(dir) {
  return new Git(dir);
}

class Git {
  constructor(dir) {
    this.root = dir;
    this.operateRemote = 'origin';
  }
  githubToken(token) {
    this.operateToken = token;
    return this;
  }
  branch(name) {
    this.operateBranch = name;
  }
  remote(name) {
    this.operateRemote = name;
  }
  config() {
    return new _GitConfig2.default(this.root);
  }
  async init() {
    await (0, _init2.default)(this.root);
    return;
  }
  async fetch(url) {
    await (0, _fetch2.default)({
      dir: this.root,
      user: (0, _githubUrlToObject2.default)(url).user,
      repo: (0, _githubUrlToObject2.default)(url).repo,
      ref: (0, _githubUrlToObject2.default)(url).branch,
      remote: this.operateRemote,
      token: this.operateToken
    });
  }
  async checkout(branch) {}
  async clone(url) {
    await (0, _init2.default)(this.root);
    await (0, _fetch2.default)({
      dir: this.root,
      user: (0, _githubUrlToObject2.default)(url).user,
      repo: (0, _githubUrlToObject2.default)(url).repo,
      ref: (0, _githubUrlToObject2.default)(url).branch,
      remote: this.operateRemote,
      token: this.operateToken
    });
    await (0, _checkout2.default)({
      dir: this.root,
      ref: (0, _githubUrlToObject2.default)(url).branch,
      remote: this.operateRemote
    });
    return;
  }
}
exports.Git = Git;
//# sourceMappingURL=index.js.map