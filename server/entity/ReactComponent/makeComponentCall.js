const typeDefaults = {
    'boolean': 'false',
    'number': '0',
    'string': '""',
    'React.Node': 'null',
    'React.Element': '<span />',
    any: 'null',
}

const makePropCode = ({propName, type, testValue, mobxStoreName}) => {
    if (type === 'MobX store') {
        return `${propName}={${mobxStoreName}}`
    }
    const value = testValue || typeDefaults[type]
    if (value === 'true') return propName
    if (type === 'string') return `${propName}=${value}`
    return `${propName}={${value}}`
}

/**
 * Вызов компонента с использованием тестовых значений
 * @param {Object} params
 * @param {string} params.name
 * @param {{propName:string; isRequired: boolean; type: string; testValue: string;}[]} params.props
 * @param {string} params.mobxStoreName
 * @returns {string}
 */
const makeComponentCall = ({ name, props, mobxStoreName }) => {
    const propsList = props
        .filter(({ isRequired, testValue }) => isRequired || testValue)
        .filter(({propName}) => propName !== 'children')
        .map(({ propName, type, testValue }) => makePropCode({propName, type, testValue, mobxStoreName}))
    const propsCode = propsList.length > 0 ? ` ${propsList.join(' ')}` : ''
    const children = props.find(({ propName }) => propName === 'children')
    let suffix = ' />'
    if (children && children.testValue) {
        suffix = `>\n  ${children.testValue}\n</${name}>`
    }
    return `<${name}${propsCode}${suffix}`
}

module.exports = {makeComponentCall, typeDefaults}