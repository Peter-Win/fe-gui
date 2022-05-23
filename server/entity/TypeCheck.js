/**
 * In the case of using Babel or SWC for transpilation,
 * it will be useful to use TypeScript for type checking.
 * See https://www.typescriptlang.org/docs/handbook/babel-with-typescript.html
 */
const { installPackageSmart } = require('../commands/installPackage')
const {CommonInfo} = require('../CommonInfo')
const { wsSendCreateEntity } = require('../wsSend')

const rxScriptName = /^[a-z][a-z0-9]*([-_:][a-z0-9]+)*$/i

class TypeCheck {
    name = 'TypeCheck'
    depends = ['WebPack', 'TypeScript', 'Babel', 'SWC']
    isInit = false
    isReady = false

    async init() {
        // Criteria for init: the presence of a script tsc --noEmit
        // Criteria for ready: language is TypeScript, but transpiler is not TypeScript and not init
        const {entities} = require('../entity/all')
        const {PackageJson} = entities

        const s = Object
            .entries(PackageJson.data.scripts || {})
            .find(([key, value]) => /tsc.*\s+--noEmit/.test(value))
        this.isInit = !!s
        const {tech} = CommonInfo
        this.isReady = !this.isInit && tech.language === 'TypeScript' && tech.transpiler !== 'TypeScript'
    }

    defaultParams = {
        scriptName: 'type-check',
        useWatch: false,
        watchScriptName: 'type-check:watch',
    }
    async create(params) {
        const {createEntity} = require('../commands/createEntity')
        const {entities} = require('../entity/all')
        const {TypeScript, PackageJson, React, Vue} = entities
        const log = (msg, t) => wsSendCreateEntity(this.name, msg, t)
        // install non-primary TypeScript
        if (!TypeScript.isInit) {
            log(`Wait for TypeScript install...`)
            await createEntity(entities, TypeScript.name, {isPrimary: false})
        }

        let tsc = 'tsc'
        if (React.isInit) {
            await React.installTS(this.name)
        }
        if (Vue.isInit) {
            tsc = 'vue-tsc'
            await Vue.installTS(TypeScript, log, this.name)
            await installPackageSmart(this.name, [tsc])
        }

        await PackageJson.update(() => {
            const {scripts} = PackageJson.data
            scripts[params.scriptName] = `${tsc} --noEmit`;
            if (params.useWatch) {
                scripts[params.watchScriptName] = `${tsc} --noEmit --watch`;
            }
        }, log)
    }

    upgradeFormType = 'TypeCheck'

    get description() {
        return `
<h2>Using ${CommonInfo.tech.transpiler} with TypeScript</h2>
<p>
    This technique is a hybrid approach, using ${CommonInfo.tech.transpiler} to generate your JS files,
    and then using TypeScript to do type checking and .d.ts file generation.
</p>
<p><a href="https://www.typescriptlang.org/docs/handbook/babel-with-typescript.html" target="_blank">See more...</a></p>
<script>
Rn.F.TypeCheck = function() {
    this.superClass = 'Upgrade';
    this.onUpdate = function() {
        var useWatch = this.ctrls.useWatch.getValue();
        this.ctrls.watchScriptName.show(useWatch);
    }
}
</script>
`
    }
    controls = `
<hr />
<div class="rn-ctrl" data-name="scriptName" data-type="String" data-title="Script name">
  <b class="rn-validator" data-type="NonEmpty" data-msg="Script name is required"></b>
  <b class="rn-validator" data-type="Regexp" data-msg="Invalid script name"
    data-regexp=${JSON.stringify(rxScriptName.toString())}></b>
</div>
<div class="rn-ctrl" data-name="useWatch" data-type="Checkbox" data-title="Use watch script"></div>
<div class="rn-ctrl" data-name="watchScriptName" data-type="String" data-title="Watch script name">
  <b class="rn-validator" data-type="NonEmpty" data-msg="Script name is required"></b>
  <b class="rn-validator" data-type="Regexp" data-msg="Invalid script name"
    data-regexp=${JSON.stringify(rxScriptName.toString())}></b>
</div>
    `
}

module.exports = {TypeCheck}