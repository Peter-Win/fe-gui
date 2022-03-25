const {findConfigRoot, findPath, findObjectItem, findConstValueTaxon} = require('../WebPack.utils')
const {makeTaxonFromData} = require('../../parser/makeTaxonFromData')
const {TxConst} = require('../../parser/taxons/TxConst')
const { TxObject } = require('../../parser/taxons/TxObject')
const { TxArray } = require('../../parser/taxons/TxArray')
const { Style } = require('../../parser/Style')
const { loadTemplate } = require('../../sysUtils/loadTemplate')
const { makeFullName, isFileExists } = require('../../fileUtils')
const { readRows, writeRows } = require('../../sysUtils/textFile')

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
 * @param {string[]} extensions 'css'|'less'
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
 * @param {string} ext 
 * @param {Object} rule 
 * @param {Style} style 
 * @returns {Promise<void>}
 */
const injectRule = async (wpConfigTaxon, ext, rule, style) => {
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
    const dict = await testModuleTypes(wpConfigTaxon, [ext])
    const simpleRule = dict[ext]
    if (simpleRule && simpleRule.type === 'TxObject') {
        const txExclude = TxConst.create('regexp', `/\\.module\\.${ext}$/`)
        simpleRule.changeObjectItem('exclude', 'exclude', txExclude)
    }
}

/**
 * 
 * @param {Object} params
 * @param {function(string, string?): void} params.log
 * @param {function(string, boolean): Promise<void>} params.addDependency
 * @param {{ext:string; loaders:string[]; devDeps?:string}[]} params.styleDef
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
    for (const {ext, loaders, devDeps} of styleDef) {
        if (!params[ext]) continue
        log(`Install ${ext.toUpperCase()} Modules`, 'success')
        nInstalled++
        await addDependency('style-loader', true)
        if (isTS) {
            // Сначала использовался этот лоадер для генерации файлов типа <name>.module.<ext>.d.ts
            // Но эти файлы при первой сборке не подхватывались, т.к. видимо генерились позже чем компилировался компонент
            // Поэтому добавился файл declaration.d.ts, который решил проблему.
            // И этот лоадер стал не нужен.
            // await addDependency('css-modules-typescript-loader', true)

            await addDependency('typescript-plugin-css-modules', true)
        }
        await addDependency('css-loader', true)
        for (const loader of loaders) {
            await addDependency(loader, true)
        }
        if (devDeps) {
            await addDependency(devDeps, true)
        }
        const rule = {
            test: new RegExp(`\\.module\\.${ext}$`),
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName: params[`${ext}LocalName`]
                        },
                    },
                },
                ...loaders
            ]
        }
        // См. коммент выше
        // if (transpiler === 'TypeScript') {
        //     rule.use.splice(1, 0, 'css-modules-typescript-loader')
        // }
        await injectRule(wpConfigTaxon, ext, rule, style)
        
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
                config.include = config.include || []
                if (config.include.indexOf('declaration.d.ts') < 0) {
                    config.include.push('declaration.d.ts')
                }
            }, log)
        }

        // Examples
        if (params[`${ext}Example`]) {
            if (framework === 'React') {
                const compName = `${ext[0].toUpperCase()}${ext.slice(1)}ModuleDemo`
                const addFile = async (name, tmName) => {
                    const data = await loadTemplate(tmName || name, {})
                    files.push({ name, data })
                }
                await addFile(`${compName}.${language[0].toLowerCase()}sx`, `${compName}.jsx`)
                await addFile(`${compName}.module.${ext}`)
                imports.push({
                    hdr: `import { ${compName} } from "./${exampleFolder}/${compName}"`,
                    code: `<${compName} />`,
                })
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


/**
 * Когда используется TypeScript транспилер, то к нему прилагается плагин вебпака css-modules-typescript-loader
 * Этот плагин генерирует для каждого файла <name>.module.<ext> еще один файл <name>.module.<ext>.d.ts
 * Однако, при первой компиляции может вылезать ошибка:
 * ERROR in ...\<name>.tsx
 *    TS2307: Cannot find module './<name>.module.<ext>' or its corresponding type declarations
 * При повторной компиляции ошибка не появляется.
 * Но чтобы она вообще не появлялась, необходимо сделать файл declaration.d.ts
 * PS. Эта фича позволила вообще избавиться от css-modules-typescript-loader и генерации лишних файлов
 * 
 * @param {string[]} extList
 */
const updateDeclaration = async (extList, log) => {
    const fname = makeFullName('declaration.d.ts')
    const exists = await isFileExists(fname)
    const rows = exists ? await readRows(fname) : []
    if (updateDeclarationRows(rows, extList)) {
        await writeRows(fname, rows)
        if (log) log(`${exists ? 'Updated':'Created'} ${fname}`)
    }
}

/**
 * Добавление конструкций типа declare module "*.module.css";
 * Если такие конструкции уже есть, то добавления не происходит
 * @param {string[]} rows строки файла declaration.d.ts
 * @param {string[]} extList список добавляемых расширений: css, less, sass, scss
 * @returns {boolean} true, если произошли изменения
 */
const updateDeclarationRows = (rows, extList) => {
    const makeDecl = (ext) => `declare module "*.module.${ext}";`
    const extSet = new Set(extList)
    extList.forEach(ext => {
        if (rows.find(row => row === makeDecl(ext))) extSet.delete(ext)
    })
    const newExts = Array.from(extSet)
    if (newExts.length === 0) return false
    newExts.forEach(ext => rows.push(makeDecl(ext)))
    return true
}


module.exports = {
    getAvailableExtensions,
    testModuleTypes,
    testRule,
    injectRule,
    installStyleModules,
    updateDeclaration,
    updateDeclarationRows,
}