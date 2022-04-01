const typeDefaults = {
    'boolean': 'false',
    'number': '0',
    'string': '""',
    'React.Node': 'null',
    'React.Element': '<span />',
}

const makePropCode = (propName, type, testValue) => {
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
 * @returns {string}
 */
const makeComponentCall = ({ name, props }) => {
    const propsList = props
        .filter(({ isRequired, testValue }) => isRequired || testValue)
        .map(({ propName, type, testValue }) => makePropCode(propName, type, testValue))
    const propsCode = propsList.length > 0 ? ` ${propsList.join(' ')}` : ''
    return `<${name}${propsCode} />`
}

module.exports = {makeComponentCall}