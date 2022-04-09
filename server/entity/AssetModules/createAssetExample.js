const fs = require('fs')
const path = require('path')
const { makeTemplateName, isFileExists, makeSrcName } = require('../../fileUtils')
const { wsSendCreateEntity } = require('../../wsSend')
const { readRows, writeRows } = require('../../sysUtils/textFile')
const { CommonInfo } = require('../../CommonInfo')
const { injectDemoCodeToMainFrame } = require('../../sysUtils/injectDemoCode')

const updateMainFrame = (rows, type, imgId, shortName) => {
    // Для JavaScript и Babel можно использовать import
    // Но родной TypeScript пока понимает только require
    const header = `const ${imgId} = require("./assets/${shortName}");`
    const comment = `{/* Example of ${type} Asset Module */}`
    const code = `<div><img src={${imgId}} height="100px" alt="${type}" /></div>`
    injectDemoCodeToMainFrame(rows, {header, code: `\n${comment}\n${code}` })
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