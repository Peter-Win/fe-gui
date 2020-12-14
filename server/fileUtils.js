// Внимание! Этот файл нельзя переносить, т.к. все пути вычисляются относительно его текущего положения.

const path = require('path')
const fs = require('fs')

const getRootPath = () =>
    path.normalize(path.join(__dirname, '..', '..'))

const makeFullName = (shortName) =>
    path.normalize(path.join(getRootPath(), shortName))

const makeSrcName = (shortName) =>
    path.join(makeFullName('src'), shortName)

const makeTemplateName = (shortName) =>
    path.normalize(path.join(__dirname, 'templates', shortName))

const isFileExists = async (fullName) => {
    try {
        await fs.promises.access(fullName, fs.constants.F_OK)
        return true
    } catch (e) {
        if (e.code === 'ENOENT') {
            return false
        }
        throw e
    }
}

module.exports = {
    getRootPath,
    makeFullName,
    makeSrcName,
    makeTemplateName,
    isFileExists,
}
