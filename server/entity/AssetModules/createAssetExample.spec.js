const {expect} = require('chai')
const {updateMainFrame} = require('./createAssetExample')

const src = `import * as React from "react";

export const MainFrame = () => (
    <>
        <h1>Hello, world!</h1>
    </>
);
`

const split = (text) => text.split('\n')

const join = (rows) => rows.join('\n')

describe('updateMainFrame', () => {
    it('svg example', () => {
        const dst = 
`import * as React from "react";
const svgImage = require("./assets/svgImage.svg");

export const MainFrame = () => (
    <>
        <h1>Hello, world!</h1>

        {/* Example of svg Asset Module */}
        <div><img src={svgImage} height="100px" alt="svg" /></div>
    </>
);
`
        const rows = updateMainFrame(split(src), 'svg', 'svgImage', 'svgImage.svg')
        expect(join(rows)).to.be.equal(dst)
    })
})
