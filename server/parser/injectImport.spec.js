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
    it('multiline', () => {
        const src = [
            "import * as React from 'react';",
            "import {",
            "  Button,",
            "  Form",
            "} from 'antd';",
            "const path = require('path');",
            "const { exec, spawn } = require('child_process')",
            "const {",
            "  mkdirSyc,",
            "  readFileSync,",
            "} = require('fs');",
            "const First = 1;",
        ]
        const dst = [            
            "import * as React from 'react';",
            "import {",
            "  Button,",
            "  Form",
            "} from 'antd';",
            "const path = require('path');",
            "const { exec, spawn } = require('child_process')",
            "const {",
            "  mkdirSyc,",
            "  readFileSync,",
            "} = require('fs');",
            "import pretty from 'pretty';",
            "const First = 1;",
        ]
        const rows = [...src]
        injectImport(rows, "import pretty from 'pretty';")
        expect(rows.join('\n')).to.eql(dst.join('\n'))
    })
})