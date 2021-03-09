const {makeVcsIgnores} = require('./makeVcsIgnores')
const {makeFullName, isFileExists} = require('../fileUtils')
const {readRows, writeRows} = require('../sysUtils/textFile')
const {wsSendCreateEntity} = require('../wsSend')

/**
 *
 * @param {string[]} rows
 * @params {Set<string>} needs
 * @return {string[]}
 */
const updateGitIgnore = (rows, needs) => {
    needs = needs || makeVcsIgnores()
    rows.forEach(row => {
        const tRow = row.trim()
        if (!tRow || tRow[0] === '#') {
            return
        }
        if (needs.has(tRow)) {
            needs.delete(tRow)
        }
    })
    const updates = Array.from(needs)
    return [...rows, ...updates]
}

/**
 * @return {Promise<boolean>} true, if .gitignore file updated
 */
const updateGitIgnoreFile = async () => {
    const fileName = makeFullName('.gitignore')
    let rows = []
    if (await isFileExists(fileName)) {
        rows = await readRows(fileName);
    }
    const newRows = updateGitIgnore(rows);
    if (JSON.stringify(rows) === JSON.stringify(newRows)) {
        return false
    }
    await writeRows(fileName, newRows)
    return true
}

const updateGitIgnoreFileMsg = async (name) => {
    if (await updateGitIgnoreFile()) {
        wsSendCreateEntity(name, 'Updated .gitignore file')
    }
}

module.exports = {updateGitIgnore, updateGitIgnoreFile, updateGitIgnoreFileMsg}