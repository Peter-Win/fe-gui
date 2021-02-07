/**
 * g
 * @param prevChunk
 * @param curChunk
 * @param {Style} style
 * @return {string}
 */
const getSpace = (prevChunk, curChunk, style) => {
    const type = curChunk[1]
    switch (prevChunk[1]) {
        case 'beginTag':
            return ' '
        case 'binop':
            return ' '
        case 'bracketEnd':
            if (type in {binop: 1}) return ' '
            break
        case 'colon':
            return ' '
        case 'const':
            if (type === 'attrName') return ' '
            break
        case 'itemDiv':
            return ' '
        case 'jsxValueEnd':
            if (type === 'attrName') return ' '
            break
        case 'keyword':
            if (type in {eol: 1}) break
            return ' '
        case 'name':
            if (type in {binop: 1, keyword: 1}) return ' '
            break
        case 'objBegin':
            if (style.bracketSpacing) {
                return ' '
            }
            break
        case 'objEnd':
            if (type in {binop: 1, keyword: 1}) return ' '
            break
        case 'paramsEnd':
            if (type in {binop: 1}) return ' '
            break
    }
    if (type in {objEnd: 1}) return ' '
    return ''
}
/**
 *
 * @param {Array} chunks
 * @param {Style} style
 * @return {string}
 */
const formatChunksEx = (chunks, style) => {
    const rows = []
    let curRow = ''
    let pos = 0
    let rowLevel = 0
    let vLevel = 0
    let vLevel0 = 0
    const addRow = () => {
        if (vLevel0 > vLevel) {
            rowLevel--
        }
        if (curRow) {
            curRow = style.indent(rowLevel) + curRow
        }
        if (vLevel0 < vLevel) {
            rowLevel++
        }
        rows.push(curRow)
        curRow = ''
        curChunk = []
        vLevel0 = vLevel
    }
    let prevChunk = []
    let curChunk = []
    while (pos < chunks.length) {
        prevChunk = curChunk
        curChunk = chunks[pos++]
        const type = curChunk[1]
        curRow += getSpace(prevChunk, curChunk, style)
        const value = String(curChunk[0]).trim()
        curRow += value
        if (type in {paramsBegin: 1, bracketBegin: 1, tag: 1, beginTag: 1}) vLevel++
        else if (type in {paramsEnd: 1, bracketEnd: 1, closeTag: 1}) vLevel--
        if (type === 'eol' || type === 'instrDiv') {
            addRow()
            continue
        }
        const rowSize = style.tabWidth * rowLevel + curRow.length
    }
    addRow()
    return rows.join('\n')
}
module.exports = {formatChunksEx}