/*
 * config.js: Configuration for police cli.
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var nconf = require('nconf')
    , winston = require('winston')
    , colors = require('colors')
    , fs = require('fs')
    , path = require('path');

var config = module.exports;

config.load = function () {
  /*
   * Load options from env and argv
   *
   * Give priority to env
   * Then to arguments
   */
  nconf.env().argv();

  /*
   * Now load options from file /home/user/.policeconf
   * or the file specified in env or argv
   */
  var conf = nconf.get('conf') || path.join(process.env.HOME, '.policeconf');

  if (!path.existsSync(conf)) {
    winston.silly('Initalizing configuration file'.cyan);
    try {
      fs.writeFileSync(conf, '{}');
    } catch (err) {
      winston.warn('Cannot intialize configuration file.'.magenta.bold);
      throw err;
    }
  }

  nconf.file({ file: conf });

  /*
   * Define some defaults
   */
  nconf.defaults({});

  return this;
}

/*
 * Define get function which passes args to nconf.get()
 */
config.get = function (key) {
  nconf.get(key, function (err) {
    if (err) throw err;
  });
}

/*
 * Define set function which passes args to nconf.set()
 */
config.set = function (key, value) {
  nconf.set(key, value, function (err) {
    if (err) throw err;
  });
}

/*
 * Define save function which saves the config to file
 */
config.save = function () {
  nconf.save(function (err) {
    if (err) throw err;
    winston.silly('Saving configuration file.'.cyan);
  });
}
