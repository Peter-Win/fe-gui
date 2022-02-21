const fs = require('fs')
const { makeTaxonFromData } = require('../../parser/makeTaxonFromData')
const { findConfigRoot, findPath, makeRuleRegexp } = require('../WebPack.utils')
const { parseModule } = require('../../parser/parseExpression')
const { ReaderCtx } = require('../../parser/ReaderCtx')
const { Style } = require('../../parser/Style')

/**
 * Проверить наличие правил Asset Modules в конфиге вебпака
 * @param {string} wpConfigText 
 * @returns {boolean}
 */
const isAssetModulesRules = (wpConfigText) => {
    const node = parseModule(ReaderCtx.fromText(wpConfigText))
    const moduleTaxon = node.createTaxon()
    const root = findConfigRoot(moduleTaxon)
    const rules = findPath(root, 'module.rules')
    const success = rules.subTaxons.find(rule => {
        const {type} = rule.dict
        if (!type) return false
        return /^[\'\"]asset(\/[a-z]+)*[\'\"]$/.test(type.constValue)
    })
    return !!success
}

/**
 * 
 * @param {"default" | "resource" | "inline"} srcType 
 * @returns 
 */
const cvtType = (srcType) => {
    switch (srcType) {
        case 'default':
            return 'asset'
        default:
            return `asset/${srcType}`
    }
}

/**
 * @param {string} extList 
 * @returns {Array<string>}
 */
const splitExtList = (extList) => {
    return extList.replace(/,/g, ' ').split(' ').filter(ext => !!ext)
}

/**
 * @param {Object} params
 * @param {Array<{extList: string; type: string; filename: string;}>} params.rules 
 * @returns {Array<{rule: {test: RegExp; type: string; generator?: Object; parser?: Object; }; header?: string}>}
 */
const buildAssetRules = ({rules}) => {
    return rules.map(({ extList, type, filename }) => {
        const list = splitExtList(extList)
        const rule = {
            test: makeRuleRegexp(list),
            type: cvtType(type),
        }
        if (filename) {
            rule.generator = { filename }
        }
        return { rule }
    })
}


/**
 * 
 * @param {Array<{rule: {test: RegExp; type: string; generator?: Object; parser?: Object; }; header?: string}>} insertedRules 
 * @param {Taxon} wpConfigTaxon IN/OUT
 */
const mergeRulesIntoConfig = (insertedRules, wpConfigTaxon, style) => {
    const rootTaxon = findConfigRoot(wpConfigTaxon)
    const rulesTaxon = findPath(rootTaxon, 'module.rules')
    insertedRules.forEach(item => {
        const {rule} = item
        rulesTaxon.addTaxon(makeTaxonFromData(rule, style))
    })
}

/**
 * 
 * @param {Object} params
 * @param {Array<{extList: string; type: string; filename: string;}>} params.rules
 * @param {string} params.assetModuleFilename
 * @param {Taxon} wpConfigTaxon IN/OUT
 */
const mergeAssetModulesIntoConfig = (params, wpConfigTaxon) => {
    // Перевести параметры, полученные от клиентской части, в структуру, которая соответствует правилам webpack.config.js
    const rules = buildAssetRules(params)

    const style = new Style()
    style.singleQuote = true
    // Внедрить правила в раздел конфига molule.rules
    mergeRulesIntoConfig(rules, wpConfigTaxon, style)

    // Общее имя выходных файлов ресурсов, которое указывается в разделе output
    if (params.assetModuleFilename) {
        const rootTaxon = findConfigRoot(wpConfigTaxon)
        const outputTaxon = findPath(rootTaxon, 'output')
        outputTaxon.addObjectItem('assetModuleFilename', makeTaxonFromData(params.assetModuleFilename, style))
    }
}

/**
 * Собрать список всех расширений
 * @param {Array<{extList:string}>} rules
 * @returns {Array<string>}
 */
const buildFullExtList = (rules) => {
    const allExts = new Set()
    rules.forEach((rule) => {
        splitExtList(rule.extList).forEach(ext => allExts.add(ext))
    })
    return Array.from(allExts)
}

module.exports = { buildAssetRules, mergeRulesIntoConfig, isAssetModulesRules, mergeAssetModulesIntoConfig, buildFullExtList }