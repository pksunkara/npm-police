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
    police.config  = require('./police/config').load();
    police.help    = require('./police/help');
    police.auth    = require('./police/auth');
    police.github  = require('./police/github');
    police.check   = require('./police/check');
    police.ask     = require('./police/ask');
    police.prompt  = require('prompt');
    police.async   = require('async');
    police.request = require('request');
    police.semver  = require('semver');
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
     * Set force parameter
     */
    if (argv.force || argv.f) {
      police.force = true;
    }

    /*
     * Set add parameter
     */
    if (argv.add || argv.a) {
      police.add = true;
    }

    /*
     * Set edit parameter
     */
    if (argv.edit || argv.e) {
      police.edit = true;
    }

    /*
     * Set update parameter
     */
    if (argv.update || argv.t) {
      police.update = true;
    }

    /*
     * Set registry parameter
     */
    police.registry = argv.registry || police.config.get('registry') || 'http://registry.npmjs.org/'

    /*
     * Reads a local file and checks it
     */
    if (argv.l) {
      maincmd = false;
      police.check.local(argv.l !== true ? argv.l : 'package.json');
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
      police.github.singleModule(command, police.exit);
    }

    /*
     * Specific module of authenticated user
     */
    else if (command && command!='') {
      maincmd = false;
      police.github.singleModule(name + '/' + command, police.exit);
    }

    /*
     * Other user/org
     */
    if (argv.u) {
      name = argv.u;
      otheruser = true;
    }

    /*
     * Display help and usage
     */
    if (argv.help || argv.h) {
      maincmd = false;
      police.help.show();
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
