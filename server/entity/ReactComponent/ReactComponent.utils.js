const { camelToKebab, camelToLower } = require("../../parser/nameConversion")
const { createJest } = require('./createJest')
const { newMobxInstance } = require('./newMobxInstance')
const { createMobxStore } = require('./createMobxStore')
const { createStorybook } = require('./createStorybook')
const { getHiVersion } = require("../../sysUtils/versions")

const reactImport = 'import * as React from "react";';

const refOwners = {
    '': { label: 'container', code: '', refType: 'HTMLDivElement' },
    button: { label: 'button', code: `<button ref={ref} type="button">The Button</button>`, refType: 'HTMLButtonElement' },
    input: { label: 'input', code: '<input ref={ref} type="string" />', refType: 'HTMLInputElement' },
    select: { label: 'select', code: '<select ref={ref}></select>', refType: 'HTMLSelectElement' },
    textarea: { label: 'textarea', code: '<textarea ref={ref}></textarea>', refType: 'HTMLTextAreaElement' },
}

/**
 * @param {Object} params
 * @param {string} params.iname interface name
 * @param {{propName:string; isRequired: boolean; type: string; defaultValue: string}[]} params.props
 * @param {string} params.mobxClassName
 * @returns {string[]}
 */
const createPropsInterface = ({iname, props, mobxClassName}) => {
    const res = [`interface ${iname} {`]
    props.forEach(({propName, isRequired, type}) => {
        const type1 = type === 'MobX store' ? mobxClassName : type
        const row = `  ${propName}${isRequired ? '' : '?'}: ${type1};`
        res.push(row)
    })
    res.push('}')
    return res
}

// Пока что используются простые типы, т.к со сложными пока не понятно как для них сделать интерфейс.
// Кроме того, нет механизма, который находит импорты для используемых сущностей.
const propTypesMap = {
    'boolean': 'bool',
    'React.ReactNode': 'node',
    'React.ReactElement': 'element',
}


/**
 * @param {Object} params
 * @param {{propName:string; isRequired: boolean; type: string; defaultValue: string}[]} params.props
 * @param {string?} mobxClassName
 * @returns {string[]}
 */
const makePropTypesList = ({props, mobxClassName}) => {
    return props.map(({propName, isRequired, type}) => {
        let typeName = propTypesMap[type] || type;
        if (type === 'MobX store') typeName = `instanceOf(${mobxClassName})`
        return `  ${propName}: PropTypes.${typeName}${isRequired ? `.isRequired` : ''},`
    })
}

/**
 * @param {string} name 
 * @param {{propName: string; defaultValue: string}[]} props 
 * @returns {string[]}
 */
const makeDefaultValues = (name, props) => {
    const vProps = props
        .map((p) =>
            p.propName === 'children' && !p.isRequired && !p.defaultValue ?
            {...p, defaultValue: 'null'} : p
        ).filter(({defaultValue}) => !!defaultValue)
    const res = []
    if (vProps.length > 0) {
        res.push('')
        res.push(`${name}.defaultProps = {`)
        vProps.forEach(({propName, defaultValue}) => res.push(`  ${propName}: ${defaultValue},`))
        res.push(`};`)
    }
    return res
}

const createComponentCode = ({name, isTS, useReturn, useForwardRef, refOwner, props=[], classExpr, styleImport, mobxClassName, mobx}) => {
    let rows = [reactImport]
    const useMobX = !!mobxClassName
    if (useMobX) {
        rows.push(`import { observer } from "mobx-react-lite";`)
        rows.push(`import { ${mobxClassName} } from "./${mobxClassName}";`)
    }
    if (styleImport) rows.push(styleImport)
    rows.push('')
    let postRows = []
    const iname = `Props${name}`;
    let paramsFC = ''
    let paramsComp = ''
    const children = props.find(({propName}) => propName === 'children')
    if (props.length > 0) {
        paramsComp = `{ ${props.map(({propName}) => propName).join(', ')} }`
        if (isTS) {
            paramsFC = `<${iname}>`
            rows = [...rows, ...createPropsInterface({iname, props, mobxClassName}), '']
            paramsComp += `: ${iname}`
        } else {
            rows.splice(1, 0, 'import PropTypes from "prop-types";')
            postRows = [`${name}.propTypes = {`, ...makePropTypesList({props, mobxClassName}), '};']
        }
    }

    let compType = isTS ? `: React.FC${paramsFC}` : ''
    const mainBounds = useReturn ? ['{', '}'] : ['(', ')']
    const observerBegin = useMobX ? 'observer(' : ''
    const observerEnd = useMobX ? ')' : ''

    const containerInside = []
    const fwdRef = { containerAttr: '', begin: '', end: '', param: '' }
    if (useForwardRef) {
        const { code, refType } = refOwners[refOwner]
        compType = ''
        const paramType = isTS ? `: React.ForwardedRef<${refType}>` : ''
        fwdRef.begin = `React.forwardRef(`
        fwdRef.end = ')'
        fwdRef.param = `, ref${paramType}`
        if (code) {
            containerInside.push(code)
        } else {
            fwdRef.containerAttr = ' ref={ref}'
        }
        if (!paramsComp) paramsComp = '{}'
    }

    rows.push(`export const ${name}${compType} = ${observerBegin}${fwdRef.begin}(${paramsComp}${fwdRef.param}) => ${mainBounds[0]}`)
    if (children) containerInside.push('{children}')
    let bodyBegin = `<div${classExpr}${fwdRef.containerAttr}>`
    let bodyEnd = `</div>`
    if (useReturn) {
        bodyBegin = `return ${bodyBegin}`
        bodyEnd += ';'
    }
    rows.push(`  ${bodyBegin}`)
    containerInside.forEach(row => rows.push(`    ${row}`))
    rows.push(`  ${bodyEnd}`)
    rows.push(`${mainBounds[1]}${fwdRef.end}${observerEnd};`)
    if (postRows.length > 0) {
        rows = [...rows, '', ...postRows]
    }
    rows = [...rows, ...makeDefaultValues(name, props)]
    return rows
}

/**
 * 
 * @param {Object} params
 * @param {string} params.name Nameof the component
 * @param {""|"css"|"module.css"|"less"|"module.less"|"sass"|"scss"} params.styles
 * @param {string|undefined} params.cssLoaderVer
 * @returns {{className: string; classExpr: string; styleImport: string; styleCode: string; styleFileName: string;}}
 */
const createStyle = ({name, styles, cssLoaderVer}) => {
    const res = {
        className: '', classExpr: '', styleImport: '', styleFileName: '', styleCode: [],
    }
    const stylesDir = getHiVersion(cssLoaderVer) >= 7 ? '* as styles' : 'styles'
    if (styles) {
        res.styleFileName = `${name}.${styles}`
        if (/^module\./.test(styles)) {
            res.className = camelToLower(name)
            res.styleImport = `import ${stylesDir} from "./${res.styleFileName}";`
            res.classExpr = ` className={styles.${res.className}}`
        } else {
            res.className = camelToKebab(name)
            res.styleImport = `import "./${res.styleFileName}";`
            res.classExpr = ` className="${res.className}"`
        }
        // Если оставить пустой класс, то тесты будут падать.
        // т.к. вместо <div class="..."></div> будут <div></div> - по крайней мере для module.less
        res.styleCode = [
            `.${res.className} {`,
            '  margin: 0;', // фиктивная инструкция, чтобы блок не был пустым
            '}',
        ]
        if (styles.endsWith('sass')) {
            res.styleCode = [
                `.${res.className}`,
                '    margin: 0'
            ]    
        }
    }
    return res
}

const mobxInstanceCode = ({mobxClassName, mobx}) => {
    return `const store = new ${newMobxInstance({mobxClassName, mobx})}();`
}

/**
 * @param {Object} params
 * @param {string} params.name The component name
 * @param {string} params.folder Owner folder of the component. The first segment is always "src".
 * @param {boolean} params.createFolder
 * @param {boolean} params.useReturn
 * @param {boolean} params.useForwardRef
 * @param {string}  params.refOwner key of refOwners
 * @param {boolean} params.useJest
 * @param {boolean} params.availInlineSnapshots Бывают конфигурации, где не работают inline snapshots
 * @param {boolean} params.useInlineSnapshot
 * @param {boolean} params.usePretty
 * @param {string|undefined} params.cssLoaderVer От версии css-loader зависит способ импорта
 * @param {""|"css"|"less"|"module.css"|"module.less"} params.styles
 * @param {{propName:string; isRequired:boolean; type: string; defaultValue: string;}[]} params.props
 * @param {{language:string;}} params.tech
 * @param {{framework?:string}} params.techVer
 * @param {boolean} params.useMobX
 * @param {{exportStore:boolean;}} params.mobx
 * @returns {{ folders: string[]; files: {name:string; data:string[]}[]; mobxClassName?: string; mobxStoreName:string; }}
 */
const createReactComponent = ({
    name, createFolder, useReturn, props, styles,
    useForwardRef, refOwner,
    useJest, useInlineSnapshot, usePretty, useMobX, mobx,
    useStorybook, story,
    tech, techVer,
    isReactTestingLibrary,
    cssLoaderVer,
}) => {
    const isTS = tech.language === 'TypeScript'
    const codeExt = `${isTS ? 't':'j'}s`
    const renderExt = `${codeExt}x`
    const componentName = `${name}.${renderExt}`
    const filesDict = {}
    const {className, classExpr, styleImport, styleCode, styleFileName} = createStyle({name, styles, cssLoaderVer})
    const {mobxClassName, mobxStoreName, mobxFileName, mobxCode} = createMobxStore({ name, useMobX, mobx, isTS, mobx })
    filesDict[componentName] = createComponentCode({name, isTS, 
        createFolder, useReturn, useForwardRef, refOwner, props, classExpr, styleImport, mobxClassName, mobx 
    })
    if (mobxFileName) {
        filesDict[mobxFileName] = mobxCode
    }
    if (styleFileName) {
        filesDict[styleFileName] = styleCode
    }
    if (useJest) {
        const {specFileName, specCode} = createJest({
            name, isTS, className, useInlineSnapshot, usePretty, props, techVer, styles,
            mobxClassName, mobxStoreName, mobx, isReactTestingLibrary,
        })
        filesDict[specFileName] = specCode
    }
    if (useStorybook) {
        const {storyFileName, storyCode} = createStorybook({
            name, props, story, isTS, renderExt,
            mobxClassName, mobxStoreName, mobx,
        })
        filesDict[storyFileName] = storyCode
    }
    const folders = []
    let filePrefix = ''
    if (createFolder || Object.keys(filesDict).length > 1) {
        folders.push(name)  // Create folder with name of component
        const icode = [`export * from "./${name}";`]
        if (useMobX) icode.push(`export * from "./${mobxClassName}";`)
        filesDict[`index.${codeExt}`] = icode
        filePrefix = `${name}/`
    }
    const files = Object.entries(filesDict).map(([name, rows]) => {
        return { name: `${filePrefix}${name}`, data: rows.join('\n') }
    })
    return {folders, files, mobxClassName, mobxStoreName}
}

module.exports = {createReactComponent, createStyle, makeDefaultValues, createStorybook, mobxInstanceCode, refOwners }