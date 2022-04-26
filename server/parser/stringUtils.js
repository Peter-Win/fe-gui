/**
 * Перевести строку из описания строковой константы в значение
 * Н.р. '"hello"' -> 'hello'
 * @param {string} quoted 
 * @returns {string}
 */
const fromQuoted = (quoted) => {
    if (/^[\"\'`]/.test(quoted)) {
        const unquoted = quoted.slice(1, -1)
        return unquoted.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\\\/g, '\\')
    }
    return quoted
}

const multiplication = (src, count) => {
    let dst = ''
    for (let i = 0; i<count; i++) {
        dst += src
    }
    return dst
}

module.exports = {fromQuoted, multiplication}