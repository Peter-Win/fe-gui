/*
 Для файлов stories нужно отключть правило "import/no-extraneous-dependencies"
 Иначе будет вылазить такая ошибка:
 error  '@storybook/react' should be listed in the project's dependencies, not devDependencies  import/no-extraneous-dependencies
*/
const {wsSendCreateEntity} = require('../../wsSend')
const {updateESLintListRule} = require('../../sysUtils/updateESLintListRule')

module.exports.storybookESLint = async (name, entities) => {
    const {ESLint} = entities
    await ESLint.updateConfig(config => {
        const rule = "import/no-extraneous-dependencies"
        const res = updateESLintListRule(
            config,
            rule,
            "devDependencies",
            "**/*.stories.*"
        )
        const msg = `${res === 'create' ? 'Created' : 'Updated'} rule "${rule}": ${JSON.stringify(config.rules[rule])}`
        wsSendCreateEntity(this.name, msg)
        return config
    })
}

// "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/*.stories.*"]}],
