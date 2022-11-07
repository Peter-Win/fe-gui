const {expect} = require('chai')
const {addMomentToWebPackConfig, addMomentToApp} = require('./Moment')
const {parseModule} = require('../parser/parseExpression')
const {Style} = require('../parser/Style')
const {formatChunks} = require('../parser/WriterCtx')
const {ReaderCtx} = require('../parser/ReaderCtx')

describe('addMomentToWebPackConfig', () => {
    it("default", () => {
        const srcConfig = 
`const path = require('path');
const {CleanWebpackPlugin,} = require('clean-webpack-plugin');
module.exports = {
    plugins: [
        new CleanWebpackPlugin(),
    ],
};
`
        const dstConfig =
`const path = require('path');
const {CleanWebpackPlugin,} = require('clean-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
module.exports = {
  plugins: [
    new CleanWebpackPlugin(),
    new MomentLocalesPlugin({
      localesToKeep: [
        "ru",
        "en",
        "it",
        "es",
      ],
    }),
  ],
};
`
        const sourceNode = parseModule(ReaderCtx.fromText(srcConfig))
        const wpTaxon =  sourceNode.createTaxon()

        addMomentToWebPackConfig(wpTaxon, ['ru', 'en', 'it', 'es'])
        
        const style = new Style()
        const chunks = []
        wpTaxon.exportChunks(chunks, style)
        const text = formatChunks(chunks, style)

        expect(text).to.equal(dstConfig)
    })
})

describe("addMomentToApp", () => {
    it("default", () => {
        const src = 
`import * as React from "react";

const App: React.FC = () => (
    <React.StrictMode>
        <MainFrame />
    </React.StrictMode>
);
`
        const dst = 
`import * as React from "react";
import moment from "moment";

moment.locale("it");

const App: React.FC = () => (
    <React.StrictMode>
        <MainFrame />
    </React.StrictMode>
);
`
        const rows = src.split('\n')
        addMomentToApp(rows, 'it')
        expect(rows.join('\n')).to.equal(dst)
    })
})