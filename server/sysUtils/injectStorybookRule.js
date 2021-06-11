/**
 * Example:
 *   const src = await readRows(name)
 *   const dst = injectStorybookRule(src, '/\\.less$/', ['style-loader', 'css-loader', 'less-loader'])
 *   await writeRows(name, dst)
 * @param {string[]} srcLines
 * @param {string} test
 * @param {string[]} use
 * @return {string[]}
 */
const injectStorybookRule = (srcLines, test, use) => {
    // Сначала проверить наличие блока webpackFinal
    return inject(checkWebpackFinal(srcLines), test, use)
}

const getSpace = line => {
    const res = /\S/.exec(line)
    if (!res) return '  '
    return line.slice(0, res.index)
}

const getOffsetStep = (list, pos) => {
    const pos0 = list.findIndex(s => s.trim().startsWith('module'))
    return [getSpace(list[pos]), getSpace(list[pos0+1])]
}

const inject = (srcLines, test, use) => {
    const pos = srcLines.findIndex( s => s.trim().startsWith('webpackFinal')) + 1
    const begin = srcLines.slice(0, pos)
    const end = srcLines.slice(pos)
    const [offset, space] = getOffsetStep(srcLines, pos)
    const code = [
        'config.module.rules.push({',
        `${space}test: ${test},`,
        `${space}use: ${JSON.stringify(use)},`,
        '});',
    ]
    return [...begin, ...code.map(s => offset + s), ...end]
}

/**
 *
 * @param {string[]} srcLines
 * @return {string[]}
 */
const checkWebpackFinal = (srcLines) => {
    const pos = srcLines.findIndex(line => line.trim().startsWith('webpackFinal'))
    if (pos >= 0) {
        return srcLines
    }
    const lastBracePos = srcLines.reduce((res, line, index) => {
        return line.trim() === '}' ?  index : res
    }, -1)
    if (lastBracePos < 0) throw new Error('Not found last }')
    const begin = trailingComma(srcLines.slice(0, lastBracePos))
    const end = srcLines.slice(lastBracePos)
    const [offset, step] = getOffsetStep(srcLines, lastBracePos-1)
    const code = [
        'webpackFinal: async (config) => {',
        `${step}return config;`,
        '},',
    ]
    return [...begin, ...code.map(s => offset + s), ...end]
}

const trailingComma = (list) => {
    const lastRow = list[list.length - 1]
    const lastChar = lastRow[lastRow.length - 1]
    if (lastChar === ',') {
        return list
    }
    return [...list.slice(0, list.length-1), lastRow+',']
}

/**
 *
 * @param {string} src
 * @param {Object<string, any>} rules
 */
const injectStorybookRuleEx = (src, rules) => {
    const {ReaderCtx} = require('../parser/ReaderCtx')
    const reader = ReaderCtx.fromText(src)
}

module.exports = {injectStorybookRule}