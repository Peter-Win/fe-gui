const fs = require('fs')
/**
 *
 * @param {string} fileName
 * @return {Promise<string[]>}
 */
const readRows = async (fileName) => {
    const data = await fs.promises.readFile(fileName)
    return String(data).split('\n').map(s => s.replace('\r', ''))
}

/**
 *
 * @param {string} fileName
 * @param {string[]} rows
 * @return {Promise<void>}
 */
const writeRows = async (fileName, rows) => {
    await fs.promises.writeFile(fileName, rows.join('\n'))
}

module.exports = {readRows, writeRows}