const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('../commands/installPackage')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName} = require('../fileUtils')

class CSS {
    name = 'CSS'
    depends = ['WebPack']
    isInit = false
    isReady = false

    async init() {
        const {entities: {WebPack}} = require('./all')
        const {findRule, isLoaderInRule} = require('./WebPack.utils')
        this.isReady = false
        this.isInit = false
        if (WebPack.isInit) {
            const wpConfig = await WebPack.loadConfigTaxon()
            const rule = findRule(wpConfig, '.css')
            this.isInit = isLoaderInRule(rule, 'css-loader')
        }
        if (this.isInit) {
            CommonInfo.tech.styleCss = true
            if (!CommonInfo.tech.preferStyle) {
                CommonInfo.tech.preferStyle = 'css'
            }
       } else {
           this.isReady = true
       }
    }

    async create() {
        const {entities: {WebPack, CssModules}} = require('./all')
        const packages = 'style-loader css-loader'
        await installPackage(this.name, packages)

        // webpack
        const webpackInjection = await loadTemplate('cssForWebpack.js')
        await WebPack.setPart(webpackInjection)

        if (CommonInfo.getPreferStyler() === 'CSS') {
            await buildTemplate('style.css', makeSrcName('style.css'))
        }

        this.isInit = true
        await CssModules.init()
    }

    description = `<h2>Support of CSS files as part of bundle</h2>
    <div><a href="https://webpack.js.org/loaders/css-loader/" target="_blank">css-loader</a></div>
    <div><a href="https://webpack.js.org/loaders/style-loader/" target="_blank">style-loader</a></div>
    `
}
module.exports = {CSS}