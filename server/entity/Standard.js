const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('../commands/installPackage')
const {wsSend} = require('../wsServer')

const badge1Url = 'https://cdn.rawgit.com/standard/standard/master/badge.svg'
const badge2Url = 'https://img.shields.io/badge/code_style-standard-brightgreen.svg'

class Standard {
    name = 'Standard'
    depends = ['Babel', 'WebPack']
    isInit = false
    isReady = false

    async init() {
        const {entities: {PackageJson}} = require('./all')
        this.isInit = PackageJson.isDevDependency('standard')
        if (this.isInit) {
            CommonInfo.tech.codeStyle = this.name
        } else {
            this.isReady = CommonInfo.tech.language === 'JavaScript' && !CommonInfo.tech.codeStyle
        }
    }

    async create(params) {
        await installPackage(this.name, 'standard')
        const {entities: {PackageJson, Readme}} = require('./all')
        await PackageJson.update((pj) => {
            pj.data.standard = {
                ignore: ["fe-gui"],
            }
            const addScript = (use, name, isFix) => {
                if (use) {
                    let cmd = CommonInfo.isYarn ? 'yarn' : 'npm'
                    cmd += ' standard'
                    if (isFix) cmd += ' --fix'
                    pj.addScript(name, cmd)
                }
            }
            addScript(params.useCheck, params.cmdCheck, false)
            addScript(params.useFix, params.cmdFix, true)
        })
        if (params.useBadge1 || params.useBadge2) {
            await Readme.update((list0) => {
                let list = list0
                if (params.useBadge1) {
                    const badge1 = `[![JavaScript Style Guide](${badge1Url})](https://github.com/standard/standard)`
                    list = Readme.addBadge(list, badge1)
                }
                if (params.useBadge2) {
                    const badge2 = `[![JavaScript Style Guide](${badge2Url})](https://standardjs.com)`
                    list = Readme.addBadge(list, badge2)
                }
                wsSend('createEntityMsg', {name: 'Standard', message: 'Update file '+Readme.getFileName()})
                return list
            })
        }
    }

    description = `
<style>
.estd-frame {}
.estd-header {display: flex; align-items: center; margin-bottom: 1em;}
.estd-header > img {width: 52px; height: 60px;}
.estd-header > span {font-size: 40px; margin-left: .3em;}
.estd-frame li {margin: .4em 0 .4em 1em }
.estd-frame code {color: #050; font-weight: bold;}
.estd-badges-prompt, .estd-scripts-prompt {margin-top: 1em;}
.estd-badges {display: flex;}
.estd-badges > div {
    display: flex;
    border: thin solid silver;
    padding: .4em;
    margin-right: 1em;
    align-items: center;
    border-radius: 6px;
}
</style>
<div class="estd-frame">
    <div class="estd-header">
      <img src="https://cdn.rawgit.com/standard/standard/master/sticker.svg" alt="Standard - JavaScript Style Guide"/>
      <span>JavaScript Standard Style</span>
    </div>
    <div>
      <p>This module saves you (and others!) time in three ways:</p>
      <ul>
        <li><b>No configuration.</b> 
          The easiest way to enforce code quality in your project. No decisions to make. 
          No <code>.eslintrc</code> files to manage. It just works.
        </li>
        <li>
          <b>Automatically format code.</b> 
          Just run <code>standard --fix</code> and say goodbye to messy or inconsistent code.
        </li>
        <li>
          <b>Catch style issues & programmer errors early.</b> 
          Save precious code review time by eliminating back-and-forth between reviewer & contributor.
        </li>
      </ul>
      <p>
        See more on <a href="https://standardjs.com/" target="_blank">Official site</a>
      </p>
    </div>
</div>
`
    controls = `
<div class="estd-scripts-prompt">You can add scripts in package.json:</div>
<div class="ctrl-line">
  <div class="rn-ctrl" data-name="useCheck" data-type="Checkbox"></div>
  <div class="rn-ctrl" data-name="cmdCheck" data-type="String" data-title="Script for code check" data-tm="TmScriptName">
    <b class="rn-validator" data-type="ScriptName" data-use="useCheck"></b>
  </div>
</div>
<div class="ctrl-line">
  <div class="rn-ctrl" data-name="useFix" data-type="Checkbox"></div>
  <div class="rn-ctrl" data-name="cmdFix" data-type="String" data-title="Script for automatically format code" data-tm="TmScriptName">
    <b class="rn-validator" data-type="ScriptName" data-use="useFix"></b>  
  </div>
</div>
<div class="estd-badges-prompt">
You can include one of these badges in your readme to let people know that your code is using the standard style.
</div>
<div class="estd-badges">
  <div>
    <div class="rn-ctrl" data-name="useBadge1" data-type="Checkbox"></div>
    <img src="${badge1Url}" />
  </div>
  <div>
    <div class="rn-ctrl" data-name="useBadge2" data-type="Checkbox"></div>
    <img src="${badge2Url}" />
  </div>
</div>
`
    defaultParams = {
        useBadge1: true,
        useBadge2: false,
        useCheck: true,
        cmdCheck: 'style-check',
        useFix: true,
        cmdFix: 'style-fix',
    }
}

module.exports = {Standard}