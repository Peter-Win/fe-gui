const fs = require('fs')
const {makeFullName} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')

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
            const fileContent = await fs.promises.readFile(this.makeFileName())
            const fileText = typeof fileContent === 'string' ? fileContent : fileContent.toString()
            this.data = JSON.parse(fileText)
            this.isInit = true
        } catch (e) {
        }
    }
    async create() {
        const {info} = CommonInfo
        this.data = {
            name: info.name,
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
    async save() {
        const text = JSON.stringify(this.data, null, '  ')
        await fs.promises.writeFile(this.makeFileName(), text);
    }

    addScript(name, code) {
        this.data.scripts[name] = code
    }
}

module.exports = {PackageJson}