const { fromQuoted } = require('../parser/stringUtils')
/**
 * 
 * @param {string} cmdLine 
 * @returns {string[]} arguments without quotes and unescaped. For ex: "w=\"a\"" => w="a"
 */
const parseCommandLine = (cmdLine) => {
    const result = []
    let state = 'space'
    let pos = 0
    let start = 0
    const line = cmdLine + ' '
    while (pos < line.length) {
        const c = line[pos]
        pos++
        if (state === 'space') {
            if (/\s/.test(c)) continue
            start = pos - 1
            state = c === '"' ? 'string' : 'arg'
        } else if (state === 'arg') {
            if (/\s/.test(c)) {
                result.push(line.slice(start, pos - 1))
                state = 'space'
            }
        } else if (state === 'string') {
            if (c === '"' && line[pos - 2] !== '\\') {
                result.push(fromQuoted(line.slice(start, pos)))
                state = 'space'
            }
        }
    }
    return result
}

module.exports = { parseCommandLine }