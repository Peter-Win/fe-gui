/**
 * Jest and ESLint
 */
const { wsSend } = require('../../wsServer')
module.exports.jestESLint = async (name, entities) => {
    const { ESLint } = entities

    wsSend('createEntityMsg', { name: this.name, message: 'Update ESLint config' })
    await ESLint.updateConfig(config => {
        config.env = config.env || {}
        config.env.jest = true
        return config
    })
}