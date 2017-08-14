'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // We're implementing a non-standard clone based on the Github API first, because of CORS.
// And because we already have the code.


var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _parseLinkHeader = require('parse-link-header');

var _parseLinkHeader2 = _interopRequireDefault(_parseLinkHeader);

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

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _buffer = require('buffer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function request({ url, token, headers }) {
  let res = await _axios2.default.get(url, {
    headers: _extends({
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'token ' + token
    }, headers)
  });
  return res.data;
}

async function fetchRemoteBranches({ dir, remote, user, repo, token }) {
  return request({ token, url: `https://api.github.com/repos/${user}/${repo}/branches` }).then(json => Promise.all(json.map(branch => (0, _write2.default)(`${dir}/.git/refs/remotes/${remote}/${branch.name}`, branch.commit.sha + '\n', { encoding: 'utf8' }))));
}

async function fetchTags({ dir, user, repo, token }) {
  return request({ token, url: `https://api.github.com/repos/${user}/${repo}/tags` }).then(json => Promise.all(json.map(tag =>
  // Curiously, tags are not separated between remotes like branches
  (0, _write2.default)(`${dir}/.git/refs/tags/${tag.name}`, tag.commit.sha + '\n', { encoding: 'utf8' }))));
}

async function fetchCommits({ dir, url, user, repo, ref, since, token }) {
  if (!url) {
    url = `https://api.github.com/repos/${user}/${repo}/commits?`;
    if (ref) url += `&sha=${ref}`;
    if (since) {
      let date = new Date(since * 1000).toISOString();
      url += `&since=${date}`;
    }
  }
  let res = await _axios2.default.get(url, {
    headers: {
      'Accept': 'application/vnd.github.cryptographer-preview',
      'Authorization': 'token ' + token
    }
  });
  let json = res.data;
  let link = (0, _parseLinkHeader2.default)(res.headers['link']);

  for (let commit of json) {
    if (!commit.commit.verification.payload) {
      console.log(`Commit ${commit.sha} skipped. Due to a technical limitations and my laziness, only signed commits can be cloned from Github over the API`);
      continue;
    }
    try {
      let comm = _GitCommit2.default.fromPayloadSignature({
        payload: commit.commit.verification.payload,
        signature: commit.commit.verification.signature
      });
      let oid = await _GitObject2.default.write({ dir, type: 'commit', object: comm.toObject() });
      if (commit.sha !== oid) {
        console.log('AHOY! MATEY! THAR BE TROUBLE WITH \'EM HASHES!');
      }
      console.log(`Added commit ${commit.sha}`);
    } catch (e) {
      console.log(e.message, commit.sha);
    }
  }

  if (link && link.next) {
    return fetchCommits({ dir, user, repo, ref, since, token, url: link.next.url });
  }
}

async function fetchTree({ dir, url, user, repo, sha, since, token }) {
  let json = await request({ token, url: `https://api.github.com/repos/${user}/${repo}/git/trees/${sha}` });
  let tree = new _GitTree2.default(json.tree);
  let oid = await _GitObject2.default.write({ dir, type: 'tree', object: tree.toObject() });
  if (sha !== oid) {
    console.log('AHOY! MATEY! THAR BE TROUBLE WITH \'EM HASHES!');
  }
  console.log(tree.render());
  return Promise.all(json.tree.map(async entry => {
    if (entry.type === 'blob') {
      await fetchBlob({ dir, url, user, repo, sha: entry.sha, since, token });
    } else if (entry.type === 'tree') {
      await fetchTree({ dir, url, user, repo, sha: entry.sha, since, token });
    }
  }));
}

async function fetchBlob({ dir, url, user, repo, sha, since, token }) {
  let res = await _axios2.default.get(`https://api.github.com/repos/${user}/${repo}/git/blobs/${sha}`, {
    headers: {
      'Accept': 'application/vnd.github.raw',
      'Authorization': 'token ' + token
    },
    responseType: 'arraybuffer'
  });
  let oid = await _GitObject2.default.write({ dir, type: 'blob', object: res.data });
  if (sha !== oid) {
    console.log('AHOY! MATEY! THAR BE TROUBLE WITH \'EM HASHES!');
  }
}

exports.default = async function fetch({ dir, token, user, repo, ref, remote, since }) {
  let json;

  if (!ref) {
    console.log('Determining the default branch');
    json = await request({ token, url: `https://api.github.com/repos/${user}/${repo}` });
    ref = json.default_branch;
  }

  console.log('Receiving branches list');
  let getBranches = fetchRemoteBranches({ dir, remote, user, repo, token });

  console.log('Receiving tags list');
  let getTags = fetchTags({ dir, user, repo, token });

  console.log('Receiving commits');
  let getCommits = fetchCommits({ dir, user, repo, token, ref });

  await Promise.all([getBranches, getTags, getCommits]);

  // This is all crap to get a tree SHA from a commit SHA. Seriously.
  let oid = await (0, _resolveRef2.default)({ dir, ref: `${remote}/${ref}` });
  let { type, object } = await _GitObject2.default.read({ dir, oid });
  let comm = _GitCommit2.default.from(object.toString('utf8'));
  let sha = comm.headers().tree;
  console.log('tree: ', sha);

  await fetchTree({ dir, user, repo, token, sha });
};
//# sourceMappingURL=fetch.js.map