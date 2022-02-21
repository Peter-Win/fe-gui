const isImport = row =>
    row.startsWith('import') |
    /^const\s*.+\s*=\s*require\(.+\)$/.test(row)

/**
 *
 * @param {string[]} rows IN/OUT
 * @param {string} importCmd
 */
const injectImport = (rows, importCmd) => {
    // Поиск первой строки импорта
    let pos = rows.findIndex(row => isImport(row))
    if (pos < 0) {
        pos = 0
    } else {
        while (pos < rows.length && isImport(rows[pos])) pos++
    }
    rows.splice(pos, 0, importCmd)
}
module.exports = {injectImport}