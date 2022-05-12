/*
 * @Author: losting
 * @Date: 2022-04-01 16:05:12
 * @LastEditTime: 2022-05-12 16:00:06
 * @LastEditors: losting
 * @Description:
 * @FilePath: \moe-cli\src\index.js
 */

const { program } = require('commander');
const chalk = require('chalk');
const Creator = require('./commands/create');
const pkg = require('../package.json');

// 监听 --help 指令
program.on('--help', () => {
  console.log(
    `Run ${chalk.cyan(
      'moe-cli <command> --help',
    )} for detailed usage of given command.`,
  );
});

// create 指令
program
  .command('create <project-name>')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exists')
  .action((name, cmd) => {
    const creator = new Creator(name, cmd);
    creator.create();
  });

program
  .name(pkg.name)
  .usage('<command> [option]')
  .version(pkg.version)
  .parse(process.argv);
