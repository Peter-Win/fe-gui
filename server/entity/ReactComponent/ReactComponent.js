const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { createReactComponent, refOwners } = require('./ReactComponent.utils')
const { CommonInfo } = require('../../CommonInfo')
const { makeFullName } = require('../../fileUtils')
const { wsSendCreateEntity } = require('../../wsSend')
const { injectDemoCode } = require('../../sysUtils/injectDemoCode')
const { makeComponentCall } = require('./makeComponentCall')
const { mainFrameUpdate } = require('./mainFrameUpdate')

const makeCreateReactComponentParams = (clientParams) => {
    const {entities} = require('../all')
    const usePretty = entities.PackageJson.isDependency('pretty')
    return {
        ...clientParams,
        tech: CommonInfo.tech,
        usePretty,
        availInlineSnapshots: entities.Jest.availInlineSnapshots(),
        techVer: CommonInfo.techVer,
    }
}

class ReactComponent {
    name = 'ReactComponent'
    depends = ['React']
    isInit = false
    isReady = false
    isVisible = true

    async init() {
        const {entities} = require('../all')
        const {React, CSS, LESS, WebPack, CssModules, Jest, Storybook, MobX} = entities
        this.isReady = React.isInit
        if (!this.isReady) return
        this.isVisible = true
        this.controls = await fs.promises.readFile(path.join(__dirname, 'controls.html'))
        // Список стилей
        this.stylesList = [{ label: 'None', value: '' }]
        if (CSS.isInit) this.stylesList.push({ label: 'CSS', value: 'css' })
        if (LESS.isInit) this.stylesList.push({ label: 'LESS', value: 'less'})
        const moduleExts = await CssModules.getUsedExtensions(WebPack)
        moduleExts.forEach(ext => {
            const [m, e] = ext.split('.')
            if (e) this.stylesList.push({ label: `${e.toUpperCase()} module`, value: ext})
        })
        this.defaultParams.availJest = Jest.isInit
        this.defaultParams.availInlineSnapshots = Jest.availInlineSnapshots()
        this.defaultParams.availStorybook = Storybook.isInit
        this.defaultParams.availMobX = MobX.isInit
    }
    stylesList = []

    defaultParams = {
        name: '',
        folder: '',
        props: [],
        styles: '', // '', 'css', 'less', 'module.css', 'module.less'
        availJest: false,
        availInlineSnapshots: false,
        useInlineSnapshot: true,
        availStorybook: false,
        useStorybook: false,
        availMobX: false,
        useMobX: false,
        story: {
            compTitle: '',
            compDecorator: false,
            storyName: '',
        },
    }

    /**
     * @param {Object} params
     * @param {string} params.name The component name
     * @param {string} params.folder Owner folder of the component. The first segment is always "src".
     * @param {""|"css"|"less"|"module.css"|"module.less"} params.styles
     * @param {boolean} params.createFolder Create special folder for component in any case
     * @param {boolean} params.useReturn
     * @param {boolean} params.useForwardRef
     * @param {string}  params.refOwner key of refOwners dictionary
     * @param {boolean} params.useJest
     * @param {boolean} params.useInlineSnapshot
     * @param {boolean} params.openEditor // Try to open the component code in the editor.
     * @param {boolean} params.useMainFrame // Вставить вызов компонента на главную страницу
     * @param {boolean} params.useMobX
     * @param {{exportStore: boolean; fields:{fieldName:string}[]}} params.mobx
     * @param {{propName:string; isRequired:boolean; type: string; defaultValue: string;}[]} params.props
     */
    async create(params) {
        const {entities} = require('../all')
        const {PackageJson} = entities
        const makeFileName = (name) => path.normalize(path.join(makeFullName(params.folder), name))
        const res = createReactComponent(makeCreateReactComponentParams(params))
        wsSendCreateEntity(this.name, `New component: ${params.name}`)
        for (const folder of res.folders) {
            const fullName = makeFileName(folder)
            await fs.promises.mkdir(fullName)
            wsSendCreateEntity(this.name, `Created folder: ${fullName}`)
        }
        for (const {name, data} of res.files) {
            const fullName = makeFileName(name)
            await fs.promises.writeFile(fullName, data, {encoding: 'utf8'})
            wsSendCreateEntity(this.name, `Created file: ${fullName}`)
        }
        if (params.useMainFrame) {
            await injectDemoCode(`MainFrame.${CommonInfo.getExtension('render')}`, {
                ...mainFrameUpdate({ ...params, ...res }),
                log: (msg) => wsSendCreateEntity(this.name, msg),
            })
        }
        if (params.openEditor) {
            exec(`start ${makeFileName(res.files[0].name)}`)
        }
    }

    upgradeFormType = 'ReactComponent'

    get description() {
        return `
<h2>You can create a new React component here</h2>
<script src="reactComponent.js"></script>
<script>
  var g_compStyles = ${JSON.stringify(this.stylesList)};
  var g_refOwners = ${JSON.stringify(refOwners)};
</script>
`
    }
    controls = ''
}

module.exports = {ReactComponent, makeCreateReactComponentParams}