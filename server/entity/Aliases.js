const {isFileExists} = require('../fileUtils')
const {loadAliasesList, saveAliasesList} = require('./Aliases.utils')

class Aliases {
    name = 'Aliases'
    depends = ['WebPack']
    isInit = false
    isReady = false
    isVisible = false

    async init() {
        const {CommonInfo} = require('../CommonInfo')
        const {entities} = require('./all')
        this.isReady = CommonInfo.tech.bundler === 'WebPack'
        if (!this.isReady) return
        this.isVisible = true

        // Загрузить список псевдонимов из конфига вебпака. Этот список является главным.
        const isWebConfig = await isFileExists(entities.WebPack.getConfigName())
        if (isWebConfig) {
            const mainTaxon = await entities.WebPack.loadConfigTaxon()
            const aliases = loadAliasesList(mainTaxon)
            this.reservedKeys = aliases.filter(row => row.length === 1).reduce((acc, row) => ({...acc, [row[0]]: 1}), {})
            this.pairs = aliases.filter(row => row.length === 2)
        } else {
            this.reservedKeys = {}
            this.pairs = []
        }
    }

    reservedKeys = {}
    pairs = []

    defaultParams = {}

    /**
     * @param {Object} params
     * @param {Array<{oldKey: string; key: string; value: string;}>} params.pairs
     */
    async create(params) {
        await saveAliasesList(this.name, params.pairs)
    }

    upgradeFormType = 'Aliases'

    get description() {
        return `<h2>Webpack Aliases</h2>
<p>Create aliases to <code>import</code> or <code>require</code> certain modules more easily.</p>
<p>See <a href="https://webpack.js.org/configuration/resolve/#resolvealias" target="_blank">webpack documentation</a>.</p>
<script src="aliases.js"></script>
<script>
var AliasData = {
    reserved: ${JSON.stringify(this.reservedKeys)},
    pairs: ${JSON.stringify(this.pairs)},
};
</script>
<style>
.alias-row {display: flex; flex-direction: row; margin: .1em 0;}
.alias-row > div {margin-right: .2em;}
.alias-row input[name=value] { width: 30em; }
</style>
    `}

    controls = `
<div class="rn-ctrl" data-name="pairs" data-type="Array" 
  data-item_tm="TmAliasRow" data-tm="TmCtrlAliasesArray"></div>
<datalist id="foldersForAliases"><option value="src"></datalist>
<script type="text/html" id="TmAliasRow">
  <div class="alias-row">
    <div class="rn-ctrl" data-name="oldKey" data-type="Hidden" data-value0=""></div>
    <div class="rn-ctrl" data-type="String" data-name="key"
      data-placeholder="Alias name">
      <b class="rn-validator" data-type="NonEmpty" data-msg="Alias name is required"></b>
      <b class="rn-validator" data-type="Regexp" data-regexp="/^[a-z][a-z\\d]*([-_][a-z\\d]+)*$/i"
        data-msg="Use camelCase, snake_case or kebab-case notation"></b>
      <b class="rn-validator" data-type="AliasReserved" data-msg="This name is reserved"></b>
      <b class="rn-validator" data-type="AliasDuplicate" data-msg="This name is duplicated"></b>
    </div>
    <div class="rn-ctrl" data-type="String" data-name="value" data-list="foldersForAliases"
      data-placeholder="Path relative to the project root">
      <b class="rn-validator" data-type="NonEmpty" data-msg="Relative path is required"></b>
      <b class="rn-validator" data-type="SrcFolder" data-msg="Invalid folder name"></b>
    </div>
    <button type="button" class="rn-del-item">X</button>
  </div>
</script>
<script id="TmCtrlAliasesArray" type="text/html">
  <div>
    <div class="rn-array"></div>
    <button type="button" class="rn-add-item">Добавить элемент</button>
  </div>
</script>
    `
}

module.exports = {Aliases}