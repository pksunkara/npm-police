/*
 * github.js: Handles github requests
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var github = module.exports;

/*
 * Requiring modules
 */
var request = require('request')
    , police = require('../police');

/*
 * Default configuration
 */
github.options = {
  "protocol": "https",
  "host": "api.github.com",
  "url": "https://api.github.com"
}

/*
 * Calculate for a single module
 */
github.singleModule = function (name, callback) {
  police.winston.info('Policing ' + name.cyan);
  github.refs(name, function (ref) {

    police.winston.info('  Getting commit ' + ref.object.sha.substr(0,10).cyan);
    github.commit(name, ref, function (commit) {

      police.winston.info('  Getting tree ' + commit.tree.sha.substr(0,10).cyan);
      github.tree(name, commit, function (tree) {
        var blob = tree.tree.filter(function (e, i, a) {
          return e.path=='package.json' && e.type=='blob';
        });

        if (blob.length==1) {
          police.winston.info('  Getting package.json blob ' + blob[0].sha.substr(0,10).cyan);
          github.blob(name, blob[0].sha, function (body) {
            var pkg = JSON.parse(new Buffer(body.content, 'base64').toString('utf8'));
            police.check.pkg(pkg, callback);
          });
        } else {
          police.winston.warn('package.json not found on master'.magenta.bold);
          callback(1);
        }
      });
    });
  });
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
  request({
    url: github.tokenHost(auth) + '/authorizations',
    method: 'POST',
    body: JSON.stringify({
      "scopes": ["repo"]
    }),
    headers: {
      "Content-type": "application/json"
    }
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==201) {
      police.winston.info('Authenticated to github as ' + auth.username.cyan);
      body = JSON.parse(body);

      police.config.set('name', auth.username);
      police.config.set('token', body.token);
      police.config.set('_id', body.id);
      police.config.save(police);
    } else {
      police.winston.warn("Bad credentials, Unable to login".magenta.bold);
      police.exit(1);
    }
  });
}

/*
 * Build github token host
 */
github.tokenHost = function (auth) {
  return github.options.protocol + '://' + auth.username + ':' + auth.password + '@' + github.options.host;
}

/*
 * Github api GET request
 */
github.get = function (uri, callback) {
  request({
    url: github.options.url + uri,
    headers: {
      "Authorization": "token " + police.config.token(police)
    }
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action)'.magenta.bold);
      police.winston.warn(res.request.uri.href.magenta);
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
  request({
    url: github.options.url + uri,
    method: 'POST',
    body: JSON.stringify(content),
    headers: {
      "Content-type": "application/json",
      "Authorization": "token " + police.config.token(police)
    }
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action)'.magenta.bold);
      police.winston.warn(res.request.uri.href.magenta);
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
  request({
    url: github.options.url + uri + github.token,
    method: 'PUT',
    body: JSON.stringify(content),
    headers: {
      "Content-type": "application/json",
      "Authorization": "token " + police.config.token(police)
    }
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action)'.magenta.bold);
      police.winston.warn(res.request.uri.href.magenta);
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
  request({
    url: github.options.url + uri,
    method: 'DELETE',
    body: JSON.stringify(content),
    headers: {
      "Content-type": "application/json",
      "Authorization": "token " + police.config.token(police)
    }
  }, function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Page is MIA (missing in action)'.magenta.bold);
      police.winston.warn(res.request.uri.href.magenta);
      police.exit(1);
    } else {
      callback(JSON.parse(body));
    }
  });
}
