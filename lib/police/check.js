/*
 * check.js: Handles package.json checking
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var check = module.exports;

/*
 * Requiring modules
 */
var request = require('request')
    , async = require('async')
    , semver = require('semver')
    , police = require('../police');

/*
 * The main function which take package.json
 */
check.pkg = function (pkg, callback) {
  //var pkgs = [];
  for(dep in pkg.dependencies) {
    police.winston.info('  Checking ' + dep.cyan);
    check.npm({ name: dep, version: pkg.dependencies[dep] });
    //pkgs.push({ name: dep, version: pkg.dependencies[dep] });
  }
  for(dep in pkg.devDependencies) {
    police.winston.info('  Checking ' + dep.cyan);
    check.npm({ name: dep, version: pkg.devDependencies[dep] });
    //pkgs.push({ name: dep, version: pkg.devDependencies[dep] });
  }
}

/*
 * Get version for the npm package
 */
check.npm = function (dep) {
  request.get('https://registry.npmjs.org/' + dep.name + '/latest', function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Module is MIA (missing in action)'.magenta.bold);
      police.winston.warn(res.request.uri.href.magenta);
      police.exit(1);
    } else {
      body = JSON.parse(body);
      if (!semver.satisfies(body.version, dep.version)) {
        police.winston.info('  Need to be update ' + dep.name.cyan + ' to ' + body.version.yellow.bold);
      }
    }
  });
}
