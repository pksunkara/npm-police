/*
 * ask.js: Handles package.json writing
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var ask = module.exports;

/*
 * Requiring modules
 */
var path = require('path')
    , fs = require('fs')
    , semver = require('semver')
    , police = require('../police');

/*
 * Properties of keywords
 */
var prop = {};

/*
 * Lock until we get github data
 */
var ghlock = false;

/*
 * Build prompt properties
 */
ask.properties = function (pkg, gh) {
  ghlock = true;
  police.github.get('/users/' + gh.user, function (user) {
    prop.user = user;

    police.github.get('/repos/' + gh.name, function (repo) {
      prop.repo = repo;

      police.github.v2('/repos/show/' + gh.name + '/contributors', function (contrib) {
        prop.contrib = contrib.contributors;
        ghlock = false;
      });
    });
  });
}

/*
 * The main function which asks keywords and writes them
 */
ask.keywords = function (pkg, fields, callback) {
  ask.release(function () {
    callback();
  });
}

/*
 * Wait until lock is released
 */
ask.release = function (callback) {
  if (ghlock) {
    setTimeout(ask.release, 1000, callback);
  } else {
    callback();
  }
}

/*
 * The main function which write dependencies
 */
ask.packages = function () {

}
