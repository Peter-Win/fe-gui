const Chunk = class {
    static arrayBegin = ['[', 'arrayBegin']
    static arrayEnd = [']', 'arrayEnd']
    static bodyBegin = ['{', 'bodyBegin']
    static bodyEnd = ['}', 'bodyEnd']
    static jsxValueBegin = ['{', 'jsxValueBegin']
    static jsxValueEnd = ['}', 'jsxValueEnd']
    static bracketBegin = ['(', 'bracketBegin']
    static bracketEnd = [')', 'bracketEnd']
    static colon = [': ', 'colon']
    static dot = ['.', 'dot']
    static instrDiv = [';', 'instrDiv']
    static itemDiv = [', ', 'itemDiv']
    static itemDivLast = ['', 'itemDivLast']
    static objBegin = ['{', 'objBegin']
    static objEnd = ['}', 'objEnd']
    static paramDiv = [', ', 'paramDiv']
    static paramDivLast = ['', 'paramDivLast']
    static paramsBegin = ['(', 'paramsBegin']
    static paramsEnd = [')', 'paramsEnd']
    static space = [' ', 'space']
    static eol = ['\n', 'eol']
    static softUp = ['', 'softUp']
    static softDown = ['', 'softDown']
    static softDiv = ['', 'softDiv']
    static name = (value) => [value, 'name']
    static Const = (value) => [value, 'const']
    static binop = (value) => [` ${value} `, 'binop']
    static unop = (value) => [value, 'unop']
    static keyword = value => [value, 'keyword']

    static tag = value => [`<${value}>`, 'tag']
    static beginTag = value => [`<${value}`, 'beginTag']
    static endTag = (isClosed) => [isClosed ? '/>':'>', 'endTag']
    static attrName = (value) => [value, 'attrName']
    static attrEq = ['=', 'attrEq']
    static textNode = value => [value, 'textNode']
    static attr = (name, value, style) => {
        const list = [Chunk.attrName(name)]
        if (value !== undefined) list.push(Chunk.attrEq, Chunk.Const(style.string(value)))
        return list
    }
    static attrExt = (name, valueChunks) =>
        [Chunk.attrName(name), Chunk.attrEq, Chunk.jsxValueBegin, ...valueChunks, Chunk.jsxValueEnd]

    static closeTag = name => [`</${name}>`, 'closeTag']

    static makeList = (items, begin, end, div, divLast) => {
        const list = [begin]
        items.forEach((item, i) => {
            if (item.length === 2 && typeof item[1] === 'string') {
                list.push(item);
            } else {
                list.push(...item);
            }
            list.push(i === items.length - 1 ? divLast : div)
        })
        list.push(end)
        return list
    }
}

module.exports.Chunk = Chunk
module.exports.chunks2text = chunks => chunks.map(c => c[0]).join('')