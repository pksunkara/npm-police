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
  , police = require('../police');

/*
 * Required fields
 */
var fields = [
  'name',
  'version',
  'author',
  'description',
  'contributors',
  'scripts',
  'main',
  'repository',
  'keywords',
  'homepage',
  'dependencies',
  'devDependencies',
  'bugs',
  'licenses',
  'engines'
];

/*
 * Outdated dependencies
 */
check.dependencies = {};
check.devDependencies = {};

/*
 * The main function which take package.json
 */
check.pkg = function (pkg, local, callback) {
  var pkgs = [];
  for(dep in pkg.dependencies) {
    pkgs.push({ name: dep, version: pkg.dependencies[dep], dev: false });
  }
  for(dep in pkg.devDependencies) {
    pkgs.push({ name: dep, version: pkg.devDependencies[dep], dev: true });
  }

  police.async.forEachSeries(pkgs, check.npm, function (err) {
    if (err) callback(err);
    check.suggest(pkg, local, callback);
  });
}

/*
 * Suggest missing fields for package.json
 */
check.suggest = function (pkg, local, callback) {
  var suggestions = [];
  fields.forEach(function (field) {
    if (!pkg[field]) suggestions.push(field.yellow.bold);
  });
  if (suggestions.length==0) {
    police.winston.info('  ✓'.green.bold + ' No suggestions');
  } else {
    police.winston.info('  -'.yellow.bold + ' Suggest adding ' + suggestions.join(', '));
  }
  if (police.update) {
    pkg.dependencies = check.dependencies;
    pkg.devDependencies = check.devDependencies;
  }
  if (!local && (police.add || police.edit)) {
    police.ask.fields(pkg, fields, callback);
  } else if (!local && police.update) {
    police.ask.update(pkg, callback);
  } else if (local && police.update) {
    fs.writeFile(local, JSON.stringify(pkg, null, 2) + '\n', function (err) {
      if (err) {
        police.winston.error('Unable to write package.json'.red.bold);
        police.exit(1);
      } else {
        callback();
      }
    });
  } else {
    callback();
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
            check.pkg(JSON.parse(data), path.resolve(file), police.exit);
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
 * Add dependencies to the proper object
 */
check.add = function (name, version, dev) {
  if (dev) {
    check.devDependencies[name] = version;
  } else {
    check.dependencies[name] = version;
  }
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
      if (!police.semver.satisfies(body.version, dep.version)) {
        if (police.update) {
          check.add(dep.name, body.version, dep.dev);
        }
        police.winston.info('  ✗'.red.bold + ' Need to update ' + dep.name.blue + ' to ' + body.version.yellow);
      } else {
        if (police.update) {
          check.add(dep.name, dep.version, dep.dev);
        }
        police.winston.info('  ✓'.green.bold + ' Checked ' + dep.name.blue);
      }
      callback();
    }
  });
}
