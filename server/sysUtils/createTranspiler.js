const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('../commands/installPackage')
const {wsSendCreateEntity} = require('../wsSend')
const {makeSrcName} = require('../fileUtils')
const {loadTemplate, buildTemplate} = require('../sysUtils/loadTemplate')

/**
 * Common part for transpiler creation:
 * - install dependensies
 * - set webpack rules
 * - create index file
 * @param {string} name Name of agent
 * @param {string} loader f.e. 'babel-loader'
 * @param {string[]} packages 
 */
const createTranspiler = async (name, loader, packages) => {
    const indexExt = CommonInfo.getExtension('render');
    const shortExt = CommonInfo.getExtension('logic');

    const {entities} = require('../entity/all')
    const {WebPack} = entities

    // dev dependecies
    const packagesList = [loader, ...packages].join(' ')
    await installPackage(name, packagesList)

    // ---  modify webpack config
    const rules = {
        js: {rule: /\.jsx?$/, exts: ['js']},
        ts: {rule: /\.tsx?$/, exts: ['ts', 'js']},
        jsx: {rule: /\.jsx?$/, exts: ['jsx', 'js']},
        tsx: {rule: /\.tsx?$/, exts: ['tsx', 'ts', 'js']},
    }
    const webpackParams = {
        extRule: rules[indexExt].rule,
        extensions: rules[indexExt].exts.map(s => `'.${s}'`).join(', '),
        loader,
    }
    const template = await loadTemplate('webpackTranspilerRule.js', webpackParams)
    await WebPack.setPart(template)
    wsSendCreateEntity(name, `Updated ${WebPack.getConfigName()}`)

    // Обновить заготовку scr/index.*
    const templateName = `pureIndex.${shortExt}`
    const indexFullName = makeSrcName(`index.${indexExt}`)
    const indexParams = {
        titleStr: CommonInfo.getTitleStr(),
        transpiler: name,
    }
    await buildTemplate(templateName, indexFullName, indexParams)
    wsSendCreateEntity(name, `Updated ${indexFullName}`)
}

module.exports = {createTranspiler}