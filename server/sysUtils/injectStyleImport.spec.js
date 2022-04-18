const {expect} = require('chai')
const {injectStyleImportToRows} = require('./injectStyleImport')

describe('injectStyleImportToRows', () => {
    it('minimal', () => {
        const src =
`import * as React from "react";
export const Box: React.FC = () => <div>Box</div>;`
        const dst =
`import * as React from "react";
import "./style.less";
export const Box: React.FC = () => <div>Box</div>;`
        const rows = src.split('\n')
        const res = injectStyleImportToRows(rows, './style.less')
        expect(res).to.be.true
        expect(rows.join('\n')).to.equal(dst)
    })

    it('prevent duplicate', () => {
        const src =
`import * as React from "react";
import "./style.less";
export const Box: React.FC = () => <div>Box</div>;`
        const rows = src.split('\n')
        const res = injectStyleImportToRows(rows, './style.less')
        expect(res).to.be.false
    })

    it('another style', () => {
        const src =
`import * as React from "react";
import "./style.css";
export const Box: React.FC = () => <div>Box</div>;`
        const dst =
`import * as React from "react";
import "./style.css"; // TODO: It's recommended to remove this import.
import "./style.less";
export const Box: React.FC = () => <div>Box</div>;`
        const rows = src.split('\n')
        const res = injectStyleImportToRows(rows, './style.less')
        expect(res).to.be.true
        expect(rows.join('\n')).to.equal(dst)
    })
})