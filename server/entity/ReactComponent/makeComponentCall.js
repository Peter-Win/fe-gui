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
        .map(({ propName, type, testValue }) => makePropCode({propName, type, testValue, mobxStoreName}))
    const propsCode = propsList.length > 0 ? ` ${propsList.join(' ')}` : ''
    return `<${name}${propsCode} />`
}

module.exports = {makeComponentCall, typeDefaults}