'use strict'
const fs = require('fs')
const { installPackageSmart } = require('../commands/installPackage')
const { makeFullName } = require('../fileUtils')
const { CommonInfo } = require('../CommonInfo')
const { wsSend } = require('../wsServer')
const { wsSendCreateEntity } = require('../wsSend')
const { createEntity } = require('../commands/createEntity')

// Awesome eslint
// https://github.com/dustinspecker/awesome-eslint

class ESLint {
    name = 'ESLint'
    depends = []
    isInit = false
    isReady = false

    /**
     * @param {Set<string>} ignores
     */
    vcsIgnore(ignores) {
        ignores.add('.eslintcache')
    }

    async init() {
        const { entities: { PackageJson }, entities } = require('./all')
        this.isInit = PackageJson.isDevDependency('eslint')
        if (this.isInit) {
            CommonInfo.tech.codeStyle = this.name
        } else {
            this.isReady = !CommonInfo.tech.codeStyle
        }
    }

    defaultParams = {
        prettier: true,
        airbnb: true,
        useCheck: true,
        cmdCheck: 'lint',
        useFix: true,
        cmdFix: 'lint:fix',
    }

    /**
     * @param {Object} config 
     * @param {string} name 
     */
    addPlugin = (config, name) => {
        config.plugins = config.plugins || []
        if (!config.plugins.includes(name)) config.plugins.push(name)
    }
    /**
     * @param {Object} config 
     * @param {string} rule 
     * @param {any} value 
     */
    addRule = (config, rule, value) => {
        config.rules = config.rules || {}
        config.rules[rule] = value
    }
    /**
     * @param {Object} config 
     * @param {string} name 
     */
    addExtend = (config, name) => {
        config.extends = config.extends || []
        if (!config.extends.includes(name)) config.extends.push(name)
    }
    /**
     * @param {Object} config 
     * @param {string} part 
     * @param {any} value 
     */
    addSettings = (config, part, value) => {
        config.settings = config.settings || {}
        config.settings[part] = value
    }

    async create(params) {
        const { entities } = require('./all')
        const { Readme, PackageJson, TypeScript } = entities
        const config = {
            root: true,
            env: { browser: true, commonjs: true },
            globals: {
                // globalThis used for Jest+React18: globalThis.IS_REACT_ACT_ENVIRONMENT = true;
                // https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
                globalThis: false,
             },
        }

        this.addExtend(config, 'eslint:recommended')
        // TODO: Пока безусловно. Но могут выявиться ситуации, когда он не нужен

        const packages = new Set(['eslint'])
        const isVue = CommonInfo.tech.framework === 'Vue'

        // К сожалению, TypeScript транспилируемый через Babel, не поддерживается. Поэтому используется tsc
        // https://www.npmjs.com/package/@babel/eslint-parser#typescript
        // While @babel/eslint-parser can parse TypeScript, we don't currently support linting TypeScript 
        // using the rules in @babel/eslint-plugin. This is because the TypeScript community has centered 
        // around @typescript-eslint and we want to avoid duplicate work. 
        // Additionally, since @typescript-eslint uses TypeScript under the hood, its rules can be made 
        // type-aware, which is something Babel doesn't have the ability to do.

        if (CommonInfo.tech.language === 'TypeScript') {
            if (CommonInfo.tech.transpiler !== TypeScript.name && !TypeScript.isInit) {
                await createEntity(entities, TypeScript.name, {isPrimary: false})
            }
            packages.add('@typescript-eslint/eslint-plugin')
            this.addPlugin(config, "@typescript-eslint")

            if (!isVue) {
                // Без Vue он нужен, а с ним - нет
                packages.add('@typescript-eslint/parser')
                config.parser = '@typescript-eslint/parser'
            }

            // Если не отключить no-unused-vars, то будут ошибки там где их быть не должно.
            // Например interface { fun(param: string): void; }
            // Здесь ошибочно будет указывать, что param объявлен, но не используется
            // See https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md
            this.addRule(config, "no-unused-vars", "off")
            this.addRule(config, "@typescript-eslint/no-unused-vars", ["error"])
        } else if (CommonInfo.tech.transpiler === 'Babel') {
            if (!isVue) {
                packages.add('@babel/eslint-parser')
                config.parser = '@babel/eslint-parser'
            }
        }
        if (CommonInfo.tech.framework === 'React') {
            packages.add('eslint-plugin-react').add('eslint-plugin-react-hooks')
            // eslint-plugin-react-hooks нужен для airbnb
            this.addPlugin(config, 'react') // TODO: Должен быть перед prettier
            this.addExtend(config, 'plugin:react/recommended')
            this.addSettings(config, 'react', { version: "detect" })
            // По невыясненным пока причинам eslint-plugin-react стал использовать 'function-declaration' as its default
            // Это неправильно. Поэтому нужно добавить правило для "arrow-function"
            this.addRule(config, "react/function-component-definition", [2, {
                "namedComponents": "arrow-function",
                "unnamedComponents": "arrow-function" 
                }],
            )            
        }
        if (CommonInfo.tech.framework === "Vue") {
            packages.add("eslint-plugin-vue");
            packages.add("@rushstack/eslint-patch");
            if (params.prettier) {
              packages.add("@vue/eslint-config-prettier");
              this.addExtend(config, "@vue/eslint-config-prettier");
            }
            if (CommonInfo.tech.language === "TypeScript") {
              packages.add("@vue/eslint-config-typescript");
              this.addExtend(config, "@vue/eslint-config-typescript/recommended");
            }
            this.addExtend(config, "plugin:vue/vue3-essential");
            config.env["vue/setup-compiler-macros"] = true;
        }
      
        if (params.airbnb) {
            if (CommonInfo.tech.framework === 'React') {
                packages
                    .add('eslint-plugin-jsx-a11y') // Порядок важен
                    .add('eslint-plugin-import')
                    .add('eslint-config-airbnb')
                this.addExtend(config, 'airbnb')
                this.addRule(config, "react/jsx-filename-extension",
                    [1, { "extensions": [`.${CommonInfo.getExtension('render')}`] }]
                )
            } else {
                packages.add('eslint-plugin-import').add('eslint-config-airbnb-base')
                this.addExtend(config, 'airbnb-base')
            }
            // Категорически считаю неприемлемым default export.
            // Все экспорты в проекте должны быть одинаковые, чтобы разработчик не вспоминал, в каком файле какой экспорт.
            this.addRule(config, "import/prefer-default-export", "off")
        }

        if (params.prettier) {
            packages.add('prettier').add('eslint-plugin-prettier').add('eslint-config-prettier')
            this.addPlugin(config, 'prettier')
            this.addExtend(config, 'prettier')
            this.addRule(config, 'prettier/prettier', 'error')
            // https://github.com/prettier/eslint-config-prettier/blob/main/CHANGELOG.md#version-800-2021-02-21
            // if (CommonInfo.tech.framework === 'React') {
            //     this.addExtend(config, 'prettier/react')
            // }
        }

        // Analyse of packages
        if (packages.has('eslint-plugin-import')) {
            // TODO: Пока не удалось избавиться от этой ошибки
            // error  Unable to resolve path to module './App'  import/no-unresolved
            this.addRule(config, "no-use-before-define", "off")

            if (CommonInfo.tech.language === 'TypeScript') {
                this.addSettings(config, "import/resolver", {
                    "node": {
                        "extensions": [".js", ".jsx", ".ts", ".tsx"]
                    }
                })
            }

            this.addRule(config, "import/extensions", [
                "error",
                "ignorePackages",
                {
                    "js": "never",
                    "jsx": "never",
                    "ts": "never",
                    "tsx": "never"
                }
            ])
        }

        await installPackageSmart(this.name, Array.from(packages))

        wsSendCreateEntity(this.name, 'Create config ' + this.getConfigName())
        await this.saveConfig(config)

        if (packages.has('prettier')) {
            wsSendCreateEntity(this.name, 'Add prettier badge to README.md')
            const badge = '[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)'
            await Readme.update(lines => Readme.addBadge(lines, badge))
        }

        // Scripts
        if (params.useCheck || params.useFix) {
            wsSend('createEntityMsg', { name: this.name, message: 'Update scripts in package.json' })
            const exts = Array.from(CommonInfo.makeCodeExts()).map(ext => `.${ext}`).join(',')
            const eslintCmd = `eslint ./src --ext ${exts}`
            await PackageJson.update(pj => {
                if (params.useCheck) {
                    pj.addScript(params.cmdCheck, eslintCmd)
                }
                if (params.useFix) {
                    pj.addScript(params.cmdFix, `${eslintCmd} --fix`)
                }
            })
        }
    }

    // Предполагаем, что конфиг в .eslintrc.json
    getConfigName() {
        return makeFullName('.eslintrc.json')
    }

    /**
     * @param {function(data: Object):Object} callback 
     */
    async updateConfig(callback) {
        const text = await fs.promises.readFile(this.getConfigName())
        const data = callback(JSON.parse(text))
        await this.saveConfig(data)
    }

    async saveConfig(data) {
        await fs.promises.writeFile(this.getConfigName(), JSON.stringify(data, null, '  '))
    }

    description = `
<div style="color: #777;font-size: 52px;">
<img
  alt="ESLint"
  src="https://d33wubrfki0l68.cloudfront.net/204482ca413433c80cd14fe369e2181dd97a2a40/092e2/assets/img/logo.svg"
  itemprop="image"
  style="width: 51px; height: 39px;"
/>
ESLint
</div>
<div>
ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code, with the goal of making code more consistent and avoiding bugs.
</div>
<div>
You can get more details on the <a href="https://eslint.org/" target="_blank">official website of ESLint</a>.
</div>
`
    controls = `
<div class="rn-ctrl" data-name="prettier" data-type="Checkbox" data-title="Prettier"></div>
<div class="rn-ctrl" data-name="airbnb" data-type="Checkbox" data-title="Airbnb Style"></div>
<h3>Scripts to add in package.json</h3>
<div class="ctrl-line">
  <div class="rn-ctrl" data-name="useCheck" data-type="Checkbox"></div>
  <div class="rn-ctrl" data-name="cmdCheck" data-type="String" data-tm="TmScriptName"
    data-title="Script for code check">
    <b class="rn-validator" data-type="ScriptName" data-use="useCheck"></b>
  </div>
</div>
<div class="ctrl-line">
  <div class="rn-ctrl" data-name="useFix" data-type="Checkbox"></div>
  <div class="rn-ctrl" data-name="cmdFix" data-type="String" data-title="Script for automatically format code" data-tm="TmScriptName">
    <b class="rn-validator" data-type="ScriptName" data-use="useFix"></b>  
  </div>
</div>

    `
}
module.exports = { ESLint }