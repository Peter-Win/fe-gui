const {wsSendCreateEntity} = require('../../wsSend')
const {extendRule} = require('../../sysUtils/esLintUtils')
const {CommonInfo} = require('../../CommonInfo')

// ESLint + ReactTestingLibrary
//
// We need to add eslint rule
// "import/no-extraneous-dependencies": [
//        "error",
//        {"devDependencies": ["**/*.spec.ts", "**/*.spec.tsx"]}
// ]
//
// to prevent error:
// error  '@testing-library/react' should be listed in the project's dependencies, not devDependencies     import/no-extraneous-dependencies

module.exports.esLintRTL = async (name, entities) => {
    const { ESLint } = entities
    const ruleName = 'import/no-extraneous-dependencies'
    await ESLint.updateConfig(data => {
        const exts = CommonInfo.tech.language === 'TypeScript' ? ['ts', 'tsx'] : ['js', 'jsx']
        const devDependencies = exts.flatMap(e => ['spec', 'test'].map(s => `**/*.${s}.${e}`))
        extendRule(data, ruleName, ['error', {devDependencies}])
        return data
    })
    wsSendCreateEntity(name, `Updated rule "${ruleName}" in ${ESLint.getConfigName()}`)
}