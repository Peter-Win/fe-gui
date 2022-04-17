/*
 Для файлов stories нужно отключть правило "import/no-extraneous-dependencies"
 Иначе будет вылазить такая ошибка:
 error  '@storybook/react' should be listed in the project's dependencies, not devDependencies  import/no-extraneous-dependencies
*/
const {wsSendCreateEntity} = require('../../wsSend')
const {updateESLintListRule, appendOverride} = require('../../sysUtils/updateESLintListRule')
const {CommonInfo} = require('../../CommonInfo')

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
        wsSendCreateEntity(name, msg)

        // В коде истории предполагается наличие подобных конструкций:
        // const Template = (args) => <Button {...args} />;
        // https://storybook.js.org/docs/react/get-started/whats-a-story
        // We need to prevent 'react/jsx-props-no-spreading' error in stories files only
        appendOverride(config, {
            "files": [`*.stories.${CommonInfo.getExtension('render')}`],
            "rules": {
              "react/jsx-props-no-spreading": "off"
            }      
        })

        return config
    })
}

// "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/*.stories.*"]}],
