const {isFileExists, makeFullName} = require('../../fileUtils')
const {updateTSConfigFile} = require('../Aliases.utils')
const {wsSendCreateEntity} = require('../../wsSend')

module.exports.aliasesTypeScript = async (name, entities) => {
    if (await isFileExists(makeFullName('tsconfig.json'))) {
        await updateTSConfigFile((msg) => wsSendCreateEntity(name, msg))
    }
}