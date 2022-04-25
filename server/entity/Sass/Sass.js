const {installPackage} = require('../../commands/installPackage')
const {wsSendCreateEntity} = require('../../wsSend')
const {sassWebpackRule} = require('./sassWebpackRule')

class Sass {
    name = 'Sass'
    depends = ['WebPack']
    isInit = false
    isReady = false

    async init() {
        const { entities: {WebPack} } = require('../all')
        const { findRule } = require('../WebPack.utils')
        const wpConfig = await WebPack.loadConfigTaxon()
        const sassRule = findRule(wpConfig, '.sass')
        this.isInit = !!sassRule
        this.isReady = !this.isInit
    }

    defaultParams = {
        useSourceMap: false,
    }

    async create(params) {
        const {entities: {WebPack, PackageJson}} = require('../all')

        await PackageJson.load()
        const packages = [
            'sass-loader', 'sass', 'style-loader', 'css-loader'
        ].filter(name => !PackageJson.isDevDependency(name))
        await installPackage(this.name, packages.join(' '))

        await WebPack.setPart(
            sassWebpackRule(params),
            (msg, t) => wsSendCreateEntity(this.name, msg, t)
        )
    }

    description = `
<style>
.sass-header {display: flex; flex-direction: row;}
.sass-header > img {margin-right: 2em;}
</style>
<div class="sass-header">
<img width="118px" alt="Sass logo" src="https://camo.githubusercontent.com/d9ac5c4a159b0548b3c25ee46ff5aa20f7c9fb348f74c2af1ed4e06e121325ff/68747470733a2f2f7261776769742e636f6d2f736173732f736173732d736974652f6d61737465722f736f757263652f6173736574732f696d672f6c6f676f732f6c6f676f2e737667" data-canonical-src="https://rawgit.com/sass/sass-site/master/source/assets/img/logos/logo.svg" style="max-width: 100%;">
<div>
<p><a href="https://sass-lang.com/" target="_blank">Sass overview</a></p>
<p><a href="https://github.com/sass/dart-sass" target="_blank">A Dart implementation of Sass.</a></p>
<p><a href="https://webpack.js.org/loaders/sass-loader/" target="_blank">Webpack sass-loader</a></p>
</div>
    `
    controls = `
<div class="rn-ctrl" data-name="useSourceMap" data-type="Checkbox" data-title="Use source map"></div>
    `
}
module.exports = {Sass}