/*
 * config.js: Configuration for police cli.
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var config = module.exports;

/*
 * Requiring modules
 */
var nconf = require('nconf')
    , winston = require('winston')
    , fs = require('fs')
    , path = require('path');

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
 * Get github authenticated token
 */
config.token = function (police) {
  if (!config.cached_token) {
    config.cached_token = nconf.get('token');
    if (!config.cached_token) {
      police.winston.warn('You are not authenticated to github'.magenta.bold);
      police.help.show(1);
    }
  }
  return config.cached_token;
}

/*
 * Define get function which passes args to nconf.get()
 */
config.get = function (key) {
  return nconf.get(key);
}

/*
 * Define set function which passes args to nconf.set()
 */
config.set = function (key, value) {
  nconf.set(key, value);
}

/*
 * Define save function which saves the config to file
 */
config.save = function (police) {
  nconf.save(function (err) {
    if (err) police.exit(err);
    winston.silly('Saving configuration file.'.cyan);
    police.exit();
  });
}
