/*
 * police.js: Top level include for police module
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var police = module.exports;

/*
 * Load node modules
 */
var winston = require('winston')
    , eyes = require('eyes');

/*
 * Setup `police` to use `pkginfo` to expose version
 */
require('pkginfo')(module, 'version');

/*
 * Starts the police cli and runs the specified command.
 */
police.start = function (argv, callback) {

  winston.info('Welcome to ' + 'Police'.grey);
  winston.info('It worked if it ends with ' + 'Police'.grey + ' ok'.green.bold);

  try {
    var command = argv._[0];

    /*
     * Requiring necessary modules
     */
    police.config = require('./police/config').load();
    police.help = require('./police/help');
    police.auth = require('./police/auth');
    police.github = require('./police/github');
    police.winston = winston;

    /*
     * Print version of this tool
     */
    if (argv.version || argv.v) {
      winston.info('v'.yellow.bold + police.version.yellow.bold);
      police.exit();
    }

    /*
     * Destroy authentication
     */
    if (argv.destroy || argv.d) {
      police.auth.logout();
    }

    /*
     * Police authentication to github
     */
    if (command == 'auth') {
      police.auth.prompt();
    }

    /*
     * Display help and usage
     */
    if (argv.help || argv.h) {
      police.help.show();
    }
  } catch (err) {
    callback(err);
  }
}

/*
 * Exit on successful execution
 */
police.exit = function (status) {
  if (!status || status==0) {
    winston.info('Police'.grey + ' ok'.green.bold);
  } else {
    winston.info('Police'.grey + ' not ok'.red.bold);
  }
  process.exit(status || 0);
}
