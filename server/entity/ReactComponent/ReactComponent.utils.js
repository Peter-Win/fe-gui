const { camelToKebab, camelToLower } = require("../../parser/nameConversion")
const { createJest } = require('./createJest')

const reactImport = 'import * as React from "react";';

/**
 * @param {string} iname
 * @param {{propName:string; isRequired: boolean; type: string; defaultValue: string}[]} props 
 * @returns {string[]}
 */
const createPropsInterface = (iname, props) => {
    const res = [`interface ${iname} {`]
    props.forEach(({propName, isRequired, type}) => {
        const row = `  ${propName}${isRequired ? '' : '?'}: ${type};`
        res.push(row)
    })
    res.push('}')
    return res
}

// Пока что используются простые типы, т.к со сложными пока не понятно как для них сделать интерфейс.
// Кроме того, нет механизма, который находит импорты для используемых сущностей.
const propTypesMap = {
    'boolean': 'bool',
    'React.Node': 'node',
    'React.Element': 'element',
}


/**
 * @param {{propName:string; isRequired: boolean; type: string; defaultValue: string}[]} props 
 * @returns {string[]}
 */
const makePropTypesList = (props) => {
    return props.map(({propName, isRequired, type}) => {
        const typeName = propTypesMap[type] || type;
        return `  ${propName}: PropTypes.${typeName}${isRequired ? `.isRequired` : ''},`
    })
}

/**
 * @param {string} name 
 * @param {{propName: string; defaultValue: string}[]} props 
 * @returns {string[]}
 */
const makeDefaultValues = (name, props) => {
    const vProps = props.filter(({defaultValue}) => !!defaultValue)
    const res = []
    if (vProps.length > 0) {
        res.push('')
        res.push(`${name}.defaultProps = {`)
        vProps.forEach(({propName, defaultValue}) => res.push(`  ${propName}: ${defaultValue},`))
        res.push(`};`)
    }
    return res
}

const createComponentCode = ({name, isTS, useReturn, props=[], classExpr, styleImport}) => {
    let rows = [reactImport]
    if (styleImport) rows.push(styleImport)
    rows.push('')
    let postRows = []
    const iname = `Props${name}`;
    let paramsFC = ''
    let paramsComp = ''
    if (props.length > 0) {
        paramsComp = `{ ${props.map(({propName}) => propName).join(', ')} }`
        if (isTS) {
            paramsFC = `<${iname}>`
            rows = [...rows, ...createPropsInterface(iname, props), '']
            paramsComp += `: ${iname}`
        } else {
            rows.splice(1, 0, 'import PropTypes from "prop-types";')
            postRows = [`${name}.propTypes = {`, ...makePropTypesList(props), '};']
        }
    }

    const compType = isTS ? `: React.FC${paramsFC}` : ''
    const mainBounds = useReturn ? ['{', '}'] : ['(', ')']
    rows.push(`export const ${name}${compType} = (${paramsComp}) => ${mainBounds[0]}`)
    const body = `<div${classExpr}></div>`
    if (!useReturn) {
        rows.push(`  ${body}`)
    } else {
        rows.push(`  return ${body};`)
    }
    rows.push(`${mainBounds[1]};`)
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
 * @param {""|"css"|"module.css"|"less"|"module.less"} params.styles
 * @returns {{className: string; classExpr: string; styleImport: string; styleCode: string; styleFileName: string;}}
 */
const createStyle = ({name, styles}) => {
    const res = {
        className: '', classExpr: '', styleImport: '', styleFileName: '', styleCode: [],
    }
    if (styles) {
        res.styleFileName = `${name}.${styles}`
        if (/^module\./.test(styles)) {
            res.className = camelToLower(name)
            res.styleImport = `import styles from "./${res.styleFileName}";`
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
    }
    return res
}

const createStorybook = ({ name, props, story, isTS, renderExt }) => {
    const { compTitle, compDecorator, storyName } = story
    const storyFileName = `${name}.stories.${renderExt}`
    const storyNameOk = storyName || "Default"
    const args = props
        .filter(({ propName, isRequired, testValue }) => isRequired || testValue)
        .map(({ propName, type, testValue }) => `${propName}: ${testValue || typeDefaults[type]}`)
    const storyCode = `${reactImport}
import { ${name} } from "./${name}";

export default {
    title: "${compTitle || name}",
    component: ${name},
    decorators: [
        (Story) => <div style={{ border: "thick solid silver", padding: "1em" }}><Story /></div>
    ],
}${isTS ? ` as ComponentMeta<typeof ${name}>`: ''};

const Template${isTS ? `: ComponentStory<typeof ${name}>` : ''} = (args) => <${name} {...args} />;

export const ${storyNameOk} = Template.bind({});
${storyNameOk}.args = { ${args.join(', ')} };`.split('\n')
    if (isTS) storyCode.splice(1, 0, 'import { ComponentMeta, ComponentStory } from "@storybook/react";')
    if (!compDecorator) {
        const pos = storyCode.findIndex(s => /component:/.test(s))
        if (pos >=0) storyCode.splice(pos+1, 3)
    }
    return { storyFileName, storyCode }
}

/**
 * @param {Object} params
 * @param {string} params.name The component name
 * @param {string} params.folder Owner folder of the component. The first segment is always "src".
 * @param {boolean} params.createFolder
 * @param {boolean} params.useReturn
 * @param {boolean} params.useJest
 * @param {boolean} params.availInlineSnapshots Бывают конфигурации, где не работают inline snapshots
 * @param {boolean} params.useInlineSnapshot
 * @param {boolean} params.usePretty
 * @param {""|"css"|"less"|"module.css"|"module.less"} params.styles
 * @param {{propName:string; isRequired:boolean; type: string; defaultValue: string;}[]} params.props
 * @param {{language:string;}} params.tech
 * @param {{framework?:string}} params.techVer
 * @returns {{ folders: string[]; files: {name:string; data:string[]}[]; }}
 */
const createReactComponent = ({
    name, createFolder, useReturn, props, styles,
    useJest, useInlineSnapshot, usePretty,
    useStorybook, story,
    tech, techVer,
}) => {
    const isTS = tech.language === 'TypeScript'
    const codeExt = `${isTS ? 't':'j'}s`
    const renderExt = `${codeExt}x`
    const componentName = `${name}.${renderExt}`
    const filesDict = {}
    const {className, classExpr, styleImport, styleCode, styleFileName} = createStyle({name, styles})
    filesDict[componentName] = createComponentCode({name, isTS, createFolder, useReturn, props, classExpr, styleImport })
    if (styleFileName) {
        filesDict[styleFileName] = styleCode
    }
    if (useJest) {
        const {specFileName, specCode} = createJest({name, isTS, className, useInlineSnapshot, usePretty, props, techVer, styles})
        filesDict[specFileName] = specCode
    }
    if (useStorybook) {
        const {storyFileName, storyCode} = createStorybook({ name, props, story, isTS, renderExt })
        filesDict[storyFileName] = storyCode
    }
    const folders = []
    let filePrefix = ''
    if (createFolder || Object.keys(filesDict).length > 1) {
        folders.push(name)  // Create folder with name of component
        filesDict[`index.${codeExt}`] = [`export * from "./${name}";`]
        filePrefix = `${name}/`
    }
    const files = Object.entries(filesDict).map(([name, rows]) => {
        return { name: `${filePrefix}${name}`, data: rows.join('\n') }
    })
    return {folders, files}
}

module.exports = {createReactComponent, createStyle, makeDefaultValues, createStorybook }