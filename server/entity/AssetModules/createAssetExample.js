const fs = require('fs')
const path = require('path')
const { makeTemplateName, isFileExists, makeSrcName } = require('../../fileUtils')
const { wsSendCreateEntity } = require('../../wsSend')
const { injectImport } = require('../../parser/injectImport')
const { readRows, writeRows } = require('../../sysUtils/textFile')
const { CommonInfo } = require('../../CommonInfo')

const updateMainFrame = (rows, type, imgId, shortName) => {
    // Для JavaScript и Babel можно использовать import
    // Но родной TypeScript пока понимает только require
    injectImport(rows, `const ${imgId} = require("./assets/${shortName}");`)
    const pos = rows.findIndex(row => row.indexOf('</>') > 0)
    if (pos > 0) {
        const space = /^(\s*)/.exec(rows[pos - 1])[0]
        const comm = `${space}{/* Example of ${type} Asset Module */}`
        const code = `${space}<div><img src={${imgId}} height="100px" alt="${type}" /></div>`
        rows.splice(pos, 0, '', comm, code)
    }
    return rows
}

/**
 * @param {string} partName
 * @param {"png" | "svg"} type
 * @returns {Promise<void>} 
 */
 const createAssetExample = async (partName, type) => {
    const imgId = `${type}Image`
    const shortName = `${imgId}.${type}`

    // Скопировать файл из папки шаблонов в папку src/assets
    const srcName = makeTemplateName(shortName)
    const dstFolderName = makeSrcName('assets')
    const assetsExists = await isFileExists(dstFolderName)
    if (!assetsExists) {
        await fs.promises.mkdir(dstFolderName)
    }
    const dstName = path.join(dstFolderName, shortName)
    await fs.promises.copyFile(srcName, dstName, fs.constants.COPYFILE_EXCL)
    wsSendCreateEntity(partName, `Created example file: ${dstName}`)

    // Модифицировать src/MainFrame
    const mainFrameName = makeSrcName(`MainFrame.${CommonInfo.getExtension('render')}`)
    const rows = await readRows(mainFrameName)

    await writeRows(mainFrameName, updateMainFrame(rows, type, imgId, shortName))
    wsSendCreateEntity(partName, `Updated ${mainFrameName}`)
}

module.exports = { createAssetExample, updateMainFrame }