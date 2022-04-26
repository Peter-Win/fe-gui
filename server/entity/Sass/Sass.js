const {installPackage} = require('../../commands/installPackage')
const {wsSendCreateEntity} = require('../../wsSend')
const {sassWebpackRule} = require('./sassWebpackRule')
const {makeSrcName, isFileExists} = require('../../fileUtils')
const {readRows, writeRows} = require('../../sysUtils/textFile')
const { CommonInfo } = require('../../CommonInfo')
const {injectImport} = require('../../parser/injectImport')

const g_sassMainStyles = [
    { label: 'None', value: '' },
    { label: 'Sass', value: 'sass' },
    { label: 'SCSS', value: 'scss' },
]

class Sass {
    name = 'Sass'
    depends = ['WebPack']
    isInit = false
    isReady = false

    async init() {
        const { entities: {WebPack} } = require('../all')
        const { findRule } = require('../WebPack.utils')
        if (await isFileExists(WebPack.getConfigName())) {
            const wpConfig = await WebPack.loadConfigTaxon()
            const sassRule = findRule(wpConfig, '.sass')
            this.isInit = !!sassRule
        }
        this.isReady = !this.isInit
        if (this.isInit) {
            CommonInfo.tech.styleSass = true
            for (let style of ['sass', 'scss']) {
                if (await isFileExists(makeSrcName(`style.${style}`))) CommonInfo.tech.preferStyle = style
            }
        }
    }

    defaultParams = {
        mainStyle: 'scss', // "" | "sass" | "scss" see g_sassMainStyles
        useSourceMap: false,
    }

    async create(params) {
        const {entities: {WebPack, PackageJson}} = require('../all')

        // install dev dependencies
        await PackageJson.load()
        const packages = [
            'sass-loader', 'sass', 'style-loader', 'css-loader'
        ].filter(name => !PackageJson.isDevDependency(name))
        await installPackage(this.name, packages.join(' '))

        // add rule to webpack config
        await WebPack.setPart(
            sassWebpackRule(params),
            (msg, t) => wsSendCreateEntity(this.name, msg, t)
        )

        // create a main style file and import it from App.[tj]sx
        if (params.mainStyle) {
            const rows = params.mainStyle === 'sass' ? [
                'html, body',
                '  margin:  0',
                '  padding: 0',
            ] : [
                'html, body {',
                '  margin:  0;',
                '  padding: 0;',
                '}',
            ]
            const shortStyleName = `style.${params.mainStyle}`
            const fullStyleName = makeSrcName(shortStyleName)
            await writeRows(fullStyleName, rows)
            wsSendCreateEntity(this.name, `Created ${fullStyleName}`)

            const appName = makeSrcName(`App.${CommonInfo.getExtension('render')}`)
            if (await isFileExists(appName)) {
                const mfRows = await readRows(appName)
                injectImport(mfRows, `import "./${shortStyleName}";`)
                await writeRows(appName, mfRows)
                wsSendCreateEntity(this.name, `Updated ${appName}`)
            }
        }
        wsSendCreateEntity(this.name, 'To make it easier to include Sass/SCSS styles in your code, use "ReactComponent".', 'success')
    }

    description = `
<style>
.sass-header {display: flex; flex-direction: row;}
.sass-header > img {margin-right: 2em;}
.sass-block {margin: 2px; padding: .2em 1em; border: thin solid silver; border-radius:.4em; }
</style>
<div class="sass-header">
<img width="118px" alt="Sass logo" src="https://camo.githubusercontent.com/d9ac5c4a159b0548b3c25ee46ff5aa20f7c9fb348f74c2af1ed4e06e121325ff/68747470733a2f2f7261776769742e636f6d2f736173732f736173732d736974652f6d61737465722f736f757263652f6173736574732f696d672f6c6f676f732f6c6f676f2e737667" data-canonical-src="https://rawgit.com/sass/sass-site/master/source/assets/img/logos/logo.svg" style="max-width: 100%;">
<div>
<p><a href="https://sass-lang.com/" target="_blank">Sass overview</a></p>
<p><a href="https://github.com/sass/dart-sass" target="_blank">A Dart implementation of Sass.</a></p>
<p><a href="https://webpack.js.org/loaders/sass-loader/" target="_blank">Webpack sass-loader</a></p>
</div>
<script>var g_sassMainStyles=${JSON.stringify(g_sassMainStyles)};</script>
    `
    controls = `
<div class="sass-block">
  <h4>Use global style</h4>
  <div class="rn-ctrl" data-name="mainStyle" data-type="Radiobox" data-options="g_sassMainStyles"
    data-radio_tm="TmRadioItem"></div>
</div>
<div class="sass-block">
  <div class="rn-ctrl" data-name="useSourceMap" data-type="Checkbox" data-title="Use source map"></div>
</div>
    `
}
module.exports = {Sass}