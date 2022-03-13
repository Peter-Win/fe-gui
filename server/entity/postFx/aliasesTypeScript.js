const {updateTSConfigFile} = require('../Aliases.utils')
const {wsSendCreateEntity} = require('../../wsSend')

module.exports.aliasesTypeScript = async (name, entities) => {
    await updateTSConfigFile((msg) => wsSendCreateEntity(name, msg))
}