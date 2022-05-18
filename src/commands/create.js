/*
 * @Author: losting
 * @Date: 2022-05-12 14:34:19
 * @LastEditTime: 2022-05-18 15:46:41
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
    // 其他配置
    await this.otherOptions();
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

  // 其他配置
  async otherOptions() {
    if (this.createdConfig.template === 'github:thelostword/vite-vue3-template') {
      if (this.createdConfig.options.includes('ESlint')) {
        const { isValidateEslintPass } = await inquirer.prompt([
          {
            type: 'confirm',
            message: '是否Eslint校验通过才能提交?',
            name: 'isValidateEslintPass',
            default: true,
          },
        ]);
        this.createdConfig.isValidateEslintPass = isValidateEslintPass;
      }
      if (this.createdConfig.options.includes('commitlint')) {
        const { isValidateCommitMsg } = await inquirer.prompt([
          {
            type: 'confirm',
            message: '是否校验commit提交信息?',
            name: 'isValidateCommitMsg',
            default: true,
          },
        ]);
        this.createdConfig.isValidateCommitMsg = isValidateCommitMsg;
      }
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

    // rollup-template
    if (this.createdConfig.template === 'github:thelostword/rollup-template') {
      packageObj.main = `lib/${this.projectName}.cjs.js`;
      packageObj.module = `lib/${this.projectName}.esm.js`;
      packageObj.description = this.projectName;
      packageObj.repository.url = `git+https://github.com/thelostword/${this.projectName}.git`;
      packageObj.bugs.url = `https://github.com/thelostword/${this.projectName}/issues`;
      packageObj.homepage = `https://github.com/thelostword/${this.projectName}#readme`;

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
    } else if (this.createdConfig.template === 'github:thelostword/vite-vue3-template') { // vite-vue3-template
      if (!this.createdConfig.options.includes('ESlint')) {
        fs.removeSync(path.join(...prefix, '.eslintrc.js'));
        delete packageObj.devDependencies.eslint;
        delete packageObj.devDependencies['eslint-config-airbnb-base'];
        delete packageObj.devDependencies['eslint-import-resolver-alias'];
        delete packageObj.devDependencies['eslint-plugin-import'];
        delete packageObj.devDependencies['eslint-plugin-vue'];

        delete packageObj.scripts.lint;
        delete packageObj.scripts['lint:fix'];
        // 移除提交前eslint检查
        delete packageObj['lint-staged'];
        delete packageObj.devDependencies['lint-staged'];
        fs.removeSync(path.join(...prefix, '.husky/pre-commit'));
      } else if (!this.createdConfig.isValidateEslintPass) {
        delete packageObj['lint-staged'];
        delete packageObj.devDependencies['lint-staged'];
        fs.removeSync(path.join(...prefix, '.husky/pre-commit'));
      }

      if (!this.createdConfig.options.includes('commitlint')) {
        fs.removeSync(path.join(...prefix, 'commitlint.config.js'));

        delete packageObj.devDependencies['@commitlint/cli'];
        delete packageObj.devDependencies['@commitlint/config-conventional'];
        delete packageObj.devDependencies['cz-conventional-changelog'];
        delete packageObj.devDependencies['standard-version'];

        delete packageObj.config.commitizen;
        delete packageObj.scripts.cz;
        delete packageObj.scripts.release;
        delete packageObj.scripts['release:minor'];
        delete packageObj.scripts['release:major'];
        fs.removeSync(path.join(...prefix, '.husky/commit-msg'));
      } else if (!this.createdConfig.isValidateCommitMsg) {
        fs.removeSync(path.join(...prefix, '.husky/commit-msg'));
      }

      if (!this.createdConfig.options.includes('commitlint') && !this.createdConfig.options.includes('ESlint')) {
        delete packageObj.devDependencies.husky;
        delete packageObj.scripts.prepare;
        fs.removeSync(path.join(...prefix, '.husky'));
      }
      if (!this.createdConfig.isValidateEslintPass && !this.createdConfig.isValidateCommitMsg) {
        delete packageObj.devDependencies.husky;
        delete packageObj.scripts.prepare;
        fs.removeSync(path.join(...prefix, '.husky'));
      }
    }

    // 写入修改后的package.json
    fs.writeJsonSync(path.join(...prefix, 'package.json'), packageObj);

    fs.removeSync(path.join(...prefix, '.git'));
    if ('git' in this.options) {
      shell.exec(`cd ${path.join(...prefix)} && git init`);
    }
  }
}

module.exports = Creator;
