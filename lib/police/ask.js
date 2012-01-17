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
 * Prompt properties of keywords
 */
var properties;

/*
 * Build prompt properties
 */
ask.properties = function (pkg, gh) {
  police.winston.info('Building defaults for ' + gh.name.cyan);
  police.github.get('/users/' + gh.user, function (user) {
    properties = [
      {
        message: 'Module name',
        name: 'name',
        default: pkg.name || gh.repo,
        empty: false
      },
      {
        message: 'Module version',
        name: 'version',
        default: pkg.version || '0.1.0',
        empty: false
      },
      {
        message: 'Module Author',
        name: 'author',
        default: pkg.author || user.name + '<' + user.email + '>',
        empty: false
      }
    ];
  });
}

/*
 * The main function which asks keywords and writes them
 */
ask.keywords = function (pkg, fields, callback) {
  police.prompt.get(properties, function (err, result) {
    console.log(result);
    callback();
  });
}

/*
 * The main function which write dependencies
 */
ask.packages = function () {

}
