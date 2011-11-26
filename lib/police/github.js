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
      "Authorization": "token " + police.config.get('token')
    }
  }, function (err, res, body) {
    callback();
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
      "Authorization": "token " + police.config.get('token')
    }
  }, function (err, res, body) {
    callback();
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
      "Authorization": "token " + police.config.get('token')
    }
  }, function (err, res, body) {
    callback();
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
      "Authorization": "token " + police.config.get('token')
    }
  }, function (err, res, body) {
    callback();
  });
}
