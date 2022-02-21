/**
 * Основная статья: https://webpack.js.org/guides/asset-modules/
 * TypeScript: https://webpack.js.org/guides/typescript/#importing-other-assets
 */

const fs = require('fs')
const { isFileExists } = require('../../fileUtils')
const { wsSendCreateEntity } = require('../../wsSend')
const { isAssetModulesRules, mergeAssetModulesIntoConfig } = require('./AssetModulesUtils')
const { createAssetExample } = require('./createAssetExample')
const { createAssetTypes } = require('./AssetModulesTS')

class AssetModules {
    name = 'AssetModules'
    depends = ['WebPack']
    isInit = false
    isReady = false

    async init() {
        this.isInit = false
        this.isReady = false
        // Готовность данного агента определяется наличием в конфиге вебпака module.rules[].type = 'asset*'
        const {entities: {WebPack}} = require('../all')
        try {
            const configName = WebPack.getConfigName()
            const configExists = await isFileExists(configName)
            if (!configExists) return
            const wpConfigText = await fs.promises.readFile(configName, { encoding: 'utf8' })
            this.isInit = isAssetModulesRules(wpConfigText)
            this.isReady = !this.isInit
        } catch (e) {
            console.log('Cant init AssetModules', e)
        }
    }

    defaultParams = {
        rules: [{ extList: '', type: 'default' }],
        assetModuleFilename: '',
        pngExample: false,
        svgExample: false,
    }

    /**
     * @param {Object} params
     * @param {Array<{extList: string; type: string; filename: string; }>} params.rules Список правил. 
     * extList, for ex: 'pgg' | 'jpg,jpeg' | 'jpg jpeg'
     * type = 'default' | 'resource' | 'inline' | 'source'
     * filename: case to customize output filename is to emit some kind of assets to a specified directory
     * @param {string} params.assetModuleFilename  for ex: 'images/[hash][ext][query]'
     * @param {boolean} params.pngExample
     * @param {boolean} params.svgExample
     */
    async create(params) {
        const {entities: {WebPack, TypeScript}} = require('../all')
        // Модифицировать конфиг вебпака
        const configTaxon = await WebPack.loadConfigTaxon()
        mergeAssetModulesIntoConfig(params, configTaxon)
        await WebPack.saveConfigTaxon(configTaxon)
        wsSendCreateEntity(this.name, 'webpack.config.js updated')

        // Для JS и Babel все работает как в документации
        // Для TS нужно делать файл types/assets.d.ts и прописывать его в tsconfig.json
        if (TypeScript.isInit) {
            await createAssetTypes(params, (msg) => wsSendCreateEntity(this.name, msg))
        }

        if (params.pngExample) {
            await createAssetExample(this.name, 'png')
        }
        if (params.svgExample) {
            await createAssetExample(this.name, 'svg')
        }
    }

    description = `
<h2><img src="https://webpack.js.org/icon-square-small.85ba630cf0c5f29ae3e3.svg" width="48px" height="48px" />Asset Modules</h2>
<div>Asset Modules is a type of module that allows one to use asset files (fonts, icons, etc) without configuring additional loaders.</div>
<div><a href="https://webpack.js.org/guides/asset-modules/" target="_blank">Official guide</a></div>
<script src="assetModules.js"></script>
    `
    upgradeFormType = 'Assets'
    controls = `
<div class="rn-ctrl" data-name="rules" data-type="Array" data-item_tm="TmAssetItem" data-min="1" data-title="Rules" data-tm="TmCtrlAssetArray"></div>
<script id="TmCtrlAssetArray" type="text/html">
      <div>
        <h3>{{title}}</h3>
        <div class="rn-array"></div>
        <button type="button" class="rn-add-item">Add rule</button>
        <h4>Typical cases</h4>
        <div>
          <button type="button" id="presetsRasters">Raster images</button>
          <button type="button" id="presetsFonts">Font files</button>
          <button type="button" id="presetsSvg">Inline SVG</button>
        </div>
      </div>
</script>
<script id="TmAssetItem" type="text/html">
  <div style="display: flex; flex-direction: row;">
    <div class="rn-ctrl" data-type="String" data-name="extList" data-placeholder="File extensions">
      <i class="rn-validator" data-type="Regexp" data-regexp="/^[a-z\\d]+(\s*,*\\s*[a-z\\d]+)*$/" data-msg="Use space or comma as separator for file extensions"></i>
    </div>
    <div class="rn-ctrl" data-type="Droplist" data-name="type" data-options="g_assetTypes" data-value0="default">
    </div>
    <div class="rn-ctrl" data-type="String" data-name="filename" data-placeholder="Output filename"></div>
    <button type="button" class="rn-del-item">X</button>
  </div>
</script>
<script>
var g_assetTypes = [
    { label: 'default', value: 'default' },
    { label: 'resource', value: 'resource' },
    { label: 'inline', value: 'inline' },
    { label: 'source', value: 'source' },
];
</script>
<hr />
<div class="rn-ctrl" data-name="assetModuleFilename" data-type="String" data-title="Custom output filename"></div>
<div>Example: images/[hash][ext][query]</div>
<hr />
<div class="rn-ctrl" data-type="Checkbox" data-name="pngExample" data-title="Create PNG example"></div>
<div class="rn-ctrl" data-type="Checkbox" data-name="svgExample" data-title="Create SVG example"></div>
    `
}

module.exports = { AssetModules }