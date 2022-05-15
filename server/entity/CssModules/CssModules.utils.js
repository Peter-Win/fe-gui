const {findConfigRoot, findPath, findObjectItem, findConstValueTaxon} = require('../WebPack.utils')
const {makeTaxonFromData} = require('../../parser/makeTaxonFromData')
const {TxConst} = require('../../parser/taxons/TxConst')
const { TxObject } = require('../../parser/taxons/TxObject')
const { TxArray } = require('../../parser/taxons/TxArray')
const { Style } = require('../../parser/Style')
const { loadTemplate } = require('../../sysUtils/loadTemplate')
const { makeFullName, isFileExists } = require('../../fileUtils')
const { readRows, writeRows } = require('../../sysUtils/textFile')
const { capitalize } = require('../../parser/stringUtils')
const { updateDeclarationInTsConfig } = require('../../sysUtils/updateDeclaration')

/**
 * 
 * @param {{ agent: string; exts: string[] }[]} styleDef 
 * @param {Record<string, boolean>} selections 
 * @returns {string[]}
 */
const selectedExtsList = (styleDef, selections) =>
    styleDef.filter(({ agent }) => selections[agent]).flatMap(({ exts }) => exts)

/**
 * Проверить наличие правил для модулей указанных расширений
 * @param {TxObject} ruleTaxon Предподагается наличие поля test и возможно exclude
 * @param {string[]} extensions Список расширений. example: ['css', 'less']
 * @returns {Promise<Record<string, TxObject>>}
 */
const testRule = async (ruleTaxon, extensions) => {
    const result = {}
    if (!ruleTaxon || ruleTaxon.type !== 'TxObject') return result
    const recTest = ruleTaxon.dict.test
    if (!recTest) return result
    const recExclude = ruleTaxon.dict.exclude
    const getDictItem = async (rec) => {
        if (!rec) return null
        return await findConstValueTaxon(rec)
    }
    const txTest = await getDictItem(recTest)
    const txExclude = await getDictItem(recExclude)
    if (txTest) {
        const rxTest = txTest.getRealValue()
        const rxExclude = txExclude ? txExclude.getRealValue() : null
        if (rxTest instanceof RegExp) {
            extensions.forEach(ext => {
                const moduleExt = `.${ext}`
                if (rxExclude instanceof RegExp && rxExclude.test(moduleExt)) {
                    return
                }
                if (rxTest.test(moduleExt)) result[ext] = ruleTaxon
            })
        }
    }
    return result
}

/**
 * Get types of existing style modules
 * @param {Taxon} wpConfigTaxon
 * @param {string[]} extensions 'css'|'less'|'sass'|'scss'
 * @returns {Promise<Record<string,Taxon>>}
 */
const testModuleTypes = async (wpConfigTaxon, extensions) => {
    let result = {}
    const txRoot = findConfigRoot(wpConfigTaxon)
    const txRules = findPath(txRoot, 'module.rules')
    if (txRules && txRules.type === 'TxArray') {
        for (const txItem of txRules.subTaxons) {
            const dict = await testRule(txItem, extensions)
            result = {...result, ...dict}
        }
    }
    return result
}

/**
 * 
 * @param {WebPack} WebPack 
 * @param {string[]} extensions
 * @returns {Set<string>}
 */
const getAvailableExtensions = async (WebPack, extensions) => {
    const wpConfigTaxon = await WebPack.loadConfigTaxon()
    const makeModuleExt = ext => `module.${ext}`
    const moduleExts = extensions.map(makeModuleExt)
    const extMap = await testModuleTypes(wpConfigTaxon, [...extensions, ...moduleExts])
    // Модули используются, если есть обработчик .module.ext и он отличается от .ext
    const isModuleNotUsed = ext => {
        return !(extMap[makeModuleExt(ext)] && extMap[makeModuleExt(ext)] !== extMap[ext])
    }
    return new Set(extensions.filter(isModuleNotUsed))
}

/**
 * Добавить правило для CSS модуля
 * Кроме того, добавляется exclude в правило для простого лоадера, если оно есть
 * @param {Taxon} wpConfigTaxon 
 * @param {string[]} exts
 * @param {string} extRule example for sass & scss: s[ac]ss
 * @param {Object} rule 
 * @param {Style} style 
 * @returns {Promise<void>}
 */
const injectRule = async (wpConfigTaxon, exts, extRule, rule, style) => {
    const txRoot = findConfigRoot(wpConfigTaxon)
    let txModule = findObjectItem(txRoot, 'module')
    if (!txModule) {
        txModule = new TxObject()
        txRoot.addObjectItem('module', txModule, style)
    }
    let txRules = findObjectItem(txModule, 'rules')
    if (!txRules) {
        txRules = new TxArray()
        txModule.addObjectItem('rules', txRules)
    }
    txRules.addTaxon(makeTaxonFromData(rule, style))
    // exclude
    const dict = await testModuleTypes(wpConfigTaxon, exts)
    const simpleRule = dict[exts[0]]
    if (simpleRule && simpleRule.type === 'TxObject') {
        const txExclude = TxConst.create('regexp', `/\\.module\\.${extRule}$/`)
        simpleRule.changeObjectItem('exclude', 'exclude', txExclude)
    }
}

/**
 * 
 * @param {Object} params
 * @param {function(string, string?): void} params.log
 * @param {function(string, boolean): Promise<void>} params.addDependency
 * @param {{exts:string[]; agent: string; extRule: string; loaders:string[]; devDeps?:string}[]} params.styleDef
 * @param {{css: boolean; cssExample: boolean; cssLocalName: string;}} params.params
 * @param {string} params.language TypeScript|JavaScript
 * @param {string} params.transpiler TypeScript|Babel|None
 * @param {string} params.framework React|None
 * @param {WebPack} params.WebPack
 * @returns {Promise<{files: {name:string; data:string}[]; imports: {hdr:string; code:string;}[]}>}
 */
const installStyleModules = async ({
    log,
    addDependency,
    styleDef,
    params,
    language,
    transpiler,
    framework,
    WebPack,
    TypeScript,
    exampleFolder,
}) => {
    let nInstalled = 0
    const files = []
    const imports = []
    const style = new Style()
    style.singleQuote = true
    const isTS = transpiler === 'TypeScript'
    const wpConfigTaxon = await WebPack.loadConfigTaxon()
    for (const {agent, exts, extRule, loaders} of styleDef) {
        if (!params[agent]) continue
        log(`Install ${agent} Modules`, 'success')
        nInstalled++
        if (isTS) {
            // Сначала использовался этот лоадер для генерации файлов типа <name>.module.<ext>.d.ts
            // Но эти файлы при первой сборке не подхватывались, т.к. видимо генерились позже чем компилировался компонент
            // Поэтому добавился файл declaration.d.ts, который решил проблему.
            // И этот лоадер стал не нужен.
            // await addDependency('css-modules-typescript-loader', true)

            await addDependency('typescript-plugin-css-modules', true)
        }
        const rule = {
            test: new RegExp(`\\.module\\.${extRule}$`),
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName: params[`${agent}LocalName`]
                        },
                    },
                },
                ...loaders
            ]
        }
        await injectRule(wpConfigTaxon, exts, extRule, rule, style)
        
        if (isTS) {
            await TypeScript.updateConfig((config) => {
                // plugin
                const name = "typescript-plugin-css-modules"
                config.compilerOptions = config.compilerOptions || {}
                const {compilerOptions} = config
                compilerOptions.plugins = compilerOptions.plugins || []
                const need = compilerOptions.plugins.find(item => 
                    typeof item === 'object' && item.name === name)
                if (!need) compilerOptions.plugins.push({name})
                // declaration.d.ts
                updateDeclarationInTsConfig(config)
            }, log)
        }

        // Examples
        if (framework === 'React') {
            for (const ext of exts) {
                if (params[`${ext}Example`]) {
                    const compName = `${capitalize(ext)}ModuleDemo`
                    const addFile = async (name, tmName) => {
                        const data = await loadTemplate(tmName || name, {})
                        files.push({ name, data })
                    }
                    await addFile(`${compName}.${language[0].toLowerCase()}sx`, `${compName}.jsx`)
                    await addFile(`${compName}.module.${ext}`)
                    imports.push({
                        header: `import { ${compName} } from "./${exampleFolder}/${compName}"`,
                        code: `<${compName} />`,
                    })    
                }
            }
        }
    }
    if (!nInstalled) {
        log('No item selected for installation.')
    } else {
        await WebPack.saveConfigTaxon(wpConfigTaxon)
        log(`Updated Webpack config ${WebPack.getConfigName()}`, 'success')
    }
    return {files, imports}
}

module.exports = {
    getAvailableExtensions,
    testModuleTypes,
    testRule,
    injectRule,
    installStyleModules,
    selectedExtsList,
}