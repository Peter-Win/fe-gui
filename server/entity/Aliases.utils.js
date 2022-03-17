const fs = require('fs')
const {findConfigRoot, findObjectItem} = require('./WebPack.utils')
const {Style} = require('../parser/Style')
const {ReaderCtx} = require('../parser/ReaderCtx')
const {wsSendCreateEntity} = require('../wsSend')
const {TxObject} = require('../parser/taxons/TxObject')
const {parseExpression} = require('../parser/parseExpression')
const {CommonInfo} = require('../CommonInfo')
const {fromQuoted} = require('../parser/stringUtils')

/**
 * Здесь собраны знания об особенностях работы ряда других агентов.
 * Это не правильно с точки зрения архитектуры,
 * т.к. изменения в других агентах могут сломать работу этого агента.
 * Но для правильного решения нужно реализовать механизм, сходный с моделью информационной доски,
 * который описан в главе 11 у Гради Буча в книге по объектно-ориентированному анализу и проектированию.
 * 
 * ReactRouter реализует пару 'react-dom': '@hot-loader/react-dom'
 */

const getValue = (txConst) => fromQuoted(txConst.constValue)

/**
 * Извлечь строковый ключ из таксона, который представляет ключ объекта
 * @param {Taxon} taxon 
 * @returns {string}
 */
const getKey = (taxon) => {
    if (taxon.type === 'TxConst') {
        return getValue(taxon)
    }
    if (taxon.type === 'TxName') {
        return taxon.name
    }
    return ''
}

/**
* Load aliases list from webpack config
* @param {Taxon} mainTaxon Taxon of webpack.config.js
* @returns {Array<string[]>} Если строка содержит два элемента, то их можно редактировать.
*      Если один, то это ключ, который нельзя использовать для создания новых записей
*/
const loadAliasesList = (mainTaxon) => {
    const rootTaxon = findConfigRoot(mainTaxon)
    const resolveTaxon = findObjectItem(rootTaxon, 'resolve')
    if (!resolveTaxon) return []
    const aliasTaxon = findObjectItem(resolveTaxon, 'alias')
    if (!aliasTaxon) return []
    if (aliasTaxon.type !== 'TxObject') throw new Error(`'alias' must be an object. Found type: '${aliasTaxon.type}'`)
    const validItems = aliasTaxon.items.filter(({key, value}) => {
        if (!value) return false
        if (!(key.type === 'TxName' || (key.type === 'TxConst' && key.constType === 'string'))) return false
        return true
    })
    return validItems.map(({key, value}) => {
        const result = [getKey(key)]
        if (!result[0]) return result
        // Expected pattern: path.resolve(__dirname, 'src/utilities/')
        if (value.type === "TxFnCall") {
            // Expected types list: TxBinOp, TxName, TxConst
            const types = value.subTaxons.map(tx => tx.type).join(', ')
            if (types === 'TxBinOp, TxName, TxConst') {
                result[1] = getValue(value.subTaxons[2])
            }
        }
        return result
    }).filter(pair => !!pair[0])
}

/**
 * Разделить алиасы на парные и непарные, которые превращаются в ключевые слова
 * В дальнейшем алиасы, попавшие в ключевые слова, не подлежат удалению из конфига вебпака
 * @param {string[][]} pairs 
 * @returns {{ reserved: Record<string, 1>; pairs: string[][]; }}
 */
const separateAliasesList = (pairs) => (
    {
        reserved: pairs.reduce((acc, pair) => pair.length === 1 ? {...acc, [pair[0]]: 1} : acc, {}),
        pairs: pairs.filter(pair => pair.length === 2),
    }
)

/**
* @param {Taxon} configTaxon IN/OUT
* @param {Array<{oldKey:string; key:string; value:string;}>} aliases 
*/
const updateWebPackConfig = (configTaxon, aliases, style) => {    
    const srcAliases = separateAliasesList(loadAliasesList(configTaxon))

    const rootTaxon = findConfigRoot(configTaxon)
    let resolveTaxon = findObjectItem(rootTaxon, 'resolve')
    if (!resolveTaxon) {
        resolveTaxon = new TxObject()
        rootTaxon.addObjectItem('resolve', resolveTaxon)
    }
    let aliasTaxon = findObjectItem(resolveTaxon, 'alias')
    if (!aliasTaxon) {
        aliasTaxon = new TxObject()
        resolveTaxon.addObjectItem('alias', aliasTaxon)
    }

    // Удалить лишние элементы
    Object.keys(aliasTaxon.dict).filter(rawKey => {
        const key = fromQuoted(rawKey)
        if (key in srcAliases.reserved) return
        if (aliases.find(({oldKey}) => oldKey === key)) return
        aliasTaxon.deleteItem(key)
    })

    const makeValueTaxon = (value) => {
        const text = `path.join(__dirname, ${style.string(value)})`
        const node = parseExpression(ReaderCtx.fromText(text))
        return node.createTaxon()
    }
    
    aliases.forEach(({oldKey, key, value}) => {
        if (!oldKey || !(oldKey in aliasTaxon.dict)) {
            aliasTaxon.addObjectItem(key, makeValueTaxon(value), style)
        } else {
            aliasTaxon.changeObjectItem(oldKey, key, makeValueTaxon(value), style)
        }
    })
}

/**
* @param {string} name 
* @param {Array<{oldKey:string; key:string; value:string;}>} aliases 
*/
const saveAliasesList = async (name, aliases) => {
    const {entities} = require('./all')
    const {WebPack} = entities
    const wpTaxon = await WebPack.loadConfigTaxon()
    updateWebPackConfig(wpTaxon, aliases, new Style())
    await WebPack.saveConfigTaxon(wpTaxon)
    wsSendCreateEntity(name, `Updated ${WebPack.getConfigName()}`)
}

/**
 * Обновление конфига линтера (только данные)
 * @param {Object} cfgRoot 
 * @param {string[][]} aliases 
 * @returns {Object}
 */
const updateESLintConfig = (cfgRoot, aliases, extList) => {
    cfgRoot.settings = cfgRoot.settings || {}
    const {settings} = cfgRoot
    settings["import/resolver"] = settings["import/resolver"] || {}
    const importResolver = settings["import/resolver"]
    importResolver.alias = importResolver.alias || {}
    const {alias} = importResolver
    alias.map = aliases.filter(row => row.length === 2).map(pair => [pair[0], `./${pair[1]}`])
    const oldExt = alias.extensions || []
    alias.extensions = Array.from(new Set([...oldExt, ...extList]))
    return cfgRoot
}

const makeExtList = () => {
    if (CommonInfo.tech.language === 'TypeScript') {
        return ['.ts', '.tsx']
    } else {
        return ['.js', '.jsx']
    }
}

/**
 * Обновление файла конфига линтера
 * Данные берутся из конфига вебпака
 * @param {function(msg: string)} drawMsg 
 */
const updateESLintConfigFile = async (drawMsg) => {
    const {entities} = require('./all')
    const {WebPack, ESLint} = entities
    const mainTaxon = await WebPack.loadConfigTaxon()
    const aliases = loadAliasesList(mainTaxon)

    await ESLint.updateConfig((cfgRoot) => updateESLintConfig(cfgRoot, aliases, makeExtList()))
    drawMsg(`Updated ESLint config`)
}

/**
 * @param {Object} cfg 
 * @param {string[][]} aliases 
 */
const updateTSConfig = (cfg, aliases) => {
    cfg.compilerOptions = cfg.compilerOptions || {}
    const {compilerOptions} = cfg
    compilerOptions.baseUrl = './'
    compilerOptions.paths = compilerOptions.paths || {}
    const dict = aliases.filter(row => row.length === 2).reduce((acc, [key, value]) => {
        return {...acc, [`${key}/*`]: [`${value}/*`]}
    }, {})
    compilerOptions.paths = dict
}

/**
 * Обновление файла tsconfig.json
 * @param {function(msg: string)} drawMsg 
 */
const updateTSConfigFile = async (drawMsg) => {
    const {entities} = require('./all')
    const {WebPack, TypeScript} = entities
    const mainTaxon = await WebPack.loadConfigTaxon()
    const aliases = loadAliasesList(mainTaxon)
    const fname = TypeScript.getConfigName()
    const cfgText = await fs.promises.readFile(fname, {encoding: 'utf8'})
    const cfg = JSON.parse(cfgText)
    updateTSConfig(cfg, aliases)
    await fs.promises.writeFile(fname, JSON.stringify(cfg, null, '  '), {encoding: 'utf8'})
    drawMsg(`Updated ${fname}`)
}

module.exports = {
    loadAliasesList,
    updateWebPackConfig,
    saveAliasesList,
    separateAliasesList,
    updateESLintConfigFile,
    updateESLintConfig,
    updateTSConfigFile,
    updateTSConfig,
}