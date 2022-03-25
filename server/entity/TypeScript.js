/*
 * TypeScript transpiler (not language)
 * For example, TypeScript can also be supported by the Babel transpiler.
 */
const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {wsSend} = require('../wsServer')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName, makeFullName} = require('../fileUtils')
const {installPackage} = require('../commands/installPackage')

class TypeScript {
    name = 'TypeScript'
    depends = ['WebPack']
    isInit = false

    async init() {
        const {entities} = require('../entity/all')
        const {PackageJson} = entities
        this.isInit = PackageJson.isDevDependency('typescript')
        if (this.isInit) {
            CommonInfo.tech.language = 'TypeScript'
            CommonInfo.tech.transpiler = 'TypeScript'
        }
    }

    getConfigName() {
        return makeFullName('tsconfig.json')
    }

    async create() {
        // const indexExt = CommonInfo.getExtension('render');
        const {entities} = require('../entity/all')
        const {WebPack} = entities
        // --- add packages
        await installPackage(this.name, 'typescript ts-loader')

        WebPack.setPart(await loadTemplate('tsForWebpack.js'))

        // tsconfig.json
        await buildTemplate('tsconfig.json', this.getConfigName())

        // index.ts
        const fullIndexName = makeSrcName('index.ts')
        wsSend('createEntityMsg', {name: this.name, message: `Create ${fullIndexName}`})
        await buildTemplate('tsIndex.ts', fullIndexName)
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