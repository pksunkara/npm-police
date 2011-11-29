/*
 * police.js: Top level include for police module
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var police = module.exports;

/*
 * Load node modules
 */
var winston = require('winston');

/*
 * Setup `police` to use `pkginfo` to expose version
 */
require('pkginfo')(module, 'version');

/*
 * Starts the police cli and runs the specified command.
 */
police.start = function (argv, callback) {

  /*
   * Declare some flags
   */
  var maincmd = true
      , otheruser = false;

  winston.info('Welcome to ' + 'Police'.grey);
  winston.info('It worked if it ends with ' + 'Police'.grey + ' ok'.green.bold);

  try {

    /*
     * Requiring necessary modules
     */
    police.config = require('./police/config').load();
    police.help = require('./police/help');
    police.auth = require('./police/auth');
    police.github = require('./police/github');
    police.check = require('./police/check');
    police.prompt = require('prompt');
    police.async = require('async');
    police.request = require('request');
    police.inspect = require('eyes').inspector({ styles: {all: 'grey', string: 'yellow'}, maxLength: 8192});
    police.winston = winston;

    /*
     * Some variables
     */
    var command = argv._[0] || ''
        , name = police.config.get('name');

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
      maincmd = false;
      police.auth.logout();
    }

    /*
     * Reads a local file and checks it
     */
    if (argv.l) {
      maincmd = false;
      police.check.local(argv.l);
    }

    /*
     * Police authentication to github
     */
    if (command == 'auth') {
      maincmd = false;
      police.auth.prompt();
    }

    /*
     * Other user/org module
     */
    else if (command.indexOf('/')!=-1) {
      maincmd = false;
      police.github.singleModule(command, false, police.exit);
    }

    /*
     * Specific module of authenticated user
     */
    else if (command && command!='') {
      maincmd = false;
      police.github.singleModule(name + '/' + command, true, police.exit);
    }

    /*
     * Display help and usage
     */
    if (argv.help || argv.h) {
      maincmd = false;
      police.help.show();
    }

    /*
     * Other user/org
     */
    if (argv.u) {
      name = argv.u;
      otheruser = true;
    }

    /*
     * Authenticated user
     */
    if (maincmd) {
      police.github.singleUser(name, otheruser);
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
