const {expect} = require('chai')
const {injectDemoCodeToMainFrame, injectCode, getStartSpace} = require('./injectDemoCode')

describe('getStartSpace', () => {
    expect(getStartSpace('hello')).to.equal('')
    expect(getStartSpace('')).to.equal('')
    expect(getStartSpace(' abc ')).to.equal(' ')
    expect(getStartSpace('  abc ')).to.equal('  ')
    expect(getStartSpace('\tTAB ')).to.equal('\t')
    expect(getStartSpace('\t\t<div>')).to.equal('\t\t')
    expect(getStartSpace('\t\t  <Hello />')).to.equal('\t\t  ')
})

describe('injectCode', () => {
    it('standard', () => {
        const rows = 
`  <>
    first
    second
  </>`.split('\n')
        injectCode(rows, '<>', 'third\n  3.1\n  3.2\nfinal')
        const dst =
`  <>
    first
    second
    third
      3.1
      3.2
    final
  </>`
        expect(rows.join('\n')).to.equal(dst)
    })
})

describe('injectDemoCodeToMainFrame', () => {
    it('typical', () => {
        const src = 
`import * as React from "react";

export const MainFrame = () => (
    <>
        <h1>Hello, world!</h1>
    </>
);
`
        const dst =
`import * as React from "react";
import {CssModuleDemo} from "./cssModulesDemo/CssModuleDemo";

export const MainFrame = () => (
    <>
        <h1>Hello, world!</h1>
        <CssModuleDemo />
    </>
);
`
        const rows = src.split('\n')
        injectDemoCodeToMainFrame(
            rows,
            `import {CssModuleDemo} from "./cssModulesDemo/CssModuleDemo";`,
            `<CssModuleDemo />`
        )
        expect(rows.join('\n')).to.equal(dst)
    })
})