/**
 * Обновить/создать правило в виде списка
 * rules: { ruleName: ["error", {propName: propValue}] }
 * @param {{rules: Object<string, any>}} config
 * @param {string} ruleName
 * @param {string} propName
 * @param {string} propValue
 * @return {"create" | "update"}
 */
const updateESLintListRule = (config, ruleName, propName, propValue) => {
    config.rules = config.rules || {}
    if (ruleName in config.rules && Array.isArray(config.rules[ruleName])) {
        const ruleArray = config.rules[ruleName]
        if (!ruleArray[1] || typeof ruleArray[1] !== 'object') {
            ruleArray[1] = {}
        }
        const props = ruleArray[1]
        props[propName] = props[propName] || []
        const propArray = props[propName]
        if (!propArray.find(v => v === propValue)) {
            propArray.push(propValue)
        }
        return 'update'
    } else {
        config.rules[ruleName] = ["error", {[propName]: [propValue]}]
        return 'create'
    }
}

/**
 * Add item to "overrides" part of eslint config
 * @param {{overrides?: {files: string[], rules?: Object}[]}} config IN/OUT
 * @param {{files: string[], rules?: Object}} item 
 */
const appendOverride = (config, item) => {
    let overrides = config.overrides
    if (!overrides) {
        overrides = []
        config.overrides = overrides
    }
    overrides.push(item)
}

module.exports = {updateESLintListRule, appendOverride}