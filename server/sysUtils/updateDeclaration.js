const { makeFullName, isFileExists } = require('../fileUtils')
const { readRows, writeRows } = require('../sysUtils/textFile')

const shortDeclarationName = 'declaration.d.ts'

/**
 * We use the convention that file declaration.d.ts is used to declare special module types.
 * For TypeScript transpiler only.
 * 
 * @param {string[]} extList Example: ['sass', 'scss']
 * @param {(message: string, type?: string) => void} log
 */
 const updateDeclaration = async (extList, log) => {
    if (extList.length === 0) return
    const fname = makeFullName(shortDeclarationName)
    const exists = await isFileExists(fname)
    const rows = exists ? await readRows(fname) : []
    if (updateDeclarationRows(rows, extList)) {
        await writeRows(fname, rows)
        if (log) log(`${exists ? 'Updated':'Created'} [${extList.join(', ')}] in ${fname}`)
    }
}

/**
 * Smart insertion of declaration.d.ts into TS config
 * @param {{include?:string[]}} config 
 */
const updateDeclarationInTsConfig = (config) => {
    config.include = config.include || []
    if (config.include.indexOf(shortDeclarationName) < 0) {
        config.include.push(shortDeclarationName)
    }
}

/**
 * Pure function without side-effects
 * Добавление конструкций типа declare module "*.ext";
 * Если такие конструкции уже есть, то добавления не происходит
 * @param {string[]} rows строки файла declaration.d.ts
 * @param {string[]} extList список добавляемых расширений: css, less, sass, scss
 * @returns {boolean} true, если произошли изменения
 */
const updateDeclarationRows = (rows, extList) => {
    const makeDecl = (ext) => `declare module "*.${ext}";`
    const extSet = new Set(extList)
    extList.forEach(ext => {
        if (rows.find(row => row === makeDecl(ext))) extSet.delete(ext)
    })
    const newExts = Array.from(extSet)
    if (newExts.length === 0) return false
    newExts.forEach(ext => rows.push(makeDecl(ext)))
    return true
}

module.exports = { updateDeclaration, updateDeclarationRows, updateDeclarationInTsConfig }