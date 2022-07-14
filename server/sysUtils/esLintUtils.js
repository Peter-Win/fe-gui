const { CommonInfo } = require('../CommonInfo')

const extendRule = (config, ruleName, ruleValue, log) => {
    const {entities} = require('../entity/all')
    config.rules = config.rules || {}
    const { rules } = config
    const oldValue = rules[ruleName]
    if (oldValue) {
        // Здесь может быть много вариантов.
        // Но пока нет никаких конкретных случаев.
        // Сейчас используется в esLintRTL.js
    }
    rules[ruleName] = ruleValue
    if (log) log(`Updated rule "${ruleName}" in ${entities.ESLint.getConfigName()}`)
}

// Prevent error: error: Some dependency should be listed in the project's dependencies, not devDependencies
// See https://github.com/Peter-Win/fe-gui/issues/40
const ruleNoExtraDepends = (config, log) => {
    const exts = Array.from(CommonInfo.makeCodeExts())
    const devDependencies = exts.flatMap(e => ['spec', 'test'].map(s => `**/*.${s}.${e}`))
    extendRule(config, 'import/no-extraneous-dependencies', ['error', {devDependencies}], log)
}

module.exports = {extendRule, ruleNoExtraDepends}