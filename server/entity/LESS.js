const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('../commands/installPackage')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName} = require('../fileUtils')

class LESS {
    name = 'LESS'
    depends = ['WebPack']
    isInit = false

    async init() {
        const {PackageJson} = require('./all')
        this.isInit = PackageJson.isDevDependency('less-loader')
        if (this.isInit) {
            console.log('LESS styler detected')
            CommonInfo.tech.styleLess = true
        }
    }

    async create() {
        const {entities: {WebPack}} = require('./all')
        const packages = 'less style-loader css-loader less-loader'
        await installPackage(this.name, packages)

        // webpack
        const webpackInjection = await loadTemplate('lessForWebpack.js')
        await WebPack.setPart(webpackInjection)

        if (CommonInfo.getPreferStyler() === 'LESS') {
            await buildTemplate('style.less', makeSrcName('style.less'))
        }
    }
}
module.exports = {LESS}