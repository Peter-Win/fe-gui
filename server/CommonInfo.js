const path = require('path')
const {getRootPath} = require('./fileUtils')
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
        packageManager: '', // Yarn | NPM=default
        bundler: '',
        language: '',
        transpiler: '',
        framework: '',
        styleCss: true,
        styleLess: false,
        codeStyle: '', // ESLint, Standard
    }
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
            props: CommonInfo.props,
            upgradeTarget: CommonInfo.upgradeTarget,
        })
    }

    /**
     * Получить общую информацию, которая затем будет использоваться другими сущностями при создании.
     * @param {{
     * common:{name:string,description:string,author:string,license:string},
     * tech:{packageManager:string,bundler:string,language:string,transpiler:string,framework:string,
     *   styleCss:boolean, styleLess:boolean},
     * extParams:{port:number}
     * }} data
     */
    static onCreateApp(data) {
        CommonInfo.setGlobalStatus(CommonInfo.glbStCreate)
        const {info} = CommonInfo
        // Сохранить данные
        Object.assign(CommonInfo.info, data.common)
        Object.assign(CommonInfo.tech, data.tech)
        Object.assign(CommonInfo.extParams, data.extParams)
    }
    static get isYarn() {
        return CommonInfo.tech.packageManager.toLowerCase() === 'yarn'
    }

    static getPreferStyler() {
        const {tech} = CommonInfo
        if (tech.styleLess) return 'LESS'
        if (tech.styleCss) return 'CSS'
        return ''
    }

    /**
     * @param {'render' | 'logic' | 'style'} type
     * @return {string}
     */
    static getExtension(type) {
        const {tech} = CommonInfo
        if (type === 'style') {
            if (tech.styleLess) {
                return 'less'
            }
            return 'css'
        }
        let ext = 'js'
        if (tech.language === 'TypeScript') {
            ext = 'ts'
        }
        if (type === 'render' && tech.framework === 'React') {
            ext += 'x'
        }
        return ext
    }

    /**
     * Заголовок приложения в виде строки для вставки в шаблоны js, ts, jsx, tsx
     * @return {string} Уже имеет кавычки и экранированные символы
     */
    static getTitleStr() {
        return JSON.stringify(CommonInfo.extParams.title)
    }
}

module.exports = {CommonInfo}