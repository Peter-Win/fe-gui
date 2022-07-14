/**
 * Jest and ESLint
 */
const {ruleNoExtraDepends} = require('../../sysUtils/esLintUtils')
const { wsSendCreateEntity } = require('../../wsSend')

module.exports.jestESLint = async (name, entities) => {
    const { ESLint } = entities

    wsSendCreateEntity(name, 'Update ESLint config')
    await ESLint.updateConfig(config => {
        config.env = config.env || {}
        config.env.jest = true

        // See https://github.com/Peter-Win/fe-gui/issues/40
        ruleNoExtraDepends(config, (msg) => wsSendCreateEntity(name, msg))

        return config
    })
}