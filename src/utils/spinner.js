/*
 * @Author: losting
 * @Date: 2022-05-12 14:42:08
 * @LastEditTime: 2022-05-18 15:17:31
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
    return executeRes || 1;
  } catch (error) {
    spinner.fail('request fail, refetching');
    return null;
  }
}

module.exports = func;
