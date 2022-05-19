const {CommonInfo} = require('../../CommonInfo')
const {makeSrcName} = require('../../fileUtils')
const { installPackageSmart } = require('../../commands/installPackage')

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
        const { wsSendCreateEntity } = require('../../wsSend')
        const { buildTemplate } = require('../../sysUtils/loadTemplate')
        const { updateWebpack } = require('./updateWebpack')
        const { createEntity } = require('../../commands/createEntity')

        const { entities } = require('../all')
        const { WebPack, TypeScript, CSS } = entities
        const log = (msg, t) => wsSendCreateEntity(this.name, msg, t)
        const isTS = CommonInfo.tech.transpiler === 'TypeScript'

        if (!CSS.isInit) {
            await createEntity(entities, CSS.name, {})
        }

        await installPackageSmart(this.name, [vuePkName], false)
        await installPackageSmart(this.name, ['vue-loader', 'vue-template-compiler', 'vue-style-loader'])
        
        // webpack.config:
        await updateWebpack({ WebPack, isTS })
        log(`Updated ${WebPack.getConfigName()}`)

        if (isTS) {
            await this.installTS(TypeScript, log, this.name)
        }

        const indexName = makeSrcName(`index.${CommonInfo.getExtension('logic')}`)
        await buildTemplate('vueIndex.js', indexName)
        log(`Created ${indexName}`)

        let techDescr = CommonInfo.tech.transpiler
        if (techDescr !== 'TypeScript') {
            techDescr += ` + ${CommonInfo.tech.language}`
        }
        const {title} = CommonInfo.extParams
        const lang = CommonInfo.tech.language === 'TypeScript' ? 'ts' : 'js'
        const tmParams = {techDescr, title, lang}

        const appName = makeSrcName(`App.vue`)
        await buildTemplate('App.vue', appName, tmParams)
        log(`Created ${appName}`)
    }

    /**
     * Install TypeScript
     * @param {TypeScript} TypeScript
     * @param {(msg: string, t?: string) => void} log 
     */
    async installTS(TypeScript, log, name) {
        const { updateDeclaration, updateDeclarationInTsConfig } = require('../../sysUtils/updateDeclaration')
        await installPackageSmart(name, ['@vue/tsconfig'])
        await updateDeclaration(['vue'], log)
        await TypeScript.updateConfig((config) => {
            config.extends = "@vue/tsconfig/tsconfig.web.json"
            if (config.compilerOptions) {
                // to prevent TS5095: Option 'preserveValueImports' can only be used when 'module' is set to 'es2015' or later.
                delete config.compilerOptions.module
                // clear target, because it inherited from @vue/tsconfig
                delete config.compilerOptions.target
            }
            updateDeclarationInTsConfig(config)
        }, log)
    }
}

module.exports = { Vue }