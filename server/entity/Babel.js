"use strict"
/*
    Jest
    jest babel-jest

    package.json
      "jest": {
    "testPathIgnorePatterns": ["/node_modules/", "/fe-gui/"]

    .babelrc
    {
  "env": {
    "test": {
      "plugins": ["@babel/plugin-transform-modules-commonjs"]
    }
  }
}
  }

*/
const fs = require('fs')
const {installPackage} = require('../commands/installPackage')
const {wsSend} = require('../wsServer')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {CommonInfo} = require('../CommonInfo')
const {makeSrcName, makeFullName} = require('../fileUtils')

class Babel {
    name = 'Babel'
    depends = ['WebPack']
    isInit = false

    async init() {
        const {entities: {PackageJson}} = require('./all')
        // @babel/core может быть установлено автоматически при установке Storybook
        // При этом, основным транспилером может оставаться например TyprScript
        this.isInit = PackageJson.isDevDependency('@babel/core')
        if (this.isInit) {
            wsSend('statusMessage', {text: 'Babel detected'})
            if (!PackageJson.isDevDependency('typescript')) {
                CommonInfo.tech.transpiler = 'Babel'
                const isTS = PackageJson.isDevDependency('@babel/preset-typescript')
                CommonInfo.tech.language = isTS ? 'TypeScript' : 'JavaScript'
            }
        }
    }

    async create() {
        const indexExt = CommonInfo.getExtension('render');
        const shortExt = CommonInfo.getExtension('logic');
        const {entities} = require('../entity/all')
        const {WebPack} = entities
        const isTypeScript = CommonInfo.tech.language === 'TypeScript'
        // --- add packages
        let packages = 'babel-loader @babel/core'
        if (isTypeScript) {
            packages += ' @babel/preset-typescript'
        } else {
            packages += ' @babel/preset-env'
        }
        await installPackage(this.name, packages)

        // ---  modify webpack config
        const rules = {
            js: {rule: /\.jsx?$/, exts: ['js']},
            ts: {rule: /\.tsx?$/, exts: ['ts', 'js']},
            jsx: {rule: /\.jsx?$/, exts: ['jsx', 'js']},
            tsx: {rule: /\.tsx?$/, exts: ['tsx', 'ts', 'js']},
        }
        const webpackParams = {
            extRule: rules[indexExt].rule,
            extensions: rules[indexExt].exts.map(s => `'.${s}'`).join(', ')
        }
        const template = await loadTemplate('babelForWebpack.js', webpackParams)
        await WebPack.setPart(template)

        // --- babel.config.json
        const babelConfig = {
            presets: [isTypeScript ? '@babel/preset-typescript' : '@babel/preset-env'],
        }
        await fs.promises.writeFile(this.getConfigName(), JSON.stringify(babelConfig, null, '  '))


        // Обновить заготовку scr/index.*
        const templateName = `babelIndex.${CommonInfo.getExtension('logic')}`
        const indexFullName = makeSrcName(`index.${indexExt}`)
        const indexParams = {
            titleStr: CommonInfo.getTitleStr(),
        }
        wsSend('createEntityMsg', {name: this.name, message: `Update file ${indexFullName}`})
        await buildTemplate(templateName, indexFullName, indexParams)
    }

    getConfigName = () => makeFullName('babel.config.json')

    /**
     * Добавить новый пресет
     * Example:     await Babel.updatePreset('@babel/preset-react')
     * @param {string|Array} presetCode    Array example: ['@babel/preset-env',{modules: false}],
     * @return {Promise<void>}
     */
    async updatePreset(presetCode) {
        const srcConfigText = await fs.promises.readFile(this.getConfigName())
        const config = JSON.parse(srcConfigText.toString())
        updatePresetEx(config, presetCode)
        const dstConfigText = JSON.stringify(config, null, ' ')
        await fs.promises.writeFile(this.getConfigName(), dstConfigText)
    }
}

const updatePresetEx = (config, code) => {
    if (!config.presets) {
        config.presets = []
    }

    // Удалить дубликат раздела, если есть
    const getKey = (item) => Array.isArray(item) ? item[0] : item
    const key = getKey(code)
    config.presets = config.presets.filter(item => getKey(item) !== key)

    config.presets.push(code)
}

module.exports = { Babel, updatePresetEx }