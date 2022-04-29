// SWC (stands for Speedy Web Compiler) is a super-fast TypeScript / JavaScript compiler
// https://swc.rs/docs/getting-started
const fs = require('fs')
const { isFileExists, makeFullName } = require('../fileUtils')
const { CommonInfo } = require('../CommonInfo')

class SWC {
    name = 'SWC'
    depends = ['WebPack']
    isInit = false
    isReady = false

    async init() {
        const { findRule, isLoaderInRule } = require('./WebPack.utils')
        const {entities} = require('./all')
        const {WebPack} = entities
        if (await isFileExists(WebPack.getConfigName())) {
            const ext = `.${CommonInfo.getExtension('logic')}`
            const wpConfig = await WebPack.loadConfigTaxon()
            const rule = findRule(wpConfig, ext)
            if (rule && isLoaderInRule(rule, 'swc-loader')) {
                CommonInfo.tech.transpiler = this.name
                CommonInfo.techVer.transpiler = await CommonInfo.findPackageVersion('@swc/core')
                this.isInit = true
            }
        }
    }
    async create() {
        const {buildTemplate} = require('../sysUtils/loadTemplate')
        const {createTranspiler} = require('../sysUtils/createTranspiler')
        const {wsSendCreateEntity} = require('../wsSend')
        const isTypeScript = CommonInfo.tech.language === 'TypeScript'

        await createTranspiler(this.name, 'swc-loader', ['@swc/core'])

        const rcParams = {
            language: isTypeScript ? 'typescript' : 'ecmascript'
        }
        // В момент создания конфига tsx, jsx = false
        // А когда будет создаваться React, он сам поправит эти значения на true
        await buildTemplate('.swcrc', this.getConfigName(), rcParams)
        wsSendCreateEntity(this.name, `Created ${this.getConfigName()}`)
    }

    getConfigName() {
        return makeFullName('.swcrc')
    }

    /**
     * 
     * @param {function(configObject) => void} fnUpdate 
     * @param {function(msg, type) => void} fnLog 
     */
    async updateConfig(fnUpdate, fnLog) {
        const fileName = this.getConfigName()
        const srcText = await fs.promises.readFile(fileName, {encoding: 'utf-8'})
        const configObject = JSON.parse(srcText)
        fnUpdate(configObject)
        const dstText = JSON.stringify(configObject, null, '  ')
        await fs.promises.writeFile(fileName, dstText, {encoding: 'utf-8'})
        if (fnLog) fnLog(`Update ${fileName}`)
    }
}

module.exports = { SWC }