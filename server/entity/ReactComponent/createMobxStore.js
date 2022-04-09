const {typeDefaults} = require('./makeComponentCall')
const {camelToUpper, camelToLower} = require('../../parser/nameConversion')

const constructorParams = ({isTS, fields}) => {
    let bInit = false
    return fields.filter(({isParam}) => isParam).map(({fieldName, type, initValue}) => {
        const typedef = isTS ? `: ${type}` : ''
        const init = initValue || (bInit ? typeDefaults[type] : '')
        bInit = bInit || !!initValue
        return `${fieldName}${typedef}${init ? ` = ${init}`:''}`
    })
}

const fieldCode = ({isTS, fieldName, isParam, type, initValue}) => {
    const typedef = isTS ? `: ${type}` : ''
    const init = isParam ? (isTS ? '': typeDefaults[type]) : `${initValue || typeDefaults[type]}`
    return [
        `${fieldName}${typedef}${init ? ` = ${init}`:''};`,
        `set${camelToUpper(fieldName)}(${fieldName}${typedef}) {`,
        `  this.${fieldName} = ${fieldName};`,
        `}`,
    ]
}

/**
 * 
 * @param {{isParam: boolean; initValue?: string; testValue?: string; type: string;}[]} fields 
 */
const instanceParams = (fields) => {
    const params = fields.filter(({ isParam }) => isParam)
    let lastValid = 0
    let shadow = false
    params.forEach(({initValue, testValue}, i) => {
        shadow = shadow || !!initValue
        if (!shadow || testValue) lastValid = i
    })
    return params.slice(0, lastValid+1).map(({ testValue, type }) => testValue || typeDefaults[type])
}


/**
 * 
 * @param {Object} params
 * @param {string} params.name
 * @param {boolean} params.useMobX
 * @param {boolean} params.isTS
 * @param {Object} params.mobx
 * @param {boolean} params.mobx.exportStore
 * @param {{fieldName:string; isParam: boolean; type: string; initValue: string}[]} params.mobx.fields
 * @returns {{mobxClassName?:string; mobxStoreName?: string; mobxFileName?:string; mobxCode: string[] }}
 */
const createMobxStore = ({name, useMobX, isTS, mobx}) => {
    if (!useMobX) {
        return { mobxClassName:'', mobxStoreName: '', mobxFileName:'', mobxCode: [] }
    }
    const {fields = []} = mobx
    const mobxClassName = `${name}Store`
    const mobxFileName = `${mobxClassName}.${isTS ? 'ts':'js'}`
    let mobxCode = 
`import { makeAutoObservable } from "mobx";

export class ${mobxClassName} {
  constructor(${constructorParams({isTS, fields}).join(', ')}) {
    makeAutoObservable(this);
  }
}`.split('\n')
    const insert = (space, pos, rows) =>
        rows.forEach(row => mobxCode.splice(mobxCode.length+pos, 0, `${space}${row}`))
    fields.filter(({isParam}) => isParam)
        .forEach(({fieldName}) => insert('    ', -3, [`this.${fieldName} = ${fieldName};`]))
    fields.forEach((field) => insert('  ', -1, fieldCode({isTS, ...field})))

    let mobxStoreName = ''
    if (mobx.exportStore) {
        mobxStoreName = camelToLower(mobxClassName)
        const glbStore = `
export const ${mobxStoreName} = new ${mobxClassName}(${instanceParams(fields).join(', ')});
`
        mobxCode = [...mobxCode, ...glbStore.split('\n')]
    }
    return { mobxClassName, mobxStoreName, mobxFileName, mobxCode }
}

module.exports = {createMobxStore, constructorParams, fieldCode, instanceParams}
