"use strict"
const fs = require('fs')
const {installPackage} = require('../commands/installPackage')
const {wsSend} = require('../wsServer')
const {wsSendCreateEntity} = require('../wsSend')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {CommonInfo} = require('../CommonInfo')
const {makeSrcName, makeFullName, isFileExists} = require('../fileUtils')
const {findRule, isLoaderInRule} = require('./WebPack.utils')

class Babel {
    name = 'Babel'
    depends = ['WebPack']
    isInit = false

    async init() {
        const {entities: {PackageJson, WebPack}} = require('./all')
        // @babel/core может быть установлено автоматически при установке Storybook
        // При этом, основным транспилером может оставаться например TyprScript
        this.isInit = PackageJson.isDevDependency('@babel/core')

        // Используемый транспилер вычисляется по правилам для ts и js
        const isWpConfig = await isFileExists(WebPack.getConfigName())
        if (isWpConfig) {
            const tx = await WebPack.loadConfigTaxon()
            if (
                isLoaderInRule(findRule(tx, '.ts'), 'babel-loader') ||
                isLoaderInRule(findRule(tx, '.js'), 'babel-loader')
            ) {
                CommonInfo.tech.transpiler = 'Babel'
                CommonInfo.techVer.transpiler = await CommonInfo.findPackageVersion('@babel/core')
            }
        }
    }

    async create() {
        const isTypeScript = CommonInfo.tech.language === 'TypeScript'
        const {createTranspiler} = require('../sysUtils/createTranspiler')
        const preset = isTypeScript ? '@babel/preset-typescript' : '@babel/preset-env'
        await createTranspiler(this.name, 'babel-loader', ['@babel/core', preset])

        // --- babel.config.json
        const babelConfig = {
            presets: [preset],
        }
        await fs.promises.writeFile(this.getConfigName(), JSON.stringify(babelConfig, null, '  '))
        wsSendCreateEntity(this.name, `Created ${this.getConfigName()}`)
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