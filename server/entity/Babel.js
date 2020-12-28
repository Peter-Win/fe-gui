"use strict"
/*
    Jest
    jest babel-jest

    package.json
      "jest": {
    "testPathIgnorePatterns": ["/node_modules/", "/fe-gui/"]

    .babelrc
    {
  "env": {
    "test": {
      "plugins": ["@babel/plugin-transform-modules-commonjs"]
    }
  }
}
  }

*/
const fs = require('fs')
const {installPackage} = require('../commands/installPackage')
const {wsSend} = require('../wsServer')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')
const {CommonInfo} = require('../CommonInfo')
const {makeSrcName, makeFullName} = require('../fileUtils')

class Babel {
    name = 'Babel'
    depends = ['WebPack']
    isInit = false

    async init() {
        const {entities: {PackageJson}} = require('./all')
        this.isInit = PackageJson.isDevDependency('@babel/core')
        if (this.isInit) {
            wsSend('statusMessage', {text: 'Babel detected'})
            CommonInfo.tech.transpiler = 'Babel'
            const isTS = PackageJson.isDevDependency('@babel/preset-typescript')
            CommonInfo.tech.language = isTS ? 'TypeScript' : 'JavaScript'
        }
    }

    async create() {
        const indexExt = CommonInfo.getExtension('render');
        const {entities} = require('../entity/all')
        const {WebPack} = entities
        const isTypeScript = CommonInfo.tech.language === 'TypeScript'
        // --- add packages
        let packages = 'babel-loader @babel/core'
        if (isTypeScript) {
            packages += ' @babel/preset-typescript'
        } else {
            packages += ' @babel/preset-env'
        }
        await installPackage(this.name, packages)

        // ---  modify webpack config
        const rules = {
            js: /\.js$/,
            ts: /\.ts$/,
            jsx: /\.jsx?$/,
            tsx: /\.tsx?$/,
        }
        const webpackParams = {
            extRule: rules[indexExt],
        }
        const template = await loadTemplate('babelForWebpack.js', webpackParams)
        await WebPack.setPart(template)

        // --- babel.config.json
        const babelConfig = {
            presets: [isTypeScript ? '@babel/preset-typescript' : '@babel/preset-env'],
        }
        const babelConfigName = makeFullName('babel.config.json')
        await fs.promises.writeFile(babelConfigName, JSON.stringify(babelConfig, null, '  '))


        // Обновить заготовку scr/index.*
        const templateName = `babelIndex.${indexExt}`
        const indexFullName = makeSrcName(`index.${indexExt}`)
        wsSend('createEntityMsg', {name: this.name, message: `Update file ${indexFullName}`})
        await buildTemplate(templateName, indexFullName)
    }
}

module.exports = { Babel }