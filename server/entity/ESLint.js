'use strict'
const fs = require('fs')
const { installPackage } = require('../commands/installPackage')
const { makeFullName } = require('../fileUtils')
const { CommonInfo } = require('../CommonInfo')
const { wsSend } = require('../wsServer')

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
        const { entities: { PackageJson } } = require('./all')
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
        const { entities: { Readme, PackageJson } } = require('./all')
        const config = {
            env: { browser: true, commonjs: true },
        }

        this.addExtend(config, 'eslint:recommended')
        // TODO: Пока безусловно. Но могут выявиться ситуации, когда он не нужен

        const packages = new Set(['eslint'])

        if (CommonInfo.tech.transpiler === 'TypeScript') {
            packages.add('@typescript-eslint/parser ')
            config.parser = '@typescript-eslint/parser'
        } else if (CommonInfo.tech.transpiler === 'Babel') {
            packages.add('@babel/eslint-parser')
            config.parser = '@babel/eslint-parser'
        }
        if (CommonInfo.tech.language === 'TypeScript') {
            packages.add('@typescript-eslint/eslint-plugin')
        }
        if (CommonInfo.tech.framework === 'React') {
            packages.add('eslint-plugin-react').add('eslint-plugin-react-hooks')
            // eslint-plugin-react-hooks нужен для airbnb
            this.addPlugin(config, 'react') // TODO: Должен быть перед prettier
            this.addExtend(config, 'plugin:react/recommended')
            this.addSettings(config, 'react', { version: "detect" })
        }

        if (params.airbnb) {
            if (CommonInfo.tech.framework === 'React') {
                packages
                    .add('eslint-plugin-jsx-a11y') // Порядок важен
                    .add('eslint-plugin-import')
                    .add('eslint-config-airbnb')
                this.addExtend(config, 'airbnb')
                this.addRule(config, "react/jsx-filename-extension", [1, { "extensions": [".tsx"] }])
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

        for (const packageName of Array.from(packages)) {
            await installPackage(this.name, packageName)
        }

        wsSend('createEntityMsg', { name: this.name, message: 'Create config ' + this.getConfigName() })
        await this.saveConfig(config)

        if (packages.has('prettier')) {
            wsSend('createEntityMsg', { name: this.name, message: 'Add prettier badge to README.md' })
            const badge = '[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)'
            await Readme.update(lines => Readme.addBadge(lines, badge))
        }

        // Scripts
        if (params.useCheck || params.useFix) {
            wsSend('createEntityMsg', { name: this.name, message: 'Update scripts in package.json' })
            const extList = CommonInfo.getExtsList()
            const exts = extList.length === 1 ? extList[0] : `{${extList.join(',')}}`
            const eslintCmd = `eslint "src/**/*.${exts}"`
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