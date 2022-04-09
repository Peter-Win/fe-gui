const {expect} = require('chai')
const {mainFrameUpdate} = require('./mainFrameUpdate')
const {injectDemoCodeToMainFrame} = require('../../sysUtils/injectDemoCode')
const {compareText} = require('../../sysUtils/compareText')

const src = 
`import * as React from "react";

export const MainFrame: React.FC = () => (
  <>
    <h1>Hello!</h1>
  </>
);`

describe('mainFrameUpdate', () => {
    it('Use MobX with single store', () => {
        const dst = 
`import * as React from "react";
import { MyComponent, myComponentStore } from "./components/MyComponent";

export const MainFrame: React.FC = () => (
  <>
    <h1>Hello!</h1>
    <MyComponent store={myComponentStore} />
  </>
);`
        const rows = src.split('\n')
        injectDemoCodeToMainFrame(rows, mainFrameUpdate({
            name: 'MyComponent',
            folder: 'src/components',
            mobxClassName: 'MyComponentStore',
            mobxStoreName: 'myComponentStore',
            props: [{ propName: 'store', type: 'MobX store', isRequired: true }],
        }))
        compareText(rows, dst)
    })

    it('Use MobX with special store instance', () => {
        const dst = 
`import * as React from "react";
import { MyComponent, MyComponentStore } from "./components/MyComponent";

const store = new MyComponentStore();

export const MainFrame: React.FC = () => (
  <>
    <h1>Hello!</h1>
    <MyComponent store={store} />
  </>
);`
        const rows = src.split('\n')
        injectDemoCodeToMainFrame(rows, mainFrameUpdate({
            name: 'MyComponent',
            folder: 'src/components',
            mobxClassName: 'MyComponentStore',
            mobxStoreName: '',
            props: [{ propName: 'store', type: 'MobX store', isRequired: true }],
            mobx: { exportStore: false, fields: [] },
        }))
        compareText(rows, dst)
    })
})