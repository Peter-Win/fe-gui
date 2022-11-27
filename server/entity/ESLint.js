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

            // Отключаем те правила, которые несовместимы с TS, и заменяем на соответствующие для TS
            const rules = [
                ["no-unused-vars", "off"],
                ["@typescript-eslint/no-unused-vars", ["error"]],
                // See https://github.com/Peter-Win/fe-gui/issues/41
                ["no-shadow", "off"],
                ["@typescript-eslint/no-shadow", ["error"]],
                ["no-useless-constructor", "off"],
                ["@typescript-eslint/no-useless-constructor", ["error"]],
                ["no-empty-function", "off"],
                ["@typescript-eslint/no-empty-function", ["error"]],
                ["no-redeclare", "off"],
                ["@typescript-eslint/no-redeclare", ["error"]],
            ]
            this.tsRules.forEach(([name, title, body]) => {
                if (params[name]) {
                    rules.push(["@typescript-eslint/"+name, body || ["error"]])
                }
            });
            rules.forEach(([name, value]) => this.addRule(config, name, value))
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
<style>
.rules-row {display: flex; flex-direction: row; align-items: baseline;}
.rules-grid {display: grid; grid-template-columns: 1fr 1fr;}
</style>
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
    // закомменченные правила выдают ошибку:
    // You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.
    tsRules = [
        ["array-type", "array-type = array", ["error", { "default": "array", "readonly": "array" }]],
        ["no-empty-interface", ""],
        ["no-explicit-any", ""],
        ["no-non-null-asserted-nullish-coalescing", ""],
        ["no-non-null-asserted-optional-chain", ""],
        // ["no-redundant-type-constituents", ""],
        // ["no-unnecessary-boolean-literal-compare", ""],
        // ["no-unnecessary-type-assertion", ""],
        ["no-unnecessary-type-constraint", ""],
        ["no-useless-empty-export", ""],
        // ["prefer-includes", ""],
        ["prefer-optional-chain", ""],
        // ["prefer-readonly", ""],
        // ["prefer-string-starts-ends-with", ""],
        ["sort-type-constituents", ""],
        ["unified-signatures", ""],
    ]
    get controls() {
        return `
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
</div>` + 
(CommonInfo.tech.language === "TypeScript" ? `
<h3>The most useful rules for TypeScript</h3>
<div class="rules-grid">
${this.tsRules.map(([name, title]) => `<div class="rules-row">
  <div class="rn-ctrl" data-name="${name}" data-type="Checkbox" data-value0="true" data-title="${title || name}"></div>
  <a href="https://typescript-eslint.io/rules/${name}" target="_blank">info</a>
</div>`).join("")}</div>` : "")
}
}
module.exports = { ESLint }