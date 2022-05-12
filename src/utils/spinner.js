/*
 * @Author: losting
 * @Date: 2022-05-12 14:42:08
 * @LastEditTime: 2022-05-12 15:40:47
 * @LastEditors: losting
 * @Description:
 * @FilePath: \moe-cli\src\utils\spinner.js
 */
const ora = require('ora');

async function func(message, fn, ...args) {
  const spinner = ora(message);
  spinner.start();

  try {
    const executeRes = await fn(...args);
    spinner.succeed();
    return executeRes;
  } catch (error) {
    spinner.fail('request fail, refetching');
    return null;
  }
}

module.exports = func;
