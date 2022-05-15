const { readRows } = require('../../sysUtils/textFile')
const { parseExpression, parseModule } = require('../../parser/parseExpression')
const { ReaderCtx } = require('../../parser/ReaderCtx')
const { injectImport } = require('../../parser/injectImport')
const { findConfigRoot, accessObjectItem, findRule } = require('../WebPack.utils')
const { makeTaxonFromData } = require('../../parser/makeTaxonFromData')
const { TxConst } = require('../../parser/taxons/TxConst')

const updateWebpackPure = (rows, style, isTS) => {
    const importCmd = `const { VueLoaderPlugin } = require(${style.string('vue-loader')});`
    injectImport(rows, importCmd)
    const sourceNode = parseModule(ReaderCtx.fromText(rows.join('\n')))
    const wpConfig = sourceNode.createTaxon()
    const txRoot = findConfigRoot(wpConfig)
    const txModule = accessObjectItem(txRoot, 'module', style)
    const txRules = accessObjectItem(txModule, 'rules', style, 'TxArray')
    txRules.addTaxon(makeTaxonFromData({ test: /\.vue$/, loader: 'vue-loader'}, style))

    // Возможно, это лучше делать при создании CSS
    const cssRule = findRule(wpConfig, '.css')
    if (cssRule) {
        const txUse = cssRule.dict.use
        if (txUse && txUse.type === 'TxArray') {
            const txLoader = txUse.subTaxons[0]
            if (txLoader && txLoader.type === 'TxConst' && txLoader.constType === 'string') {
                txLoader.constValue = style.string('vue-style-loader')
            }
        }
    }
    // plugins
    const txPlugins = accessObjectItem(txRoot, 'plugins', style, 'TxArray')
    txPlugins.addTaxon(parseExpression(ReaderCtx.fromText('new VueLoaderPlugin()')).createTaxon())

    // appendTsSuffixTo - option of ts-loader.
    // see https://www.npmjs.com/package/ts-loader#appendtsxsuffixto
    if (isTS) {
        const tsRule = findRule(wpConfig, '.ts')
        if (tsRule) {
            const txOptions = accessObjectItem(tsRule, 'options', style)
            const suffixes = accessObjectItem(txOptions, 'appendTsSuffixTo', style, 'TxArray')
            suffixes.addTaxon(TxConst.create('regexp', /\.vue$/))
        }
    }
    return wpConfig
}

const updateWebpack = async ({WebPack, isTS}) => {
    const style = WebPack.getStyle()
    const wpConfigName = WebPack.getConfigName()
    const rows = await readRows(wpConfigName)
    const wpConfig = updateWebpackPure(rows, style, isTS)
    await WebPack.saveConfigTaxon(wpConfig)

}

module.exports = { updateWebpack, updateWebpackPure }