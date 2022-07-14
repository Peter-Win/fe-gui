const {wsSendCreateEntity} = require('../../wsSend')
const {ruleNoExtraDepends} = require('../../sysUtils/esLintUtils')

// ESLint + ReactTestingLibrary

module.exports.esLintRTL = async (name, entities) => {
    const { ESLint } = entities
    await ESLint.updateConfig(config => {
        // to prevent error:
        // error  '@testing-library/react' should be listed in the project's dependencies, not devDependencies     import/no-extraneous-dependencies
        ruleNoExtraDepends(config, (msg) => wsSendCreateEntity(name, msg))
        return config
    })
}