/*
 * @Author: losting
 * @Date: 2022-04-01 16:05:12
 * @LastEditTime: 2022-05-18 14:41:32
 * @LastEditors: losting
 * @Description:
 * @FilePath: \moe-cli\src\index.js
 */

const { program } = require('commander');
const chalk = require('chalk');
// const minimist = require('minimist');
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
  .command('create <app-name>')
  .description('创建项目')
  .option('-d, --default', '使用默认配置')
  .option('-g, --git', '初始化git')
  .action((name, options) => {
    const creator = new Creator(name, options);
    creator.create();
  });

program
  .name(pkg.name)
  .usage('<command> [option]')
  .version(pkg.version)
  .parse(process.argv);
