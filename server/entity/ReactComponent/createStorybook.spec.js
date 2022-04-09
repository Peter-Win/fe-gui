const {expect} = require("chai")
const {createStorybook} = require('./createStorybook')

describe('createStorybook', () => {

    it('JS', () => {
        const dst = `import * as React from "react";
import { HelloWorld } from "./HelloWorld";

export default {
    title: "HelloWorld",
    component: HelloWorld,
};

const Template = (args) => <HelloWorld {...args} />;

export const Primary = Template.bind({});
Primary.args = { firstName: "Иван", middleName: "Stranger" };`
        const params = {
            name: 'HelloWorld',
            story: { storyName: 'Primary' },
            props: [
                {propName: 'firstName', type: 'string', isRequired: true, testValue: '"Иван"' },
                {propName: 'middleName', type: 'string', isRequired: false, testValue: '"Stranger"' },
            ],
            isTS: false,
            renderExt: 'jsx',
        }
        const { storyFileName, storyCode } = createStorybook(params)
        expect(storyFileName).to.equal('HelloWorld.stories.jsx')
        expect(storyCode.join('\n')).to.equal(dst)
    })

    it('TS', () => {
        const dst = `import * as React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { HelloWorld } from "./HelloWorld";

export default {
    title: "Components/HelloWorld",
    component: HelloWorld,
    decorators: [
        (Story) => <div style={{ border: "thick solid silver", padding: "1em" }}><Story /></div>
    ],
} as ComponentMeta<typeof HelloWorld>;

const Template: ComponentStory<typeof HelloWorld> = (args) => <HelloWorld {...args} />;

export const Default = Template.bind({});
Default.args = { firstName: "Иван", middleName: "Stranger" };`
        const params = {
            name: 'HelloWorld',
            story: { compTitle: 'Components/HelloWorld', compDecorator: true },
            props: [
                {propName: 'firstName', type: 'string', isRequired: true, testValue: '"Иван"' },
                {propName: 'middleName', type: 'string', isRequired: false, testValue: '"Stranger"' },
            ],
            isTS: true,
            renderExt: 'tsx',
        }
        const { storyFileName, storyCode } = createStorybook(params)
        expect(storyFileName).to.equal('HelloWorld.stories.tsx')
        const dstList = dst.split('\n')
        for (const i in storyCode) {
            expect(storyCode[i]).to.equal(dstList[i], `line ${+i+1}'`)
        }
    })
})