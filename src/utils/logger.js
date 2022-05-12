/*
 * @Author: losting
 * @Date: 2022-05-12 14:34:51
 * @LastEditTime: 2022-05-12 16:27:22
 * @LastEditors: losting
 * @Description:
 * @FilePath: \moe-cli\src\utils\logger.js
 */
// const chalk = require('chalk');
const chalk = require('chalk');

class Logger {
  static info(message) {
    console.log(chalk.blue(message));
  }

  static error(message) {
    console.log(chalk.red(message));
  }

  static warn(message) {
    console.log(chalk.yellow(message));
  }

  static success(message) {
    console.log(chalk.green(message));
  }

  static debug(message) {
    console.log(chalk.magenta(message));
  }

  static log(message) {
    console.log(message);
  }
}

module.exports = Logger;
