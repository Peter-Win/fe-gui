const {installPackage} = require('../commands/installPackage')
const {CommonInfo} = require('../CommonInfo')
const {buildTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName} = require('../fileUtils')
const {wsSendCreateEntity} = require('../wsSend')
const {getHiVersion} = require('../sysUtils/versions')
const {conditionalReactDomAlias} = require('../commands/conditionalReactDomAlias')

const webpackConfigAddon = `{
    devServer: { historyApiFallback: true },
    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom',
        },
    },
}`;

class ReactRouter {
    name = 'ReactRouter'
    depends = ['React']
    isInit = false
    isReady = false

    async init() {
        const {entities} = require('./all')
        this.isInit = entities.PackageJson.isDependency('react-router-dom')
        this.isReady = !this.isInit
    }

    /**
     * @param {{example: boolean}} params
     * @return {Promise<void>}
     */
    async create(params) {
        const {entities} = require('./all')
        const {WebPack} = entities
        const devPackages = []
        // we are maintain 6 version of React Router
        // https://github.com/gaearon/react-hot-loader/issues/1227
        await installPackage(this.name, ['@hot-loader/react-dom'], true, { force: true })
        const packages = ['history', 'react-router-dom']
        if (CommonInfo.tech.language === 'TypeScript') {
            devPackages.push('@types/react-router-dom')
        }
        if (packages.length) {
            await installPackage(this.name, packages.join(' '), false)
        }
        if (devPackages.length) {
            await installPackage(this.name, devPackages.join(' '), true)
        }
        await WebPack.setPart(webpackConfigAddon)
        if (params.example) {
            const dstName = makeSrcName('MainFrame.' + CommonInfo.getExtension('render'));
            await buildTemplate('RouterMainFrame.jsx', dstName);
            wsSendCreateEntity(this.name, `File "${dstName}" has been overwritten`);
        }

        // временный патч из-за отсутствия версии 18 @hot-loader/react-dom
        // see https://github.com/Peter-Win/fe-gui/issues/11
        const reactVer = await CommonInfo.findPackageVersion('react')
        if (getHiVersion(reactVer) > 17) {
            const fullIndexName = makeSrcName(`index.${CommonInfo.getExtension('render')}`)
            await buildTemplate('reactRouterIndex18.jsx', fullIndexName)
            wsSendCreateEntity(this.name, `Changed ${fullIndexName}`)
            // Требуется добавлять alias react-dom только для development
            await conditionalReactDomAlias(WebPack)
            wsSendCreateEntity(this.name, `Changed ${WebPack.getConfigName()}`)
        }
    }

    defaultParams = {example: false}
    upgradeFormType = 'ReactRouter'
    description = `
<style>
.react-router-hdr {display: flex; align-items: center;}
.react-router-hdr img {width: 36px; height: 36px;}
.react-router-hdr span { margin-left: 1em;}
#RRExMsg {display: none; color: #777;}
</style>
<script>
Rn.F.ReactRouter = function () {
    this.superClass = 'Upgrade';
    this.onUpdate = function () {
        $('#RRExMsg').toggle(this.ctrls.example.getValue());
    }
}
</script>
<div class="react-router-hdr">
<img src="https://reactrouter.com/favicon.ico" />
<span><b>React Router</b> is a collection of navigational components that compose declaratively with your application. </span>
</div>
<div><a href="https://reactrouter.com/" target="_blank" rel="noreferrer">Official site</a></div>
`
    controls = `
<div style="margin-top: 1em;">
  <div class="rn-ctrl" data-type="Checkbox" data-name="example" data-title="Generate an example"></div>
  <div id="RRExMsg"><b>Attention!</b> File &quot;MainFrame&quot; will be completely overwritten.</div>
</div>
    `
}

module.exports = {ReactRouter}