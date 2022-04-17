const {createTaxonByType} = require('../parser/taxons/all')
const { parseExpression } = require('../parser/parseExpression')
const { ReaderCtx } = require('../parser/ReaderCtx')
const {findObjectItem} = require('../entity/WebPack.utils')

/**
 * Подключение ReactRouter требует подключения @hot-loader/react-dom
 * Потому что hot loader оборачивает компоненты в прокси-обертки
 * а компонент Routes проверяет типы подчиненных компонентов.
 * Если не использовать @hot-loader/react-dom то рендер падает в run-time
 * После выхода React v18 изменилась функция рендера, а @hot-loader/react-dom до сих пор только v17
 * Для патча нужно использовать конфиг вебпака с условием:
 * alias['react-dom'] = '@hot-loader/react-dom' только для mode === 'development'
 * 
 * @param {WebPack} WebPack 
 */
const conditionalReactDomAlias = async (WebPack) => {
    const wpConfig = await WebPack.loadConfigTaxon()
    let msg = null
    try {
        msg = changeWebPackConfig(wpConfig, WebPack.getStyle())
    } catch (e) {
        msg = e.message
    }
    if (msg) {
        throw new Error(`Can't change webpack.config.js: ${e.message}`)
    }
    await WebPack.saveConfigTaxon(wpConfig)
}

/**
 * @param {Taxon} wpConfig 
 * @returns {string|undefined} Error message 
 */
const changeWebPackConfig = (wpConfig, style) => {
    const pos = wpConfig.subTaxons.findIndex(cmd =>
        cmd.type === 'TxBinOp' && cmd.opcode === '=' 
        && cmd.left.type === 'TxBinOp' && cmd.left.opcode === '.'
        && cmd.left.left.name === 'module' && cmd.left.right.field === 'exports'
    )
    if (pos < 0) return `'module.exports' not found`
    const txModuleExports = wpConfig.subTaxons[pos]
    const configObject = txModuleExports.right
    if (configObject.type !== 'TxObject') return `Unsupported structure`
    configObject.remove()

    // const config = {...}
    const configName = createTaxonByType('TxName')
    configName.name = 'config'
    const configAssign = createTaxonByType('TxBinOp')
    configAssign.initCustom('=', configName, configObject)
    const configDecl = createTaxonByType('TxVarDecl')
    configDecl.initCustom('const', configAssign)
    wpConfig.addTaxon(configDecl, pos)

    // Новое выражение для экспорта в виде функции
    const srcFun = `(env, argv) => {
        if (argv.mode === 'development') {
          config.resolve.alias['react-dom'] = '@hot-loader/react-dom';
        }
        return config;
      }`
    const newExportExpr = parseExpression(ReaderCtx.fromText(srcFun)).createTaxon()
    txModuleExports.setRight(newExportExpr)

    // Нужно гарантировать наличие раздела config.resolve.alias
    let txResolve = findObjectItem(configObject, 'resolve')
    if (!txResolve) {
        txResolve = createTaxonByType('TxObject')
        configObject.addObjectItem('resolve', txResolve, style)
    }
    let txAlias = findObjectItem(txResolve, 'alias')
    if (!txAlias) {
        txAlias = createTaxonByType('TxObject')
        txResolve.addObjectItem('alias', txAlias, style)
    }

    // Нужно удалить раздел config.resolve.alias['react-dom'], если он есть
    txAlias.deleteItem('react-dom')
}

module.exports = { conditionalReactDomAlias, changeWebPackConfig }