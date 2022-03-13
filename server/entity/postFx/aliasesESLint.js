/**
 * Support of aliases by ESList
 * See: https://github.com/johvin/eslint-import-resolver-alias
 */
const {wsSendCreateEntity} = require('../../wsSend')
const {installPackage} = require('../../commands/installPackage')
const {updateESLintConfigFile} = require('../Aliases.utils')

module.exports.aliasesESLint = async (name, entities) => {
    const pluginName = 'eslint-import-resolver-alias'
    if (!entities.PackageJson.isDevDependency(pluginName)) {
        await installPackage(name, pluginName, true)
    }
    await updateESLintConfigFile((msg) => wsSendCreateEntity(name, msg))
}