/*
 * TypeScript transpiler (not language)
 * For example, TypeScript can also be supported by the Babel transpiler.
 */
const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {wsSend} = require('../wsServer')
const {wsSendCreateEntity} = require('../wsSend')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName, makeFullName, isFileExists} = require('../fileUtils')
const {installPackage} = require('../commands/installPackage')
const {findRule, isLoaderInRule} = require('./WebPack.utils')

class TypeScript {
    name = 'TypeScript'
    depends = ['WebPack']
    isInit = false

    async init() {
        const {entities} = require('../entity/all')
        const {PackageJson, WebPack} = entities
        // TypeScript is init if installed dev dependency 'typescript'
        this.isInit = PackageJson.isDevDependency('typescript')
        if (await isFileExists(WebPack.getConfigName())) {
            // But TypeScript can be not primary. For ex in case Babel+TS
            const tx = await WebPack.loadConfigTaxon()
            if (isLoaderInRule(findRule(tx, '.ts'), 'ts-loader')) {
                CommonInfo.tech.language = 'TypeScript'
                CommonInfo.tech.transpiler = 'TypeScript'
            }
        }
    }

    getConfigName() {
        return makeFullName('tsconfig.json')
    }

    /**
     * 
     * @param {Object} params
     * @param {boolean} params.isPrimary = true. Если false, то не включается в WebPack.
     */
    async create({isPrimary = true}) {
        const {entities} = require('../entity/all')
        const {WebPack} = entities
        // --- add packages
        const packages = ['typescript']
        if (isPrimary) packages.push('ts-loader')
        await installPackage(this.name, packages.join(' '))

        if (isPrimary) {
            wsSendCreateEntity(this.name, `Update ${WebPack.getConfigName()}`)
            await WebPack.setPart(await loadTemplate('tsForWebpack.js'))
        }

        // tsconfig.json
        if (!await isFileExists(this.getConfigName())) {
            wsSendCreateEntity(this.name, `Create ${this.getConfigName()}`)
            await buildTemplate('tsconfig.json', this.getConfigName())
        }

        // index.ts
        if (isPrimary) {
            const fullIndexName = makeSrcName('index.ts')
            wsSendCreateEntity(this.name, `Create ${fullIndexName}`)
            await buildTemplate('tsIndex.ts', fullIndexName)
        }
    }

    /**
     * 
     * @param {function(JSON):void} fnUpdate 
     * @param {function(string):void?} fnMessage 
     */
    async updateConfig(fnUpdate, fnMessage) {
        const fname = this.getConfigName()
        const options = {encoding: 'utf8'}
        const srcText = await fs.promises.readFile(fname, options)
        const data = JSON.parse(srcText)
        fnUpdate(data)
        const dstText = JSON.stringify(data, null, '  ')
        await fs.promises.writeFile(fname, dstText, options)
        if (fnMessage) fnMessage(`TypeScript config updated: ${fname}`)
    }
}

module.exports = {TypeScript}