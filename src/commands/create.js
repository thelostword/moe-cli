/*
 * @Author: losting
 * @Date: 2022-05-12 14:34:19
 * @LastEditTime: 2022-05-12 17:18:56
 * @LastEditors: losting
 * @Description:
 * @FilePath: \moe-cli\src\commands\create.js
 */

const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const downloadGitRepo = require('download-git-repo');
const { promisify } = require('util');
const logger = require('../utils/logger');
const spinner = require('../utils/spinner');
const repoList = require('../repo.json');

class Creator {
  constructor(porjectName, target) {
    this.porjectName = porjectName;
    this.target = target;
    this.downloadGitRepo = promisify(downloadGitRepo);
    this.createdOptions = {
      template: '',
      options: [],
    };
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
    await this.selectTemplate();
    // 选择配置
    await this.selectOptions();
    // 下载模板
    await this.downloadTemplate(this.createdOptions.template);
    // 根据配置修改模板内容
  }

  // 选择模板
  async selectTemplate() {
    const { selectedTemplate } = await inquirer.prompt([
      {
        name: 'selectedTemplate',
        type: 'list', // list 类型
        message: '选择模板',
        choices: repoList,
      },
    ]);
    this.createdOptions.template = selectedTemplate;
  }

  // 选择配置
  async selectOptions() {
    const selectedTemplate = repoList.find((item) => item.value === this.createdOptions.template);
    if (selectedTemplate.options.length) {
      const { selectedOptions } = await inquirer.prompt([
        {
          type: 'checkbox',
          message: '请选择配置',
          name: 'selectedOptions',
          choices: selectedTemplate.options,
        },
      ]);
      this.createdOptions.options = selectedOptions;
    }
  }

  // 下载模板
  async downloadTemplate(templateUrl) {
    // 模板下载地址
    await spinner(
      '正在拉取...',
      this.downloadGitRepo,
      templateUrl,
      path.join(process.cwd(), this.porjectName),
    );
    logger.success('下载完成!');
  }
}

module.exports = Creator;
