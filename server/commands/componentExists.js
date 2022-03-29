const { CommonInfo } = require('../CommonInfo')
const { makeFullName, isFileExists } = require('../fileUtils')
const { wsSend } = require('../wsServer')

/**
 * Find component
 * @param {string} path Example: "src/components/HelloWorld"
 */
const componentExists = async (path) => {
    const name = path.split('/').slice(-1)[0]
    const ext = CommonInfo.getExtension('render')
    let msg = {
        path,
        name,
        exists: false
    }
    // Try to find a file
    const fileNameSimple = `${path}.${ext}`
    if (await isFileExists(makeFullName(fileNameSimple))) {
        msg.exists = true
        msg.fileName = fileNameSimple
    } else {
        const fileNameExt = `${path}/${name}.${ext}`
        if (await isFileExists(makeFullName(fileNameExt))) {
            msg.exists = true
            msg.fileName = fileNameExt
        }
    }
    wsSend('componentExists', msg)
}

module.exports = {componentExists}