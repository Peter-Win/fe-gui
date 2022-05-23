const extendRule = (config, ruleName, ruleValue) => {
    config.rules = config.rules || {}
    const { rules } = config
    const oldValue = rules[ruleName]
    if (oldValue) {
        // Здесь может быть много вариантов.
        // Но пока нет никаких конкретных случаев.
        // Сейчас используется в esLintRTL.js
    }
    rules[ruleName] = ruleValue
}

module.exports = {extendRule}