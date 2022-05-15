const {CommonInfo} = require('../../CommonInfo')
const {makeSrcName} = require('../../fileUtils')

const vuePkName = 'vue'

class Vue {
    name = 'Vue'
    depends = ['WebPack']
    isInit = false
    isReady = false

    async init() {
        const { entities } = require('../all')
        const { PackageJson } = entities
        this.isInit = PackageJson.isDependency(vuePkName)
        if (this.isInit) {
            CommonInfo.tech.framework = this.name
            CommonInfo.techVer.framework = await CommonInfo.findPackageVersion(vuePkName)
        }
    }

    async create() {
        const { installPackageSmart } = require('../../commands/installPackage')
        const { wsSendCreateEntity } = require('../../wsSend')
        const { buildTemplate } = require('../../sysUtils/loadTemplate')
        const { updateDeclaration, updateDeclarationInTsConfig } = require('../../sysUtils/updateDeclaration')
        const { updateWebpack } = require('./updateWebpack')
        const { createEntity } = require('../../commands/createEntity')

        const { entities } = require('../all')
        const { WebPack, TypeScript, CSS } = entities
        const isTS = CommonInfo.tech.transpiler === 'TypeScript'
        const log = (msg, t) => wsSendCreateEntity(this.name, msg, t)

        if (!CSS.isInit) {
            await createEntity(entities, CSS.name, {})
        }

        await installPackageSmart(this.name, [vuePkName], false)
        await installPackageSmart(this.name, ['vue-loader', 'vue-template-compiler', 'vue-style-loader'])
        if (isTS) await installPackageSmart(this.name, ['@vue/tsconfig'])
        
        // webpack.config:
        await updateWebpack({ WebPack, isTS })
        log(`Updated ${WebPack.getConfigName()}`)

        if (isTS) {
            await updateDeclaration(['vue'], log)
            await TypeScript.updateConfig((config) => {
                config.extends = "@vue/tsconfig/tsconfig.web.json"
                if (config.compilerOptions) {
                    // to prevent TS5095: Option 'preserveValueImports' can only be used when 'module' is set to 'es2015' or later.
                    delete config.compilerOptions.module
                }
                updateDeclarationInTsConfig(config)
            }, log)
        }

        const indexName = makeSrcName(`index.${CommonInfo.getExtension('logic')}`)
        await buildTemplate('vueIndex.js', indexName)
        log(`Created ${indexName}`)

        let techDescr = CommonInfo.tech.transpiler
        if (techDescr !== 'TypeScript') {
            techDescr += ` + ${CommonInfo.tech.language}`
        }
        const {title} = CommonInfo.extParams
        const tmParams = {techDescr, title}

        const appName = makeSrcName(`App.vue`)
        await buildTemplate('App.vue', appName, tmParams)
        log(`Created ${appName}`)
    }
}

module.exports = { Vue }