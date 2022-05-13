/*
 * @Author: losting
 * @Date: 2022-05-12 14:34:19
 * @LastEditTime: 2022-05-13 10:41:38
 * @LastEditors: losting
 * @Description:
 * @FilePath: \moe-cli\src\commands\create.js
 */

const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const downloadGitRepo = require('download-git-repo');
const { promisify } = require('util');
const shell = require('shelljs');
const logger = require('../utils/logger');
const spinner = require('../utils/spinner');
const repoList = require('../repo.json');

class Creator {
  constructor(projectName, options) {
    this.projectName = projectName;
    this.options = options;
    this.downloadGitRepo = promisify(downloadGitRepo);
    this.createdConfig = {
      template: '',
      options: [],
    };
  }

  async create() {
    const cwd = process.cwd();
    const targetDirectory = path.join(cwd, this.projectName);

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
    const res = await this.downloadTemplate(this.createdConfig.template);
    if (res) {
      // 根据配置修改模板内容
      await this.modifyTemplate();
      logger.success(`${this.projectName} 创建成功!`);
    }
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
    this.createdConfig.template = selectedTemplate;
  }

  // 选择配置
  async selectOptions() {
    const selectedTemplate = repoList.find((item) => item.value === this.createdConfig.template);
    if (selectedTemplate.options.length) {
      const { selectedOptions } = await inquirer.prompt([
        {
          type: 'checkbox',
          message: '请选择需要的依赖',
          name: 'selectedOptions',
          choices: selectedTemplate.options,
        },
      ]);
      this.createdConfig.options = selectedOptions;
    }
  }

  // 下载模板
  async downloadTemplate(templateUrl) {
    // 模板下载地址
    const res = await spinner(
      '正在拉取...',
      this.downloadGitRepo,
      templateUrl,
      path.join(process.cwd(), this.projectName),
    );
    return res;
  }

  // 根据配置修改模板内容
  async modifyTemplate() {
    const prefix = [process.cwd(), this.projectName];
    // 读取package.json
    const packageObj = fs.readJsonSync(path.join(...prefix, 'package.json'));

    // 修改package.json
    packageObj.name = this.projectName;
    packageObj.description = this.projectName;
    packageObj.main = `lib/${this.projectName}.cjs.js`;
    packageObj.module = `lib/${this.projectName}.esm.js`;
    packageObj.repository.url = `git+https://github.com/thelostword/${this.projectName}.git`;
    packageObj.bugs.url = `https://github.com/thelostword/${this.projectName}/issues`;
    packageObj.homepage = `https://github.com/thelostword/${this.projectName}#readme`;

    // rollup-template
    if (this.createdConfig.template === 'github:thelostword/rollup-template') {
      if (!this.createdConfig.options.includes('TypeScript')) {
        fs.removeSync(path.join(...prefix, 'tsconfig.json'));
        fs.removeSync(path.join(...prefix, 'tsconfig.eslint.json'));
        delete packageObj.devDependencies['@rollup/plugin-typescript'];
        delete packageObj.devDependencies['@typescript-eslint/eslint-plugin'];
        packageObj.devDependencies['eslint-config-airbnb-base'] = '^15.0.0';
        delete packageObj.devDependencies['@typescript-eslint/parser'];
        delete packageObj.devDependencies['eslint-config-airbnb-typescript'];
        delete packageObj.devDependencies.typescript;
        delete packageObj.devDependencies.tslib;
        delete packageObj.devDependencies['ts-jest'];
        delete packageObj.types;

        const eslintObj = fs.readJsonSync(path.join(...prefix, '.eslintrc.json'));
        eslintObj.extends = eslintObj.extends.filter((item) => !item.includes('typescript'));
        delete eslintObj.parser;
        delete eslintObj.parserOptions.project;
        eslintObj.plugins = eslintObj.plugins.filter((item) => !item.includes('typescript'));
        eslintObj.rules = eslintObj.rules.filter((item) => !item.includes('typescript'));
        fs.writeJsonSync(path.join(...prefix, '.eslintrc.json'), eslintObj);
      }

      if (!this.createdConfig.options.includes('ESlint')) {
        fs.removeSync(path.join(...prefix, '.eslintrc.json'));
        fs.removeSync(path.join(...prefix, '.eslintignore'));
        delete packageObj.devDependencies.eslint;
        delete packageObj.devDependencies['eslint-config-airbnb-typescript'];
        delete packageObj.devDependencies['eslint-config-airbnb-base'];
        delete packageObj.devDependencies['eslint-plugin-import'];
        delete packageObj.devDependencies['@typescript-eslint/parser'];
        delete packageObj.devDependencies['@typescript-eslint/eslint-plugin'];
      }

      if (!this.createdConfig.options.includes('Jest')) {
        fs.removeSync(path.join(...prefix, 'jest.config.js'));
        fs.removeSync(path.join(...prefix, 'test'));
        delete packageObj.devDependencies.jest;
        delete packageObj.devDependencies['ts-jest'];
        delete packageObj.devDependencies['@types/jest'];
        delete packageObj.scripts.test;
      }

      if (!this.createdConfig.options.includes('Scss')) {
        fs.removeSync(path.join(...prefix, 'src', 'styles'));
        delete packageObj.devDependencies.sass;
        delete packageObj.devDependencies['rollup-plugin-scss'];
      }
    }

    // 写入修改后的package.json
    fs.writeJsonSync(path.join(...prefix, 'package.json'), packageObj);

    if ('git' in this.options) {
      shell.exec(`cd ${path.join(...prefix)} && git init`);
    } else {
      fs.removeSync(path.join(...prefix, '.git'));
      fs.removeSync(path.join(...prefix, '.gitignore'));
    }
  }
}

module.exports = Creator;
