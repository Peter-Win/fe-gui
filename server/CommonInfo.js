const path = require('path')
const {getRootPath} = require('./fileUtils')
const { PMgrNpm } = require('./packageManagers/PMgrNpm')
const {wsSend} = require('./wsServer')

class CommonInfo {
    static glbStLoad = 'load'
    static glbStInit = 'init'
    static glbStError = 'error'
    static glbStCreate = 'create'
    static glbStReady = 'ready'
    static glbStUpgrade = 'upgrade'
    static _globalStatus = "" // glbSt*
    static getGlobalStatus() {
        return CommonInfo._globalStatus
    }
    static setGlobalStatus(status) {
        if (status) {
            CommonInfo._globalStatus = status
        }
        wsSend('globalStatus', CommonInfo._globalStatus)
    }

    // Фактически, поля из package.json (За исключением folderName)
    // При создании новой сущности PackageJson отсюда берутся данные.
    // А при инициализации наоборот - поля здесь заполняются из сущности.
    static info = {
        folderName: path.basename(getRootPath()),
        private: true,
        name: '',
        description: '',
        author: '',
        license: 'ISC',
    }
    static tech = {
        packageManager: 'NPM', // Yarn | NPM=default
        bundler: '',
        language: 'JavaScript',
        transpiler: '',
        framework: '',
        styleCss: true,
        styleLess: false,
        styleSass: false,
        preferStyle: '', // css, less, sass, scss
        codeStyle: '', // ESLint, Standard
        unitTesting: '',
        vcs: '',
    }
    static techVer = {} // optional version of tech
    static props = {}
    static extParams = {
        port: 2222,
        title: 'Hello, World!'
    } // Приходит с клиента при создании приложения
    static upgradeTarget = ''
    static send() {
        wsSend('commonInfo', {
            common: CommonInfo.info,
            tech: CommonInfo.tech,
            techVer: CommonInfo.techVer,
            props: CommonInfo.props,
            upgradeTarget: CommonInfo.upgradeTarget,
            extParams: CommonInfo.extParams,
        })
    }

    /**
     * Получить общую информацию, которая затем будет использоваться другими сущностями при создании.
     * @param {Object} data
     * @param {{name:string; description:string; author:string; license:string}} data.common
     * @param {{packageManager:string; bundler:string; language:string; transpiler:string; framework:string;
     *   styleCss:boolean; styleLess:boolean}} tech
     * @param {{framework?: string}} techVer example: '17.0.2'
     * @param {{port:number}} extParams
     */
    static onCreateApp(data) {
        CommonInfo.setGlobalStatus(CommonInfo.glbStCreate)
        const {info} = CommonInfo
        // Сохранить данные
        Object.assign(CommonInfo.info, data.common)
        Object.assign(CommonInfo.tech, data.tech)
        Object.assign(CommonInfo.techVer, data.techVer)
        Object.assign(CommonInfo.extParams, data.extParams)
    }

    static packageManager = new PMgrNpm()

    static getPreferStyler() {
        const {tech} = CommonInfo
        if (tech.styleLess) return 'LESS'
        if (tech.styleSass) return 'Sass'
        if (tech.styleCss) return 'CSS'
        return ''
    }

    /**
     * @param {'render' | 'logic' | 'style'} type
     * @return {string} For example: less, css, js, jsx, ts, tsx
     */
    static getExtension(type) {
        const {tech} = CommonInfo
        if (type === 'style') {
            return this.tech.preferStyle || 'css'
        }
        let ext = 'js'
        if (tech.language === 'TypeScript') {
            ext = 'ts'
        }
        if (type === 'render' && (tech.framework || '').startsWith('React')) {
            ext += 'x'
        }
        // К сожалению, кое-где уже ожидается файл типа jsx/tsx. Если оставить vue, будут ошибки.
        // if (type === 'render' && tech.framework === 'Vue') {
        //     ext = 'vue'
        // }
        return ext
    }

    /**
     * @deprecated use getCodeExts
     */
    static getExtsList() {
        const exts = {js:1}
        exts[CommonInfo.getExtension('logic')] = 1
        exts[CommonInfo.getExtension('render')] = 1
        return Object.keys(exts)
    }

    /**
     * Заголовок приложения в виде строки для вставки в шаблоны js, ts, jsx, tsx
     * @return {string} Уже имеет кавычки и экранированные символы
     */
    static getTitleStr() {
        return JSON.stringify(CommonInfo.extParams.title)
    }

    /**
     * Получить реально используемую версию пакета
     * Правильный способ: npm list <name> --json
     *  Но это очень медленно работает.
     * Поэтому используем прямое чтение файлов менеджера пакетов.
     * @param {string} name For ex: 'react'
     * @returns {Promise<string|null>}
     */
    static async findPackageVersion(name) {
        return CommonInfo.packageManager.findPackageVersion(name)
    }

    /**
     * 
     * @param {Record<string, {isInit: boolean}>} entities 
     * @returns {Set<string>} example: {'js', 'ts', 'tsx'}
     */
    static makeCodeExts() {
        const result = new Set()
        const { tech } = CommonInfo
        const isTS = tech.language === 'TypeScript'
        result.add(isTS ? 'ts' : 'js')
        switch (tech.framework) {
            case 'React':
                result.add(isTS ? 'tsx' : 'jsx')
                break
            case 'Vue':
                result.add('vue')
                result.add(isTS ? 'tsx' : 'jsx')
                break
        }
        return result
    }
}

module.exports = {CommonInfo}