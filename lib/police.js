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
    , eyes = require('eyes')
    , colors = require('colors')
    , prompt = require('prompt');

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
    var command = argv._;

    /*
     * Requiring necessary modules
     */
    police.config = require('./police/config').load();
    police.help = require('./police/help');

    /*
     * Print version
     */
    if (argv.version || argv.v) {
      winston.info('v'.yellow.bold + police.version.yellow.bold);
      police.exit();
    }

    /*
     * Display help and usage
     */
    if (argv.help || argv.h) {
      police.help.show();
      police.exit();
    }

  } catch (err) {
    callback(err);
  }
}

/*
 * Exit on successful execution
 */
police.exit = function () {
  winston.info('Police'.grey + ' ok'.green.bold);
  process.exit(0);
}
