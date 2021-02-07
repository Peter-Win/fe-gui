const fs = require('fs')
const {makeSrcName, makeFullName, isFileExists} = require('../../fileUtils')
const {CommonInfo} = require('../../CommonInfo')
const {readRows, writeRows} = require('../../sysUtils/textFile')
const {updateStyle, makeMainFrame, updateApp} = require('./AntdLayoutUtils')
const {Style} = require('../../parser/Style')
const {wsSend} = require('../../wsServer')

class AntdLayout {
    name = 'AntdLayout'
    depends = ['Antd']
    isReady = false
    isInit = false
    locales = []

    async init() {
        const {entities: {Antd}} = require('../all')
        this.isInit = false
        this.isReady = false
        if (!Antd.isInit) return
        const mfName = makeSrcName(`MainFrame.${CommonInfo.getExtension('render')}`)
        if (await isFileExists(mfName)) {
            // Будем считать, что если в файле MainFrame.?sx используется Layout, значит сущность инициализирована
            const mfText = await fs.promises.readFile(mfName)
            this.isInit = mfText.indexOf('<Layout') >= 0
        }
        this.isReady = !this.isInit
        if (this.isReady) {
            // read locales list
            const dirName = makeFullName('node_modules/antd/lib/locale');
            const files = await fs.promises.readdir(dirName);
            this.locales = files.filter(f => /^[a-z]{2}_[A-Z]{2}\.js$/.test(f)).map(f => f.split('.')[0])
        }
    }

    /**
     * @param {Object} params
     * @param {boolean} params.useHeader
     * @param {boolean} params.useSider
     * @param {boolean} params.useFooter
     * @param {boolean} params.useMenu
     * @param {'header'|'sider'} params.menuPos
     * @param {'outside'|'inside'} params.siderPos
     * @param {''|'default'|'dark'|'compact'} params.theme
     * @param {string} params.locale
     * @return {Promise<void>}
     */
    async create(params) {
        // MainFrame
        const style = new Style()
        const mfName = makeSrcName(`MainFrame.${CommonInfo.getExtension('render')}`)
        const mfText = makeMainFrame(params, style, CommonInfo.tech.language)
        await fs.promises.writeFile(mfName, mfText)
        wsSend('createEntityMsg', {name: this.name, message: `Overwritten ${mfName}`})

        // style
        const styleName = makeSrcName('style.less')
        let styleRows = []
        if (await isFileExists(styleName)) {
            const styleRows = await readRows(styleName)
        }
        updateStyle(styleRows, params)
        await writeRows(styleName, styleRows)
        wsSend('createEntityMsg', {name: this.name, message: `Updated ${styleName}`})

        // App
        if (params.locale) {
            const appName = makeSrcName(`App.${CommonInfo.getExtension('render')}`)
            const appRows = await readRows(appName)
            updateApp(appRows, params)
            await writeRows(appName, appRows)
            wsSend('createEntityMsg', {name: this.name, message: `Updated ${appName}`})
        }
    }
    defaultParams = {
        useHeader: true,
        useSider: false,
        useFooter: true,
        useMenu: false,
        menuPos: 'header',
        siderPos: 'outside',
        theme: '',
        locale: '',
    }
    upgradeFormType = 'Antd'
    get description() {
        return `
    <style>
        #Antd_preview {width: 280px; height: 210px;
            margin-right: 2em;
            border: thin solid silver;
            box-sizing: border-box;
        }
        .horiz-radio-box .rn-radiobox > div { display: inline-block;}
        .ant-preview-row { display: flex; flex-direction: row;}
        .ant-preview-row-item { height: 100%; }
        .ant-preview-row-item { display: flex; justify-content: center; align-items: center;}
        form[name=settings] {display: flex; justify-content: center;}
        .settings-view {display: flex; padding: 2em;}
        .ant-preview-ctrls {width: 14em;}
    </style>
<script src="antdLayout.js"></script>
<h2>Generate a basic application using Ant Layout</h2>
<div style="color: darkred; margin: .5em 0;">
    Warning! This will completely replace the <code>MainFrame</code> file.
</div>
`}
            get controls() {
      return `<div class="settings-view">
          <div id="Antd_preview"></div>
          <div class="ant-preview-ctrls">
              <div class="rn-ctrl" data-name="useHeader" data-type="Checkbox" data-title="Use Header"></div>
              <div class="rn-ctrl" data-name="useFooter" data-type="Checkbox" data-title="Use Footer"></div>
              <div class="rn-ctrl" data-name="useSider" data-type="Checkbox" data-title="Use Sider"></div>
              <div class="rn-ctrl horiz-radio-box" data-name="siderPos" data-type="Radiobox" data-radio_tm="TmRadioItem"
                data-options="g_antSiderPos"></div>
              <div class="rn-ctrl" data-name="useMenu" data-type="Checkbox" data-title="Use Menu"></div>
              <div class="rn-ctrl horiz-radio-box" data-name="menuPos" data-type="Radiobox" data-radio_tm="TmRadioItem"
                   data-options="g_antMenuPos"></div>
          </div>
          <div>
              <h4>Use theme</h4>
              <div class="rn-ctrl" data-name="theme" data-type="Radiobox"
                   data-radio_tm="TmRadioItem" data-options="g_antThemes"></div>
              <h4 style="margin-top: 1em">Locale</h4>
              <div class="rn-ctrl" data-name="locale" data-type="Droplist"
                   data-options="g_antLocales"></div>
          </div>
      </div>
      <script>
          var g_antMenuPos = [{label: 'In Header', value: 'header'}, {label: 'In Sider', value: 'sider'}];
          var g_antSiderPos = [{label: 'Outside', value: 'outside'}, {label: 'Inside', value: 'inside'}];
          var g_antThemes = [
              {label: 'None', value: ''},
              {label: 'Default', value: 'default'},
              {label: 'Dark', value: 'dark'},
              {label: 'Compact', value: 'compact'},
          ];
          var g_antLocales = [
              {label: '-Default-', value: ''}, 
              ${this.locales.map(value => JSON.stringify({value, label:value})).join(', ')}
              ];
      </script>

`
    }
}

module.exports = {AntdLayout}