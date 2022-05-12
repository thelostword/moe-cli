/*
 * @Author: losting
 * @Date: 2022-05-12 14:34:19
 * @LastEditTime: 2022-05-12 16:28:13
 * @LastEditors: losting
 * @Description:
 * @FilePath: \moe-cli\src\commands\create.js
 */

const path = require('path');
const fs = require('fs');
const Inquirer = require('inquirer');
const logger = require('../utils/logger');

class Creator {
  constructor(porjectName, target) {
    this.porjectName = porjectName;
    this.target = target;
  }

  async create() {
    const cwd = process.cwd();
    const targetDirectory = path.join(cwd, this.porjectName);

    // 判断目录是否存在
    if (fs.existsSync(targetDirectory)) {
      logger.error(`${targetDirectory} 目录已存在!`);
      return;
    }

    // 选择模板
    const { selectedTemplate } = await new Inquirer.prompt([
      {
        name: 'selectedTemplate',
        type: 'list', // list 类型
        message: '选择模板',
        choices: [
          { name: 'rollup-template', value: 'rollup-template' },
          { name: 'vite-vue3-template', value: 'vite-vue3-template' },
        ],
      },
    ]);
    console.log(selectedTemplate);
  }
}

module.exports = Creator;
