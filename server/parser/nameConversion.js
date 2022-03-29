/**
 * Convert camelCase to kebab-case
 * @param {string} camel 'helloWorld' or 'HelloWorld'
 * @returns {string} 'hello-world'
 */
const camelToKebab = (camel) => {
    let current = camel
    const pieces = []
    for (;;) {
        const res = /.[A-Z][a-z]/.exec(current)
        if (!res) break
        const left = current.slice(0, res.index+1)
        const right = current.slice(res.index+1)
        pieces.push(left)
        current = right
    }
    if (current) pieces.push(current)
    return pieces.map(s => s.toLowerCase()).join('-')
}

/**
 * Covert CamelCase to camelCaseLower
 * @param {string} camel 'HelloWorld'
 * @returns {string} 'helloWorld'
 */
const camelToLower = (camel) => {
    if (!camel) return camel
    return `${camel[0].toLowerCase()}${camel.slice(1)}`
}

module.exports = {camelToKebab, camelToLower}