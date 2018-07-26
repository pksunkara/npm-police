/*
 * auth.js: Handles police's authentication
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var auth = module.exports;

/*
 * Requiring modules
 */
var police = require('../police')
  , inquirer = require('inquirer');

/*
 * Fields for authentication
 */
var properties = [
  {
    type: 'input',
    name: 'username',
    message: 'Github username',
    validate: function (input) {
      return input.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]+$/) !== null ? true : 'It should be non-empty alphanumeric';
    }
  },
  {
    type: 'password',
    name: 'password',
    message: 'Github password'
  }
];

auth.prompt = function () {
  /*
   * Get the username and password from the user
   */
  inquirer.prompt(properties).then(function (result) {
    police.winston.silly('Authenicating to github'.cyan);
    police.github.token(result);
  });
}

auth.logout = function () {
  police.config.set('id', null);
  police.config.set('token', null);
  police.winston.info('User has been logged out');
  police.config.save(police);
}
