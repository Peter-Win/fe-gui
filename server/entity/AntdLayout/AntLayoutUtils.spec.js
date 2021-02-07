const {expect} = require('chai')
const {makeMainFrame, updateStyle, updateApp} = require('./AntdLayoutUtils')
const {Style} = require('../../parser/Style')

describe('AntdLayoutUtils', () => {
    it('updateStyle', () => {
        const antdStyles = [
            "@import '~antd/dist/antd.less'; // Import Ant Design styles by less entry",
            "",
            "@primary-color: @blue-base; // primary color for all components",
        ]
        updateStyle(antdStyles, {theme: 'dark', useMenu: true, useSider: true, useHeader: true})
        expect(antdStyles).to.eql([
            "@import '~antd/dist/antd.less'; // Import Ant Design styles by less entry",
            "@import '~antd/lib/style/themes/dark.less';",
            "",
            "@primary-color: @blue-base; // primary color for all components",
            "@layout-sider-background: @menu-bg;",
            "@layout-header-background: @menu-bg;",
            "",
            ".main-layout { min-height: 100vh; }",
        ])
    })

    it('updateStyle empty', () => {
        const rows = []
        updateStyle(rows, {theme: 'default', useMenu: false, useSider: true, useHeader: false})
        expect(rows).to.eql([
            "@import '~antd/dist/antd.less';",
            "@import '~antd/lib/style/themes/default.less';",
            '@primary-color: @blue-base;',
            "",
            ".main-layout { min-height: 100vh; }",
        ])
    })

    it('updateApp typical', () => {
        const rows = [
            `import * as React from "react";`,
            `const App: React.FC = () => (`,
            `  <MainFrame />`,
            `);`
        ]
        updateApp(rows, {locale: 'ru_RU'})
        expect(rows).to.eql([
            `import * as React from "react";`,
            `import { ConfigProvider } from 'antd';`,
            `import ruRU from 'antd/lib/locale/ru_RU';`,
            `const App: React.FC = () => (`,
            `  <ConfigProvider locale={ruRU}>`,
            `    <MainFrame />`,
            `  </ConfigProvider>`,
            `);`
        ])
    })

    it('makeMainFrame', () => {
        const text = makeMainFrame({
            useSider: true,
            useMenu: true,
            useHeader: true,
            useFooter: true,
            siderPos: 'outside',
            menuPos: 'sider',
        }, new Style(), 'TypeScript')
        // console.log('=======')
        // console.log(text)
        // console.log('=======')
        expect(text).to.equal(`import * as React from "react";
import { Layout, Menu } from "antd";

const { Content, Header, Sider, Footer } = Layout;

export const MainFrame: React.FC = () => (
  <Layout className="main-layout">
    <Sider>
      <Menu defaultSelectedKeys={["1"]}>
        <Menu.Item key="1">First</Menu.Item>
        <Menu.Item key="2">Second</Menu.Item>
        <Menu.Item key="3">Third</Menu.Item>
      </Menu>
    </Sider>
    <Layout>
      <Header>
      </Header>
      <Content>
      </Content>
      <Footer>
      </Footer>
    </Layout>
  </Layout>
)`)
    })
})