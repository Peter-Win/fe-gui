const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('../commands/installPackage')
const {makeSrcName, isFileExists} = require('../fileUtils')
const {wsSend} = require('../wsServer')
const {buildTemplate} = require('../sysUtils/loadTemplate')
const { wsSendCreateEntity } = require('../wsSend')

const getReactHiVer = async () => {
    const ver = await CommonInfo.findPackageVersion('react')
    if (!ver) return 17
    return +ver.split('.')[0]
}

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
            CommonInfo.techVer.framework = await CommonInfo.findPackageVersion('react')
        }
    }

    /**
     * @param {Object} params
     * @param {number?} params.ver Can be 17
     */
    async create(params) {
        const {entities} = require('./all')

        const ver = typeof params.ver === 'number' ? `@~${params.ver}.0.0` : ''

        // dependencies
        const packages = `react${ver} react-dom${ver} react-hot-loader`
        await installPackage(this.name, packages, false)

        const {transpiler, language} = CommonInfo.tech
        if (transpiler === 'Babel') {
            await installPackage(this.name, '@babel/preset-react', true)
            const {Babel} = entities
            await Babel.updatePreset('@babel/preset-react')
        } else if (transpiler === 'TypeScript') {
            await installPackage(this.name, '@types/react @types/react-dom', true)
        } else if (transpiler === 'SWC') {
            await entities.SWC.updateConfig((configObject) => {
                const { jsc = {} } = configObject
                configObject.jsc = jsc
                const { parser = {} } = jsc
                jsc.parser = parser
                parser.tsx = true
                parser.jsx = true
            }, (msg, t) => wsSendCreateEntity(this.name, msg, t))
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

        const reactHiVer = await getReactHiVer()

        // Make new index
        const indexName = makeSrcName(`index.${ext}`)
        wsSend('createEntityMsg', {name: this.name, message: `Create ${indexName}`})
        await buildTemplate(reactHiVer <= 17 ? `reactIndex17.jsx` : 'reactIndex18.jsx', indexName)

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

module.exports = { React, getReactHiVer }