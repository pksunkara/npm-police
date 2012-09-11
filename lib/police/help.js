/*
 * help.js: Display module for police help and usage
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var help = module.exports;

/*
 * Requiring modules
 */
var police = require('../police');

/*
 * Help usage text
 */
help.usage = [
  '',
  '                  __   __                '.cyan,
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
  '  police -u <username>',
  '',

  'Police a particular module of another user/org'.cyan.bold,
  '  police <username>/<reponame>',
  '',

  'Police a local module dir or package.json file'.cyan.bold,
  '  police -l <FILE|DIR>',
  '',

  'Miscellaneous police flags'.cyan.bold,
  '',

  '  --force, -f          Continue running even if errors are encountered',
  '  --edit, -e           Edit all the fields in package.json',
  '  --add, -a            Add missing fields to package.json',
  '  --update, -t         Update packages in package.json ',
  '',
  '  --destroy, -d        Destroys exisiting authentication',
  '  --conf [FILE]        Sets the configuration file to be used',
  '',
  '  --version, -v        Displays version',
  '  --help, -h           Displays help and usage',
  ''
];

/*
 * Shows the help for police
 */
help.show = function (status) {
  help.usage.forEach(function (line) {
    police.winston.help(line);
  });
  police.exit(status || 0);
};
