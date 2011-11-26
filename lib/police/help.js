/*
 * help.js: Display module for police help and usage
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var help = module.exports;

var colors = require('colors')
    , winston = require('winston');

help.usage = [
  '                __   __                '.cyan,
  ' .-----. .-----. |  | |__| .----. .-----.'.cyan,
  ' |  _  | |  _  | |  | |  | |  __| |  -__|'.cyan,
  ' |   __| |_____| |__| |__| |____| |_____|'.cyan,
  ' |__|                                    '.cyan,
  '',

  'A module dependency version policing tool.',
  'https://github.com/pkumar/npm-police',
  '',

  'Authenticate to github'.cyan.bold,
  '  police auth',
  '',

  'Police all your module dependencies'.cyan.bold,
  '  police',
  '',

  'Police one of your particular module'.cyan.bold,
  '  police <reponame>',
  '',

  'Police another user/org module dependencies'.cyan.bold,
  '  police -u  <username>',
  '',

  'Police a particular module of another user/org'.cyan.bold,
  '  police <username>/<reponame>',
  '',

  'Interactively implement police suggestions'.cyan.bold,
  '  police -i [username | reponame | username/reponame]',
  '',

  'Miscellaneous police flags'.cyan.bold,
  '',

  '  --version, -v        Displays version',
  '  --help, -h           Displays help and usage',
  '  --conf=[FILE]        Sets the configuraiton file to be used',
  ''
];

/*
 * Shows the help for police
 */
help.show = function (name, action) {
  winston.help('');
  help.usage.forEach(function (line) {
    winston.help(line);
  });
  winston.help('');
};
