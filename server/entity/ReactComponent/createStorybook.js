const {typeDefaults} = require('./makeComponentCall')
const {newMobxInstance} = require('./newMobxInstance')

const createStorybook = ({ name, props, story, isTS, renderExt, mobxClassName, mobxStoreName, mobx }) => {
    const { compTitle, compDecorator, storyName } = story
    const storyFileName = `${name}.stories.${renderExt}`
    const storyNameOk = storyName || "Default"

    const firstStoreName = `store${storyNameOk}`
    const mobxStoreCode = (mobxClassName && !mobxStoreName) ?
        `\nconst ${firstStoreName} = ${newMobxInstance({mobxClassName, mobx})};` : ''
    const mobxStoreArg = mobxClassName ? (mobxStoreName || firstStoreName) : ''
    const mobxImport = mobxClassName ? `\nimport { ${mobxStoreName || mobxClassName} } from "./${mobxClassName}";` : ''

    const args = props
        .filter(({ propName, isRequired, testValue }) => isRequired || testValue)
        .map(({ propName, type, testValue }) => {
            if (type === 'MobX store') return `${propName}: ${mobxStoreArg}`
            return `${propName}: ${testValue || typeDefaults[type]}`
        })

    const storyCode = `import * as React from "react";
import { ${name} } from "./${name}";${mobxImport}

export default {
    title: "${compTitle || name}",
    component: ${name},
    decorators: [
        (Story) => <div style={{ border: "thick solid silver", padding: "1em" }}><Story /></div>
    ],
}${isTS ? ` as ComponentMeta<typeof ${name}>`: ''};

const Template${isTS ? `: ComponentStory<typeof ${name}>` : ''} = (args) => <${name} {...args} />;

export const ${storyNameOk} = Template.bind({});${mobxStoreCode}
${storyNameOk}.args = { ${args.join(', ')} };`.split('\n')
    if (isTS) storyCode.splice(1, 0, 'import { ComponentMeta, ComponentStory } from "@storybook/react";')
    if (!compDecorator) {
        const pos = storyCode.findIndex(s => /component:/.test(s))
        if (pos >=0) storyCode.splice(pos+1, 3)
    }
    return { storyFileName, storyCode }
}

module.exports = {createStorybook}