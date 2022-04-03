const {installPackage} = require('../commands/installPackage')
const {wsSendCreateEntity} = require('../wsSend')

class MobX {
    name = 'MobX'
    depends = ['React']
    isInit = false
    isReady = false

    async init() {
        const {entities} = require('./all')
        const {PackageJson, React} = entities
        this.isInit = PackageJson.isDependency('mobx')
        this.isReady = !this.isInit && React.isInit
    }

    async create() {
        const packages = 'mobx mobx-react-lite'
        await installPackage(this.name, packages, false)
        wsSendCreateEntity(this.name, `Use ReactComponent to create components with MobX support`, 'success')
    }

    description = `
<style>
header.mobx { display: flex; flex-direction: row; background: #035193; padding: 10px; align-items: center; }
.mobx h2 {font-size: 18px; color: white; padding-left: 1em;}
</style>
<header class="mobx">
  <img class="logo" src="https://mobx.js.org/img/mobx.png" alt="MobX" width="34px" height="34px" />
  <h2>MobX</h2>
</header>
<p>Simple, scalable state management.</p>
<p><a href="https://mobx.js.org/README.html" target="_blank">Official site</a></p>
  `
}

module.exports = {MobX}