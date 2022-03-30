const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('../commands/installPackage')
const {makeSrcName, isFileExists} = require('../fileUtils')
const {wsSend} = require('../wsServer')
const {buildTemplate} = require('../sysUtils/loadTemplate')

class React {
    name = 'React'
    depends = ['WebPack']
    isInit = false

    async init() {
        this.isInit = false
        const {entities} = require('./all')
        const {PackageJson} = entities
        this.isInit = PackageJson.isDependency('react')
        if (this.isInit) {
            CommonInfo.tech.framework = 'React'
        }
    }
    async create() {
        const {entities} = require('./all')

        // dependencies
        const packages = 'react@~17.0.0 react-dom@~17.0.0 react-hot-loader'
        await installPackage(this.name, packages, false)

        const {transpiler, language} = CommonInfo.tech
        if (transpiler === 'Babel') {
            await installPackage(this.name, '@babel/preset-react', true)
            const {Babel} = entities
            await Babel.updatePreset('@babel/preset-react')
        } else if (transpiler === 'TypeScript') {
            await installPackage(this.name, '@types/react @types/react-dom', true)
        }
        if (language === 'JavaScript') {
            await installPackage(this.name, 'prop-types', false)
        }

        const ext = CommonInfo.getExtension('render')
        // Kill old indices
        const deleteIndex = async (name) => {
            const oldIndexName = makeSrcName(name)
            if (await isFileExists(oldIndexName)) {
                wsSend('createEntityMsg', {name: this.name, message: `Delete ${oldIndexName}`, type: 'warn'})
                await fs.promises.unlink(oldIndexName)
            }
        }
        await deleteIndex('index.js')
        await deleteIndex('index.ts')

        // Make new index
        const indexName = makeSrcName(`index.${ext}`)
        wsSend('createEntityMsg', {name: this.name, message: `Create ${indexName}`})
        await buildTemplate(`reactIndex.jsx`, indexName)

        // Make App component
        const appName = makeSrcName(`App.${ext}`)
        const mainFrameName = makeSrcName(`MainFrame.${ext}`)
        wsSend('createEntityMsg', {name: this.name, message: `Create ${appName}`})
        let techDescr = CommonInfo.tech.transpiler
        if (techDescr !== 'TypeScript') {
            techDescr += ` + ${CommonInfo.tech.language}`
        }
        const styler = CommonInfo.getPreferStyler()
        let importStyle = ''
        if (styler === 'CSS' || styler === 'LESS') {
            importStyle = `import './style.${styler.toLowerCase()}';\n`
        }
        const {title} = CommonInfo.extParams
        const tmParams = {techDescr, importStyle, title}

        await buildTemplate(`reactApp.${ext}`, appName, tmParams)
        await buildTemplate(`stdMainFrame.${ext}`, mainFrameName, tmParams)
    }
}

module.exports = {React}