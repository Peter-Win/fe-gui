const { readRows, writeRows } = require('./textFile')
const { isFileExists } = require('../fileUtils')
const { injectImport } = require('../parser/injectImport')

const injectStyleImport = async ({dstFileName, styleNameForImport, log}) => {
    if (await isFileExists(dstFileName)) {
        const rows = await readRows(dstFileName)
        if (!injectStyleImportToRows(rows, styleNameForImport)) return
        await writeRows(dstFileName, rows)
        if (log) log(`Import of ${styleNameForImport} injected into ${dstFileName}`)
    } else {
        if (log) log(`File not found: ${dstFileName}`, 'warn')
    }
}

const injectStyleImportToRows = (rows, styleNameForImport) => {
    const importCmd = `import "${styleNameForImport}";`
    const dup = rows.find(row => row.trim() === importCmd)
    if (dup) return false
    const oldImportPos = rows.findIndex(row => /^import [\'\"]\.\/style\./.test(row))
    if (oldImportPos >= 0) {
        rows[oldImportPos] += ' // TODO: It\'s recommended to remove this import.'
    }
    injectImport(rows, importCmd)
    return true
}

module.exports = { injectStyleImport, injectStyleImportToRows }
