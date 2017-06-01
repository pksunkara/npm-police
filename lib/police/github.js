/*
 * github.js: Handles github requests
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var github = module.exports;

/*
 * Requiring modules
 */
var moment = require('moment')
  , police = require('../police');

/*
 * Default configuration
 */
github.options = {
  "protocol": "https",
  "host": "api.github.com",
  "url": "https://api.github.com",
  "v2": {
    "url": "http://github.com/api/v2/json"
  }
}

/*
 * Calculate for a single user
 */
github.singleUser = function (name, other) {
  if (other) {
    var useruri = '';
    police.winston.info('Getting user data for ' + name.cyan);
    github.get('/users/' + name, function (user) {
      if (user.type=='User') {
        useruri = '/users/';
      } else {
        useruri = '/orgs/';
      }
      police.winston.info('Getting repositories for ' + name.cyan);
      github.get(useruri + name + '/repos', function (repos) {
        github.multipleModule(repos.filter(function (e, i, a) {
          return e.language=='JavaScript' || e.language=='CoffeeScript';
        }));
      })
    });
  } else {
    if (name) police.winston.info('Getting repositories for ' + name.cyan);
    github.get('/user/repos', function (repos) {
      github.multipleModule(repos.filter(function (e, i, a) {
        return e.language=='JavaScript' || e.language=='CoffeeScript';
      }));
    });
  }
}

/*
 * Calculate iterating over array of repos
 */
github.multipleModule = function (repos) {
  police.async.forEachSeries(repos, function (repo, callback) {
    github.singleModule(repo.owner.login + '/' + repo.name, callback);
  }, function (err) {
    police.exit(err);
  });
}

/*
 * Calculate for a single module
 */
github.singleModule = function (name, callback) {
  police.winston.info('Policing ' + name.cyan);
  github.refs(name, function (ref) {

    if (ref.object) {
      police.winston.info('  Getting commit ' + ref.object.sha.substr(0,10).magenta);
      github.commit(name, ref, function (commit) {

        police.winston.info('  Getting tree ' + commit.tree.sha.substr(0,10).magenta);
        github.tree(name, commit, function (tree) {
          var blob = tree.tree.filter(function (e, i, a) {
            return e.path=='package.json' && e.type=='blob';
          });

          if (blob.length==1) {
            police.winston.info('  Getting blob ' + blob[0].sha.substr(0,10).magenta);
            github.blob(name, blob[0].sha, function (body) {
              var content = new Buffer(body.content, 'base64').toString('utf8');
              var pkg = JSON.parse(content);
              if (police.add || police.edit || police.update) {
                var sname = name.split('/');
                police.ask.properties(pkg, {name: name, user: sname[0], tree: tree.sha, mode: blob[0].mode, commit: commit.sha, content: content});
              }
              github.get('/repos/' + name, function (repo) {
                police.check.pkg(pkg, false, repo, callback);
              });
            });
          } else {
            police.winston.warn('package.json not found on master'.red.bold);
            if (callback===police.exit) {
              callback(1);
            } else {
              callback();
            }
          }
        });
      });
    } else {
      police.winston.warn('Repository is MIA (missing in action)'.red.bold);
      police.winston.warn(res.request.uri.href.red);
      police.winston.warn('Please authenticate'.red.bold);
      if (callback===police.exit) {
        callback(1);
      } else {
        callback();
      }
    }
  });
}

/*
 * Commit with updated package.json
 */
github.write = function (data, callback) {

  if (data != police.ask.gh.content) {
    github.get('/user', function (body) {
      police.ask.gh.puser = body;

      police.winston.info('  Updating ' + 'blob'.magenta);
      github.post('/repos/' + police.ask.gh.name + '/git/blobs', {content: data, encoding: 'utf-8'}, function (body) {

        police.winston.info('  Updating ' + 'tree'.magenta);
        github.post('/repos/' + police.ask.gh.name + '/git/trees', {
          base_tree: police.ask.gh.tree,
          tree: [
            {
              path: 'package.json',
              mode: police.ask.gh.mode,
              type: 'blob',
              sha: body.sha
            }
          ]
        }, function (body) {

          police.winston.info('  Updating ' + 'commit'.magenta);
          github.post('/repos/' + police.ask.gh.name + '/git/commits', {
            message: 'Updated `package.json` using `police`',
            author: {
              name: 'Pavan Kumar Sunkara',
              email: 'pavan.sss1991@gmail.com',
              date: moment(new Date()).format('YYYY-MM-DDTHH:mm:ssZ')
            },
            committer: {
              name: police.ask.gh.puser.name,
              email: police.ask.gh.puser.email,
              date: moment(new Date()).format('YYYY-MM-DDTHH:mm:ssZ')
            },
            parents: [ police.ask.gh.commit ],
            tree: body.sha
          }, function (body) {

            police.winston.info('  Updating ' + 'master'.magenta);
            github.put('/repos/' + police.ask.gh.name + '/git/refs/heads/master', {sha: body.sha}, function (body) {
              callback();
            });
          });
        });
      });
    });
  } else {
    callback();
  }
}

/*
 * Get github ref/heads/master
 */
github.refs = function (name, cb) {
  github.get('/repos/' + name + '/git/refs/heads/master', cb);
}

/*
 * Get a github commit
 */
github.commit = function (name, ref, cb) {
  github.get('/repos/' + name + '/git/commits/' + ref.object.sha, cb);
}

/*
 * Get a github tree
 */
github.tree = function (name, commit, cb) {
  github.get('/repos/' + name + '/git/trees/' + commit.tree.sha, cb);
}

/*
 * Get a github blob
 */
github.blob = function (name, sha, cb) {
  github.get('/repos/' + name + '/git/blobs/' + sha, cb);
}

/*
 * Get github token
 */
github.token = function (auth) {
  police.request({
    url: github.tokenHost(auth) + '/authorizations',
    method: 'POST',
    body: JSON.stringify({
      "scopes": ["repo"],
      "note": "npm-police from terminal"
    }),
    headers: {
      "User-Agent": "npm-police/0.4 terminal/0.0",
      "Content-type": "application/json"
    },
    proxy: process.env.https_proxy
  }, function (err, res, body) {
    if (err) police.exit(err);
    console.log(res);
    if (res.statusCode==201) {
      police.winston.info('Authenticated to github as ' + auth.username.cyan);
      body = JSON.parse(body);

      police.config.set('name', auth.username);
      police.config.set('token', body.token);
      police.config.set('id', body.id);
      police.config.save(police);
    } else {
      police.winston.warn("Bad credentials, Unable to login".red.bold);
      police.exit(1);
    }
  });
}

/*
 * Build github token host
 */
github.tokenHost = function (auth) {
  return github.options.protocol + '://' + auth.username + ':' + encodeURIComponent(auth.password) + '@' + github.options.host;
}

/*
 * Github v2 api
 */
github.v2 = function (uri, callback) {
  police.request({
    url: github.options.v2.url + uri,
    headers: {
      "Authorization": "token " + police.config.token(police)
    },
    proxy: process.env.http_proxy
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action) but continuing'.red.bold);
      police.winston.warn(res.request.uri.href.red);
      callback({});
    } else {
      callback(JSON.parse(body));
    }
  });
}

/*
 * Github api GET request
 */
github.get = function (uri, callback) {
  police.request({
    url: github.options.url + uri,
    headers: {
      "User-Agent": "npm-police/0.4 terminal/0.0",
      "Authorization": "token " + police.config.token(police)
    },
    proxy: process.env.https_proxy
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action)'.red.bold);
      police.winston.warn(res.request.uri.href.red);
      police.exit(1);
    } else {
      callback(JSON.parse(body));
    }
  });
}

/*
 * Github api POST request
 */
github.post = function (uri, content, callback) {
  police.request({
    url: github.options.url + uri,
    method: 'POST',
    body: JSON.stringify(content),
    headers: {
      "Content-type": "application/json",
      "Authorization": "token " + police.config.token(police)
    },
    proxy: process.env.https_proxy
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action)'.red.bold);
      police.winston.warn(res.request.uri.href.red);
      police.exit(1);
    } else {
      callback(JSON.parse(body));
    }
  });
}

/*
 * Github api PUT request
 */
github.put = function (uri, content, callback) {
  police.request({
    url: github.options.url + uri,
    method: 'PUT',
    body: JSON.stringify(content),
    headers: {
      "Content-type": "application/json",
      "Authorization": "token " + police.config.token(police)
    },
    proxy: process.env.https_proxy
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action)'.red.bold);
      police.winston.warn(res.request.uri.href.red);
      police.exit(1);
    } else {
      callback(JSON.parse(body));
    }
  });
}

/*
 * Github api DELETE request
 */
github.del = function (uri, content, callback) {
  police.request({
    url: github.options.url + uri,
    method: 'DELETE',
    body: JSON.stringify(content),
    headers: {
      "Content-type": "application/json",
      "Authorization": "token " + police.config.token(police)
    },
    proxy: process.env.https_proxy
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action)'.red.bold);
      police.winston.warn(res.request.uri.href.red);
      police.exit(1);
    } else {
      callback(JSON.parse(body));
    }
  });
}
