const fs = require('fs')
const {makeFullName} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')
const {wsSend} = require('../wsServer')

class PackageJson {
    name = 'PackageJson'
    depends = []
    isInit = false
    data = {}
    makeFileName() {
        return makeFullName('package.json')
    }
    async init() {
        this.isInit = false
        try {
            await this.load()
            this.isInit = true
        } catch (e) {
            wsSend('statusMessage', {text: 'package.json not detected', type: 'err'})
        }
    }
    async create() {
        const {info} = CommonInfo
        this.data = {
            name: info.name,
            private: 'private' in info ? info.private : true,
            version: '1.0.0',
            description: info.description,
            main: `src/index.${CommonInfo.getExtension('render')}`,
            keywords: [],
            author: info.author,
            license: info.license,
            scripts: {},
            dependencies: {},
            devDependencies: {},
        }
        try {
            await this.save()
        } catch(e) {
            throw e
        }
    }
    async load() {
        const content = await fs.promises.readFile(this.makeFileName())
        this.data = JSON.parse(content)
    }
    async save() {
        const text = JSON.stringify(this.data, null, '  ')
        await fs.promises.writeFile(this.makeFileName(), text);
    }

    /**
     * Выполнить обновление файла package.json
     * Внутри коллбэка можно вызывать функции типа addScript или напрямую работать с data
     * @param {function(entity:PackageJson):Promise<void>} callback
     * @return {Promise<void>}
     * usage example:
           await entities.PackageJson.update(async (ent) => {
                ent.addScript('build', 'webpack --mode=production')
           })
     */
    async update(callback) {
        await this.load()
        await callback(this)
        await this.save()
    }

    addScript(name, code) {
        this.data.scripts[name] = code
    }

    isDevDependency(name) {
        return name in (this.data.devDependencies || {})
    }
}

module.exports = {PackageJson}