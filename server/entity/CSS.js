const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('../commands/installPackage')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName} = require('../fileUtils')

class CSS {
    name = 'CSS'
    depends = ['WebPack']
    isInit = false

    async init() {
        const {entities: {PackageJson}} = require('./all')
        this.isInit = PackageJson.isDevDependency('css-loader')
        if (this.isInit) {
            console.log('CSS styler detected')
            CommonInfo.tech.styleCss = true
        }
    }

    async create() {
        const {entities: {WebPack}} = require('./all')
        const packages = 'style-loader css-loader'
        await installPackage(this.name, packages)

        // webpack
        const webpackInjection = await loadTemplate('cssForWebpack.js')
        await WebPack.setPart(webpackInjection)

        if (CommonInfo.getPreferStyler() === 'CSS') {
            await buildTemplate('style.css', makeSrcName('style.css'))
        }
    }
}
module.exports = {CSS}