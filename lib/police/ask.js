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
  , police = require('../police');

/*
 * Properties of fields
 */
var prop = [];

/*
 * Github data for fields
 */
var gh = {};

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
    gh.user = user;

    police.github.get('/repos/' + gh.name, function (repo) {
      gh.repo = repo;

      police.github.v2('/repos/show/' + gh.name + '/contributors', function (contrib) {
        gh.contrib = contrib.contributors;
        ghlock = false;
      });
    });
  });
}

/*
 * The main function which asks fields and writes them
 */
ask.fields = function (pkg, fields, callback) {
  ask.release(function () {
    if (!pkg.dependencies) pkg.dependencies = {};
    if (!pkg.devDependencies) pkg.devDependencies = {};

    if (!pkg.name || police.edit) {
      prop.push({
        message: 'Module name',
        name: 'name',
        validator: /^[a-zA-Z0-9\-_\.]+$/,
        warning: 'Module name must be valid',
        empty: false,
        default: gh.repo.name
      });
    }

    if (!pkg.version || police.edit) {
      prop.push({
        message: 'Module version',
        name: 'version',
        validator: function (v) { return police.sermver.valid(v); },
        warning: 'Version must conform to semver',
        empty: false,
        default: '0.1.0'
      });
    }

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
