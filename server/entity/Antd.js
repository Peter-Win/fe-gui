const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {installPackageSmart} = require('../commands/installPackage')
const {injectImport} = require('../parser/injectImport')
const {makeSrcName, makeTemplateName, isFileExists} = require('../fileUtils')
const {wsSend} = require('../wsServer')
const {readRows, writeRows} = require('../sysUtils/textFile')
const {createEntity} = require('../commands/createEntity')
const {findRule, findPath} = require('./WebPack.utils')
const {parseExpression} = require('../parser/parseExpression')
const {ReaderCtx} = require('../parser/ReaderCtx')
const { wsSendCreateEntity } = require('../wsSend')

const reactLib = 'antd'
const vueLib = 'ant-design-vue'

class Antd {
    name = 'Antd'
    depends = ['React']
    isInit = false
    isReady = false
    fw = '' // 'React' | 'Vue'
    lib = '' // reactLib | vueLib

    async init() {
        const {entities: {PackageJson, React, Vue}} = require('./all')
        const forReact = PackageJson.isDependency(reactLib)
        const forVue = PackageJson.isDependency(vueLib)
        this.isInit = forReact || forVue
        if (!this.isInit) {
            this.isReady = React.isInit || Vue.isInit
            if (React.isInit) {
              this.fw = 'React'
              this.lib = reactLib
            }
            if (Vue.isInit) {
              this.fw = 'Vue'
              this.lib = vueLib
            }
        }
    }

    async create(params) {
        const {entities} = require('./all')
        const {PackageJson, LESS, WebPack} = entities
        if (!LESS.isInit) {
            await createEntity(entities, LESS.name, {})
        }

        const onFW = (dict) => dict[this.fw] || ''

        const packages = [onFW({ Vue: vueLib, React: reactLib})]
        if (params.icons) {
          packages.push(onFW({React: '@ant-design/icons', Vue: '@ant-design/icons-vue'}))
        }

        await installPackageSmart(this.name, packages, false)

        // Необходимо модифицировать правило для less, чтобы избежать ошибки компиляции less-файлов ant
        const configTaxon = await WebPack.loadConfigTaxon()
        const rule = findRule(configTaxon, '.less')
        if (!rule) throw new Error('Rule for .less not found in webpack config')
        const use = findPath(rule, 'use')
        const lessUse = use.subTaxons[use.subTaxons.length - 1]
        // Обычно это строка
        if (lessUse.type === 'TxConst' && lessUse.constType === 'string') {
            use.subTaxons.pop()
            const newLessUseText = `{
              loader: 'less-loader',
              options: {
                lessOptions: { javascriptEnabled: true },
              } 
            }`
            const newLessUse = parseExpression(ReaderCtx.fromText(newLessUseText))
            use.addTaxon(newLessUse.createTaxon())
        }
        await WebPack.saveConfigTaxon(configTaxon)

        // Необходимо внедрить импорт стилей в файл приложения
        const antdStyles = [
            `@import '~${this.lib}/dist/antd.less'; // Import Ant Design styles by less entry`,
            "",
            "@primary-color: @blue-base; // primary color for all components",
        ]

        const { fullName: styleName, shortName } =
            await LESS.checkStyleLess((msg, type) => wsSendCreateEntity(this.name, msg, type))
        const styleRows = await readRows(styleName)
        const templateRows = await readRows(makeTemplateName(shortName))
        // Если style.less остался такой же, как при генерации LESS, то его можно полностью перезаписать
        const isOld = styleRows.join('\n') === templateRows.join('\n')
        const newStyleRows = isOld ? antdStyles : [...antdStyles, ...styleRows]
        await writeRows(styleName, newStyleRows)
        wsSendCreateEntity(this.name,
            'You can use AntdLayout addon to generate base antd application.',
            'success')
    }
    defaultParams = {
        icons: true,
    }

    get description() {
      return `
<div style="display: flex; align-items: center; margin-bottom: 1.3rem;">
  <img alt="logo" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" width="36" />
  <span style="padding: 0 .4em; font-size: 150%; color: gray;">+</span>
  ${this.fw === 'Vue' ? 
  `<img width="34" src="https://qn.antdv.com/vue.png">`: 
  `<img width="38" src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg">`}
  <span style="color:black; margin-left: .5em; font-size: 26px; font-weight: bold;">Ant Design</span>
</div>
<p>
  A design system for enterprise-level products. Create an efficient and enjoyable work experience.
</p>
<p>
  <a href="${this.fw === 'Vue' ? 'https://antdv.com': 'https://ant.design'}" target="_blank">Official site</a>
</p>
`
    }
    controls = `
<div class="rn-ctrl" data-name="icons" data-type="Checkbox" data-title="Install icons library"></div>
`
}

const makeMainFrame = () => {
    const isTS = CommonInfo.tech.language === 'TypeScript'
    const mfType = isTS ? ': React.FC' : ''
    return `import * as React from 'react';
import { Layout } from 'antd';
const { Header, Footer, Sider, Content } = Layout;

export const MainFrame${mfType} = () => (
  <Layout>
    <Header>${CommonInfo.extParams.title}</Header>
    <Content>Content</Content>
    <Footer>Footer</Footer>
  </Layout>
);
`
}

module.exports = {Antd}