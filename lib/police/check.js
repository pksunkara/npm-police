/*
 * check.js: Handles package.json checking
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var check = module.exports;

/*
 * Requiring modules
 */
var path = require('path')
    , fs = require('fs')
    , semver = require('semver')
    , police = require('../police');

/*
 * Required fields
 */
var fields = [
  'name',
  'version',
  'author',
  'description',
  'keywords',
  'homepage',
  'repository',
  'dependencies',
  'devDependencies',
  'main',
  'scripts',
  'bugs',
  'licenses',
  'engines'
];

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
    if (err) callback(err);
    check.suggest(pkg);
    callback();
  });
}

/*
 * Suggest missing fields for package.json
 */
check.suggest = function (pkg) {
  var suggestions = [];
  fields.forEach(function (field) {
    if (!pkg[field]) suggestions.push(field.yellow.bold);
  });
  if (suggestions.length==0) {
    police.winston.info('  ✓'.green.bold + ' No suggestions');
  } else {
    police.winston.info('  ✗'.red.bold + ' Suggest adding ' + suggestions.join(', '));
  }
}

/*
 * Read data from a local file
 */
check.local = function (file) {
  fs.stat(path.resolve(file), function (err, stats) {
    if (err) {
      police.winston.error('Given file or directory does not exist'.red.bold);
      police.exit(1);
    } else {
      if (stats.isDirectory()) {
        file = path.normalize(path.join(file, 'package.json'));
      } else if (!stats.isFile()) {
        police.winston.error('Not a valid path'.red.bold);
        police.exit(1);
      }
      fs.readFile(file, function (err, data) {
        if (err) {
          police.winston.error('Unable to read package.json'.red.bold);
          police.exit(1);
        } else {
          police.winston.info('Read file ' + file.cyan);
          try {
            check.pkg(JSON.parse(data), police.exit);
          } catch (err) {
            police.winston.error('Unable to parse package.json'.red.bold);
            police.exit(1);
          }
        }
      });
    }
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
      if (police.force) {
        callback();
        return;
      }
      callback(1);
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
