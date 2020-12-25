/**
 * Поиск соседней значимой лексемы
 * пропускаются следующие типы: eol, space, comment
 * @param {Array<{value:string,type:'id'|'cmd'|'number'|'string'|'regexp'|'eol'|'space'|'comment'}>} lexems
 * @param {number} pos start position
 * @param {number} count positive or negative distance
 * @return {number} position or -1, if not found
 */
module.exports.skipLexem = (lexems, pos, count) => {
    if (!count) {
        return -1
    }
    const step = count < 0 ? -1 : 1
    let counter = 0
    do {
        pos += step
        if (pos < 0 || pos >= lexems.length) {
            return -1
        }
        const {type} = lexems[pos]
        if (type !== 'space' && type !== 'eol' && type !== 'comment') {
            counter += step
        }
    } while (counter !== count)
    return pos
}