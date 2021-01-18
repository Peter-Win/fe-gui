const {expect} = require('chai')
const {injectImport} = require('./injectImport')

describe('injectImport', () => {
    it('default case', () => {
        const src = [
            "import * as React from 'react';",
            "import {MainFrame} from './MainFrame';",
            "",
            "const App: React.FC = () => <MainFrame />;",
        ]
        const dst = [
            "import * as React from 'react';",
            "import {MainFrame} from './MainFrame';",
            "import 'antd/dist/antd.css';",
            "",
            "const App: React.FC = () => <MainFrame />;",
        ]
        const rows = [...src]
        injectImport(rows, "import 'antd/dist/antd.css';")
        expect(rows).to.eql(dst)
    })
})