/**
 * Support of aliases by ESList
 * See: https://github.com/johvin/eslint-import-resolver-alias
 */
const { wsSendCreateEntity } = require('../../wsSend')
const { loadAliasesList, separateAliasesList } = require('../Aliases.utils')
const { updateJestConfig, setModuleNameMapper } = require('../Jest.utils')

module.exports.aliasesJest = async (name, entities) => {
    const { WebPack } = entities
    const wpConfig = await WebPack.loadConfigTaxon()
    const aliases = loadAliasesList(wpConfig)
    const {pairs} = separateAliasesList(aliases)

    await updateJestConfig((jestConfig, style) => {
        setModuleNameMapper({
            aliases: pairs,
            moduleTaxon: jestConfig,
            style,
        })
    }, (msg, t) => wsSendCreateEntity(name, msg, t))
}