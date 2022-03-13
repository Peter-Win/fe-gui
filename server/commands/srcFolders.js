const fs = require('fs')
const path = require('path')
const {makeFullName} = require('../fileUtils')

const recursiveReadFolder = async (fullName, shortName) => {
    let folders = []
    const files = await fs.promises.readdir(fullName, {withFileTypes: true})
    for (const dirent of files) {
        if (dirent.isDirectory()) {
            const curFullName = path.join(fullName, dirent.name)
            const curShortName = `${shortName}/${dirent.name}`
            folders.push(curShortName)
            const subList = await recursiveReadFolder(curFullName, curShortName)
            folders = [...folders, ...subList]
        }
    }
    return folders
}

const getSrcFolders = async () => {
    const list = await recursiveReadFolder(makeFullName('src'), 'src')
    return ['src', ...list]
}

module.exports = {getSrcFolders}