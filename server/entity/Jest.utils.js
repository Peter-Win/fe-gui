const fs = require('fs')
const {Style} = require('../parser/Style')
const {parseModule} = require('../parser/parseExpression')
const {ReaderCtx} = require('../parser/ReaderCtx')
const {formatChunks} = require('../parser/WriterCtx')
const { makeFullName } = require('../fileUtils')
const { findConfigRoot, findObjectItem } = require('./WebPack.utils')
const { TxObject } = require('../parser/taxons/TxObject')
const { TxConst } = require('../parser/taxons/TxConst')

/**
 * Установить значение в блок transform
 * @param {Object} params
 * @param {Taxon} params.moduleTaxon
 * @param {string} params.transpiler
 * @param {string} params.key
 * @param {string} params.value
 * @param {Style} params.style
 */
const setJestTransform = ({moduleTaxon, transpiler, key, value, style}) => {
    const rootTaxon = findConfigRoot(moduleTaxon)
    let txTransform = findObjectItem(rootTaxon, 'transform')
    if (!txTransform) {
        txTransform = new TxObject()
        rootTaxon.addObjectItem('transform', txTransform, style)
        // "\\.[jt]sx?$": "babel-jest" - default value of transform
        if (transpiler === 'Babel')
            txTransform.addObjectItem("\\.[jt]sx?$", TxConst.create("string", style.string('babel-jest')))
    }
    const txValue = TxConst.create('string', style.string(value))
    txTransform.changeObjectItem(key, key, txValue, style)
}

/**
 * Внести изменения в конфиг Jest
 * @param {function(Taxon, Style)} fnUpdate 
 * @param {function(string, string)} fnMessage 
 * @returns {Promise<void>}
 */
const updateJestConfig = async (fnUpdate, fnMessage) => {
    const style = new Style()
    style.singleQuote = false
    const configName = makeFullName('jest.config.js')
    const configSource = await fs.promises.readFile(configName, {encoding: 'utf8'})
    const sourceNode = parseModule(ReaderCtx.fromText(configSource))
    const moduleTaxon = sourceNode.createTaxon()

    fnUpdate(moduleTaxon, style)

    const chunks = []
    moduleTaxon.exportChunks(chunks, style)
    const text = formatChunks(chunks, style)
    await fs.promises.writeFile(configName, text, {encoding: 'utf8'})
    if (fnMessage) fnMessage(`Jest config updated: ${configName}`)
}

module.exports = {updateJestConfig, setJestTransform}