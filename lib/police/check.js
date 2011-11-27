/*
 * check.js: Handles package.json checking
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var check = module.exports;

/*
 * Requiring modules
 */
var semver = require('semver')
    , police = require('../police');

/*
 * The main function which take package.json
 */
check.pkg = function (pkg, callback) {
  var pkgs = [];
  for(dep in pkg.dependencies) {
    pkgs.push({ name: dep, version: pkg.dependencies[dep] });
  }
  for(dep in pkg.devDependencies) {
    pkgs.push({ name: dep, version: pkg.devDependencies[dep] });
  }
  police.async.forEachSeries(pkgs, check.npm, function (err) {
    callback(err);
  });
}

/*
 * Get version for the npm package
 */
check.npm = function (dep, callback) {
  police.request.get('https://registry.npmjs.org/' + dep.name + '/latest', function (err, res, body) {
    if (err) police.exit(err);
    if (res.statusCode==404) {
      police.winston.warn('Module is MIA (missing in action)'.red.bold);
      police.winston.warn(res.request.uri.href.red);
      police.exit(1);
    } else {
      body = JSON.parse(body);
      if (!semver.satisfies(body.version, dep.version)) {
        police.winston.info('  ✗'.red.bold + ' Need to update ' + dep.name.blue + ' to ' + body.version.yellow);
      } else {
        police.winston.info('  ✓'.green.bold + ' Checked ' + dep.name.blue);
      }
      callback();
    }
  });
}
