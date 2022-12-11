/**
 * Ant Design ver 5+
 * Учитывается наличие библиотек moment | dayjs.
 * Если какая-то уже установлена, то она используется. Если нет, то предлагается выбор.
 * Приоритет: dayjs
 */
const fsPromises = require('node:fs/promises')
const path = require('node:path')
const {CommonInfo} = require('../CommonInfo')
const {createEntity} = require('../commands/createEntity')
const {makeSrcName, isFileExists} = require('../fileUtils')
const {readRows, writeRows} = require('../sysUtils/textFile')
const {injectImport} = require('../parser/injectImport')
const {wsSendCreateEntity} = require('../wsSend')
const {installPackageSmart} = require('../commands/installPackage')

const reactLib = 'antd'
const vueLib = 'ant-design-vue'
 
class Antd5 {
    name = 'Antd5'
    depends = ['React', 'Vue']
    isInit = false
    isReady = false
    fw = '' // 'React' | 'Vue'
    lib = '' // reactLib | vueLib
    time = '' // dayjs | moment
    vMoment = null

    async init() {
        const {entities: {PackageJson, React, Vue}} = require('./all')
        const forReact = PackageJson.isDependency(reactLib)
        const forVue = PackageJson.isDependency(vueLib)

        const [vDayjs, vMoment] = await Promise.all([
            CommonInfo.findPackageVersion("dayjs"),
            CommonInfo.findPackageVersion("moment"),
        ])
        this.time = vMoment ? 'moment' : 'dayjs'
        this.defaultParams.time = this.time
        this.vMoment = vMoment
        if (React.isInit) {
            this.fw = 'React'
            this.lib = reactLib
        } else if (Vue.isInit) {
            this.fw = 'Vue'
            this.lib = vueLib
        }

        this.isInit = forReact || forVue
        if (!this.isInit) {
            this.isReady = React.isInit || Vue.isInit
        }
    }

    defaultParams = {
        icons: true,
        time: 'dayjs',
        DatePicker: true,
        TimePicker: false,
        Calendar: false,
    }

    async create(params) {
        const {time} = params
        const {entities} = require('./all')
        const {CSS, Moment} = entities
        // Необходимо наличие CSS-loader
        if (!CSS.isInit) {
            await createEntity(entities, CSS.name, {})
        }
        if (time === 'moment' && !this.vMoment) {
            // Если выбран Moment, но он еще не установлен - установить
            await createEntity(entities, Moment.name, {
                mainLocale: 'en', locales: ['en'],
            })
        }

        // Установить зависимости
        const onFW = (dict) => dict[this.fw] || ''
        const packages = [onFW({ Vue: vueLib, React: reactLib})]
        if (params.icons) {
          packages.push(onFW({React: '@ant-design/icons', Vue: '@ant-design/icons-vue'}))
        }

        await installPackageSmart(this.name, packages, false)

        // TODO: Надо разделить агенты для React и Vue, 
        // т.к. с выходом React Antd v5 пошел в другую сторону. Различия будут расти.
        if (this.fw === 'React') {
            const dstName = makeSrcName(`App.${CommonInfo.getFwExt()}`)
            const rows = await readRows(dstName)
            injectImport(rows, `import "antd/dist/reset.css";`)
            await writeRows(dstName, rows)
            wsSendCreateEntity(this.name, 'Updated: '+dstName)
        } else if (this.fw === 'Vue') {
            const dstName = makeSrcName(`index.${CommonInfo.getExtension('logic')}`)
            const cssCmd = `import 'ant-design-vue/dist/antd.css';`
            const rows = await readRows(dstName)
            injectImport(rows, `import 'ant-design-vue/dist/antd.css';`)
            injectImport(rows, `import Antd from 'ant-design-vue';`)
            const pos = rows.findIndex(row => row.startsWith('const app ='));
            if (pos >=0 ) rows.splice(pos+1, 0, `app.use(Antd);`)
            await writeRows(dstName, rows)
            wsSendCreateEntity(this.name, 'Updated: '+dstName)
        }

        if (time === 'moment') {
            // TimePicker created from DatePicker
            if (params.TimePicker) params.DatePicker = true
            // create components
            const components = ['DatePicker', 'TimePicker', 'Calendar']
            for (let compName of components) {
                if (params[compName]) {
                    await createComponent(this.name, compName)
                }
            }
        }
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
  <script>
  Rn.F.Antd5 = function() {
    this.superClass = 'Upgrade';
    this.onUpdate = function () {
        var ctrls = this.ctrls;
        var time = ctrls.time.getValue();
        var isStdTime = time === 'dayjs';
        $('#GenAnt5Comp').toggle(!isStdTime);
        var isTimePicker = time === 'moment' && ctrls.TimePicker.getValue();
        ctrls.DatePicker.enable(!isTimePicker);
        if (isTimePicker) ctrls.DatePicker.setValue(true);
    }
  }
</script>
  `
      }

    get controls() { return `
<div class="rn-ctrl" data-name="icons" data-type="Checkbox" data-title="Install icons library"></div>
<hr />
<h3>Date library</h3>
<div>
  See details here: &nbsp;
  <a href="https://ant.design/docs/react/use-custom-date-library" target="_blank">Use custom date library</a>
</div>
<div class="rn-ctrl" data-name="time" data-type="Radiobox"
      data-options="g_timeLib" data-radio_tm="TmRadioItem"></div>
<script>
var g_timeLib = [{label: 'Day.js (default for Ant Design)', value: 'dayjs'}, {label: 'Moment', value: 'moment'}];
</script>
${!this.vMoment ? `<div style="font-size: 80%; color: #555">
    If you want to use Moment, it is recommended that you first install the appropriate addon. 
    Because there you can make the desired settings.
</div>` : ""}
<hr />
<div id="GenAnt5Comp">
  <div class="rn-ctrl" data-name="DatePicker" data-type="Checkbox" data-title="Generate DatePicker component"></div>
  <div class="rn-ctrl" data-name="TimePicker" data-type="Checkbox" data-title="Generate TimePicker component"></div>
  <div class="rn-ctrl" data-name="Calendar" data-type="Checkbox" data-title="Generate Calendar component"></div>
  <div style="font-size: 80%; color: #555">
    Components will be generated in folder: src/components
  </div>
</div>
`
    }
    upgradeFormType = 'Antd5'
}

const createComponentRows = (compName, isTS) => {
    let rows = []
    if (compName === 'TimePicker') {
        rows = 
`import * as React from 'react';
import type { Moment } from 'moment';
import type { PickerTimeProps } from 'antd/es/date-picker/generatePicker';
import { DatePicker } from './DatePicker';
export interface PropsTimePicker extends Omit<PickerTimeProps<Moment>, 'picker'> {}
export const TimePicker = React.forwardRef<any, PropsTimePicker>((props, ref) => (
  <DatePicker {...props} picker="time" mode={undefined} ref={ref} />
));
TimePicker.displayName = 'TimePicker';`.split('\n')
        if (!isTS) {
            rows = rows.filter(row => !/(type|interface)/.test(row))
            rows = rows.map(row => row.replace('<any, PropsTimePicker>', ''))
        }
    } else {
        const genSettings = {
            DatePicker: {
                gen: 'generatePicker',
                genPath: 'antd/es/date-picker/generatePicker',
            },
            Calendar: {
                gen: 'generateCalendar',
                genPath: 'antd/es/calendar/generateCalendar',
            },
        }
        const settings = genSettings[compName]
        if (isTS) rows.push(`import type { Moment } from 'moment';`)
        rows.push(`import momentGenerateConfig from 'rc-picker/lib/generate/moment';`)
        rows.push(`import ${settings.gen} from '${settings.genPath}';`)
        rows.push(`export const ${compName} = ${settings.gen}${isTS ? '<Moment>':''}(momentGenerateConfig);`)
    }
    return isTS ? rows.map(row => row.replace(/'/g, '"')) : rows
}

const createComponent = async (entityName, compName) => {
    const compFolder = makeSrcName('components')
    if (! await isFileExists(compFolder)) {
        await fsPromises.mkdir(compFolder)
        wsSendCreateEntity(entityName, 'Created folder: '+compFolder)
    }
    const ext = CommonInfo.getExtension('render')
    const isTS = ext[0] === 't'
    const fileName = path.join(compFolder, `${compName}.${ext}`)
    const rows = createComponentRows(compName, isTS)
    await writeRows(fileName, rows)
    wsSendCreateEntity(entityName, 'Created component file: '+fileName)
}

module.exports = {Antd5, createComponentRows}