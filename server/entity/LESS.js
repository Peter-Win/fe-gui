const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('../commands/installPackage')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName, isFileExists} = require('../fileUtils')
const {wsSendCreateEntity} = require('../wsSend')
const { injectStyleImport } = require('../sysUtils/injectStyleImport')

class LESS {
    name = 'LESS'
    depends = ['WebPack']
    isInit = false

    async init() {
        const {entities: {PackageJson}} = require('./all')
        this.isInit = PackageJson.isDevDependency('less-loader')
        if (this.isInit) {
            CommonInfo.tech.styleLess = true
            if (await isFileExists(makeSrcName('style.less'))) CommonInfo.tech.preferStyle = 'less'
        } else {
            const styler = CommonInfo.getPreferStyler()
            this.isReady = !styler || styler === 'CSS'
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
            await this.checkStyleLess((msg) => wsSendCreateEntity(this.name, msg))
        }
    }

    description = `
<style>
.less-hdr {
    display: flex;
    align-items: center;
    background: linear-gradient(to right, #1d365d, white);
    padding: .5em 1em;
}
.less-hdr > img {
    height: 50px;
    width: 113px;
    font-size: 50px;
    font-weight: bold;
    color: white;
}
.less-p {padding: 1em 0;}
</style>
<div class="less-hdr">
<img src="http://lesscss.org/public/img/less_logo.png" alt="LESS" />
</div>
<p class="less-p">Less (which stands for Leaner Style Sheets) is a backwards-compatible language extension for CSS.</p>
<p><a href="http://lesscss.org/" target="_blank">Official site</a></p>
`
    async checkStyleLess(log) {
        const shortName = 'style.less'
        const fullName = makeSrcName(shortName)
        const exists = await isFileExists(fullName)
        if (!exists) {
            await buildTemplate('style.less',fullName)
            if (log) log(`Created ${fullName}`)

            // Нужно внедрить импорт стиля в App.?sx
            await injectStyleImport({
                dstFileName: makeSrcName(`App.${CommonInfo.getExtension('render')}`),
                styleNameForImport: `./${shortName}`,
                log
            })
        }
        return { shortName, fullName }
    }
}
module.exports = {LESS}