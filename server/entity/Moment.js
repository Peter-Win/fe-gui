const {installPackage} = require('../commands/installPackage')
const {wsSendCreateEntity} = require('../wsSend')
const {parseInstruction, parseExpression} = require('../parser/parseExpression')
const { ReaderCtx } = require('../parser/ReaderCtx')
const { findConfigRoot, findPath } = require('./WebPack.utils')
const { injectImport } = require('../parser/injectImport')
const {makeSrcName} = require('../fileUtils')
const {readRows, writeRows} = require('../sysUtils/textFile')
const {CommonInfo} = require('../CommonInfo')

const icon = `<svg width="40px" height="40px" viewBox="0 0 40 40">
<ellipse stroke-width="3" cx="20" cy="20" rx="18.5" ry="18.5" fill="0" stroke="#000"></ellipse>
<path fill-rule="evenodd" d="M20,36 C28.836556,36 36,28.836556 36,20 C36,11.163444 28.836556,4 20,4 C11.163444,4 4,11.163444 4,20 C4,28.836556 11.163444,36 20,36 Z M20,5 C19.4477153,5 19,5.44994876 19,6.00684547 L19,19 L11.9970301,19 C11.4463856,19 11,19.4438648 11,20 C11,20.5522847 11.4556644,21 11.9953976,21 L21,21 L21,6.00087166 C21,5.4481055 20.5561352,5 20,5 Z"></path>
</svg>`

const site = 'https://momentjs.com/'

class Moment {
    name = 'Moment'
    depends = []
    isInit = false
    isReady = false

    async init() {
        const {entities} = require('./all')
        const {PackageJson} = entities
        this.isInit = PackageJson.isDependency('moment')
        this.isReady = !this.isInit
    }

    async create(params) {
        const {mainLocale, locales} = params
        await installPackage(this.name, 'moment', false);
        // webpack
        await installPackage(this.name, 'moment-locales-webpack-plugin');
        const {entities: {WebPack}} = require('./all')
        const wpTaxon = await WebPack.loadConfigTaxon()

        addMomentToWebPackConfig(wpTaxon, locales)

        await WebPack.saveConfigTaxon(wpTaxon)
        wsSendCreateEntity(this.name, `Updated ${WebPack.getConfigName()}`)

        // App
        if (mainLocale) {
            const appName = makeSrcName(`App.${CommonInfo.getExtension('render')}`)
            const appRows = await readRows(appName)
            addMomentToApp(appRows, mainLocale)
            await writeRows(appName, appRows)
            wsSendCreateEntity(this.name, `Updated ${appName}`)
        }

    }
    description = `
    <style>
    .moment-header {
        display:flex; flex-direction:row; gap:24px; align-items:center; background: #000;
        padding: 10px; color: white; margin-bottom: 20px;}
    .moment-header h2 {}
    .moment-header ellipse {stroke: #fff;}
    .moment-header path {fill: rgba(143,143,143,0.939216);}
    .sel-pair {margin: 6px; display: inline-block;}
    .sel-pair .act { padding: 4px 8px; border-radius: 5px 0 0 5px; border-right: thin solid #888;}
    .sel-pair .act.current {background: #8bc540;}
    .sel-pair .del { padding: 4px; border-radius: 0 5px 5px 0;}
    .cur-loc {font-size: 140%;}
    #availLocales button {margin: 5px;}
    #selectedLocales {margin-bottom: 20px;}
    </style>
    <div class="moment-header">
      ${icon}
      <h2>Moment.js</h2>
    </div>
    <div>
      See details here: <a href="${site}" target="_blank">${site}</a>
    </div>
    `

    controls = `
    <hr />
    <div>
      <div class="rn-ctrl" data-name="mainLocale" data-type="Hidden"></div>
      <div class="rn-ctrl" data-name="locales" data-type="Hidden"></div>
    </div>

    <div id="momentBox">
      <div class="cur-loc">Current locale: <span id="curMomentLoc">not selected</span></div>
      <h4>Selected locales:</h4>
      <div id="selectedLocales"></div>
      <h4>Available locales:</h4>
      <div id="availLocales"></div>
      <h4>Example of current locale using:</h4>
      <div id="locExample"></div>
    </div>
    <script>
    var box = $('#momentBox');
    function onMoment() {
        var ctrls = Rn.curPage().forms.upgrade.ctrls;
        var i, locales = moment.locales();
        var availButtons = {};
        var selectedPairs = {};
        function changeLocales(loc, isAdd) {
            var list = ctrls.locales.getValue() || [];
            if (isAdd) {
                list.push(loc);
            } else {
                delete selectedPairs[loc];
                var pos = list.indexOf(loc);
                if (pos>=0) list.splice(pos, 1);
                if (loc === ctrls.mainLocale.getValue()) {
                    setCurLocale(list[0] || "");
                }
            }
            console.log(list);
            ctrls.locales.setValue(list);
        }
        function setCurLocale(loc) {
            ctrls.mainLocale.setValue(loc);
            moment.locale(loc);
            $('#locExample').text(moment.months().join(', '));
            $('#curMomentLoc').text(loc || 'not selected');
            $('#selectedLocales .act').removeClass('current');
            $('.act', selectedPairs[loc]).addClass('current');
        }
        function addSelected(loc) {
            var pair = $('<div>').addClass('sel-pair').appendTo('#selectedLocales');
            $('<button>').addClass('act').attr({type: 'button', title: 'Set current locale'}).text(loc).appendTo(pair).on('click', function(){
                selectedPairs[loc] = pair;
                setCurLocale(loc);
            });
            $('<button>').addClass('del').attr({type: 'button', title: 'Delete'}).text('X').appendTo(pair).on('click', function(){
                Rn.enable(availButtons[loc], true);
                pair.remove();
                changeLocales(loc, false);
            });
            if (!ctrls.mainLocale.getValue()) setCurLocale(loc);
        }
        function onLoc(loc) {
            var btn = $('<button>').attr({type: 'button'}).text(loc).appendTo('#availLocales')
            .on('click', function(){
                addSelected(loc);
                Rn.enable(btn, false);
                changeLocales(loc, true)
            });
            availButtons[loc] = btn;
        }
        for (i=0; i<locales.length; i++) onLoc(locales[i]); 
    }
    var lib = $('<script>').appendTo(box)
        .attr({src: "https://momentjs.com/downloads/moment-with-locales.min.js"})
        .on('load', onMoment);

    </script>
        `    
}

/**
 * 
 * @param {Taxon} wpTaxon IN/OUT
 * @param {string[]} locales 
 */
const addMomentToWebPackConfig = (wpTaxon, locales) => {
    // insert import
    const impCode =  `const MomentLocalesPlugin = require('moment-locales-webpack-plugin');`
    const impTaxon = parseInstruction(ReaderCtx.fromText(impCode)).createTaxon()
    let impPos = 0
    while (impPos < wpTaxon.subTaxons.length) {
        const rowTaxon = wpTaxon.subTaxons[impPos]
        if (rowTaxon.type !== 'TxVarDecl' || rowTaxon.declType !== 'const') break
        if (rowTaxon.subTaxons.length !== 1) break
        const op = rowTaxon.subTaxons[0]
        if (op.type !== 'TxBinOp') break
        const right = op.right
        if (right.subTaxons.length !== 2 || right.subTaxons[0].name !== 'require') break
        impPos++
    }
    wpTaxon.addTaxon(impTaxon, impPos)

    // add plugin
    const txMomentPlugin = parseExpression(ReaderCtx.fromText(`new MomentLocalesPlugin({
        localesToKeep: ${JSON.stringify(locales)},
    })`)).createTaxon()
    const txRoot = findConfigRoot(wpTaxon)
    const txPlugins = findPath(txRoot, 'plugins')
    // Предполагается, что плагины в конфиге уже есть
    txPlugins.addTaxon(txMomentPlugin)
}

/**
 * 
 * @param {string[]} rows 
 * @param {string} mainLocale 
 */
const addMomentToApp = (rows, mainLocale) => {
    // Вообще желательно не вызывать эту функцию, если локаль не указана
    if (!mainLocale) return false
    let pos = rows.findIndex(row => row.startsWith('const App'))
    if (pos<0) pos = rows.length
    rows.splice(pos, 0, `moment.locale(${JSON.stringify(mainLocale)});`, '')
    injectImport(rows, `import moment from "moment";`)
    return true
}

module.exports = {Moment, addMomentToWebPackConfig, addMomentToApp}