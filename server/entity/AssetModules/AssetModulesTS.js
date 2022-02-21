/**
 * При использовании транспилера TypeScript нужно выполнить два дополнительных действия:
 * - Создать файл с описанием модулей для каждого типа ассетов types/assets.d.ts
 * - Включить ссылку на этот файл в tsconfig.json
 */

const fs = require('fs')
const path = require('path')
const { makeSrcName, isFileExists, getRootPath, makeFullName } = require('../../fileUtils')
const { buildFullExtList } = require('./AssetModulesUtils')
const { writeRows } = require('../../sysUtils/textFile')

const append = (list, item) => {
    if (!list.find(cur => cur === item)) list.push(item)
}

const updateTSConfig = (configText, relativeTypesName) => {
    const config = JSON.parse(configText)
    config.compilerOptions = config.compilerOptions || {}
    typeRoots = config.compilerOptions.typeRoots || []
    append(typeRoots, "node_modules/@types")
    append(typeRoots, relativeTypesName)
    config.compilerOptions.typeRoots = typeRoots
    return JSON.stringify(config, null, '  ')
}

const makeRelativeTypesName = (typesFolderName) => {
    const rootPath = getRootPath()
    return typesFolderName.slice(rootPath.length + 1).replace(/\\/g, '/')
}

/**
 * Сформировать файл с описанием типов src/types/assets.d.ts и подключить его к конфигу TS
 * @param {Object} params
 * @param {Array<{extList: string;}>} params.rules
 * @param {((msg: string) => void)?} log
 */
const createAssetTypes = async (params, log) => {
    const fullExtList = buildFullExtList(params.rules)
    const declRows = fullExtList.map(ext => `declare module "*.${ext}";`)

    const typesFolderName = makeSrcName('types')
    const isFolder = await isFileExists(typesFolderName)
    if (!isFolder) {
        await fs.promises.mkdir(typesFolderName)
    }
    const typesName = path.join(typesFolderName, 'assets.d.ts')
    await writeRows(typesName, declRows)
    if (log) log(`Created types declaration ${typesName}`)

    const configName = makeFullName('tsconfig.json')
    const configText = await fs.promises.readFile(configName, {encoding: 'utf8'})
    const relativeTypesName = makeRelativeTypesName(typesFolderName)
    await fs.promises.writeFile(configName, updateTSConfig(configText, relativeTypesName), {encoding: 'utf8'})
    if (log) log(`Updated ${configName}`)
}

module.exports = { updateTSConfig, createAssetTypes, makeRelativeTypesName }