/*
 * TypeScript transpiler (not language)
 * For example, TypeScript can also be supported by the Babel transpiler.
 */
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

    async create() {
        // const indexExt = CommonInfo.getExtension('render');
        const {entities} = require('../entity/all')
        const {WebPack} = entities
        // --- add packages
        await installPackage(this.name, 'typescript ts-loader')

        WebPack.setPart(await loadTemplate('tsForWebpack.js'))

        // tsconfig.json
        await buildTemplate('tsconfig.json', makeFullName('tsconfig.json'))

        // index.ts
        const fullIndexName = makeSrcName('index.ts')
        wsSend('createEntityMsg', {name: this.name, message: `Create ${fullIndexName}`})
        await buildTemplate('tsIndex.ts', fullIndexName)
    }
}

module.exports = {TypeScript}