const {readRows, writeRows} = require('../sysUtils/textFile')
const {makeSrcName} = require('../fileUtils')
const {injectImport} = require('../parser/injectImport')

const getStartSpace = (line) => {
    const res = /^(\s*)./.exec(line)
    if (!Array.isArray(res)) return ''
    return res[1] || ''
}

/**
 * 
 * @param {string[]} rows 
 * @param {string} containerBegin Строка, коорая начинает блок. Без отступа.
 *      Предполагается, что конец блока имеет такой же отступ
 * @param {string} code Может быть несколько строк, разделенных \n
 */
const injectCode = (rows, containerBegin, code) => {
    const beginPos = rows.findIndex(row => row.trim() === containerBegin)
    if (beginPos < 0) return
    const space = getStartSpace(rows[beginPos])
    let endPos = beginPos + 1
    let inSpace = null
    while (endPos < rows.length && getStartSpace(rows[endPos]) !== space) {
        inSpace = inSpace || getStartSpace(rows[endPos])
        endPos++
    }
    inSpace = inSpace || `${space}  `
    code.split('\n').forEach((codeLine, i) => {
        rows.splice(
            endPos + i,
            0, 
            codeLine ? `${inSpace}${codeLine}` : ''
        )
    })
}

/**
 * 
 * @param {string[]} rows IN/OUT
 * @param {string} header import instruction
 * @param {string} code Can be multiple strings, divided by \n
 */
const injectDemoCodeToMainFrame = (rows, header, code) => {
    if (header) injectImport(rows, header)
    injectCode(rows, '<>', code)
}

const injectDemoCode = async (shortName, header, code) => {
    const fullName = makeSrcName(shortName)
    const rows = await readRows(fullName)
    if (/^MainFrame\.[jt]sx$/.test(shortName)) {
        injectDemoCodeToMainFrame(rows, header, code)
    }
    await writeRows(fullName, rows)
}

module.exports = {injectDemoCode, injectDemoCodeToMainFrame, injectCode, getStartSpace}