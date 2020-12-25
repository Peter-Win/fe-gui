/**
 * Парсер подходит для большинства С-подобных языков (JavaScript, TypeScript, Kotlin...)
 */
const {skipLexem} = require('./skipLexem')

const isAlpha = ch => (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')

const isDigit = ch => ch >= '0' && ch <= '9'

const cmdChars = '-+*/<>()[]{}.,;!&|=:@^~?'

// > всегда один. Чтобы не путать Array<Array<string>>  и  x >> 1
const multiCmd = new Set(['!=', '=>', '<=', '>=', '&&', '||', '**', '<<', '++', '--',
    '==', '===', '+=', '-=', '*=', '/=', '%=', '**=', '<<=', '>>=', '&=', '|=', '^=', '?.'])

/**
 * Возможные типы лексем:
 * - id = identifier, f.e: const, firstName, hello_world
 * - number
 * - string
 * - regexp
 * - cmd - any command: ( ) [ ] { } * = == === => : . , ;
 * - comment
 * - space
 * - eol
 * @param text
 * @return {{value:string, type:'id'|'number'|'string'|'cmd'|'eol'|'space'|'comment'|'regexp' }[]}
 */
module.exports.parseLexems = (text) => {
    text += '\r'
    const lexems = []
    let state = 'begin'
    let j = 0
    let lineNumber = 1
    let curLine = ''
    let curValue = ''
    const addLexem = (value, type) => lexems.push({value, type})
    const error = msg => {
        throw new Error(`Error: ${msg} in line #${lineNumber}: ${curLine}`)
    }
    const setBegin = (type, options={}) => {
        if (type) lexems.push({value: curValue, type})
        if (!options.lastCharIsCorrect) j--
        curValue = ''
        state = 'begin'
    }
    // Достаточно сложно отличить, является ли символ / оператором деления или началом регулярки
    // Здесь мы будем пытаться по косвенным признакам отличитьм оператор деления, т.к. это проще
    // Считаем, что есть три ситуации для применения оператора деления
    // 1. x / ... идентификатор
    // 2. 1 / ...   число
    // 3. ...) / ... закрытая скобка
    const isDivision = () => {
        const prevPos = skipLexem(lexems, lexems.length, -1)
        if (prevPos < 0) {
            return false
        }
        const x = lexems[prevPos]
        return x.type === 'id' || x.type === 'number' || (x.type === 'cmd' && x.value === ')')
    }
    while (j < text.length) {
        const ch = text[j]
        j++
        curLine += ch
        if (state === 'begin') {
            if (isAlpha(ch) || ch === '_') {
                state = 'id'
            } else if (isDigit(ch)) {
                state = 'int'
            } else if (ch === '.' && text[j] === '.' && text[j+1] === '.') { // special case - ellipsis
                curValue = ''
                j+=2
                lexems.push({value: '...', type: 'cmd'})
            } else if (cmdChars.indexOf(ch) >= 0) {
                state = 'cmd' // or comment (/), or number (-)
            } else if (ch === '\'' || ch === '"' || ch === '`') {
                state = 'string'
            } else if (ch === ' ' || ch === '\t') {
                state = 'space'
            } else if (ch === '\n') {
                addLexem(ch, 'eol')
                lineNumber++
                curLine = ''
                continue
            } else if (ch == '\r') {
                continue
            } else {
                error(`Invalid character "${ch}"`)
            }
            curValue = ch
        } else if (state === 'space') {
            if (ch === ' ' || ch === '\t') {
                curValue += ch
            } else {
                setBegin(state)
            }
        } else if (state === 'id') {
            if (isAlpha(ch) || isDigit(ch) || ch === '_') {
                curValue += ch
            } else {
                setBegin(state)
            }
        } else if (state === 'cmd') {
            const possibleValue = curValue + ch
            if (multiCmd.has(possibleValue)) {
                curValue = possibleValue
            } else if (curValue === '-' && isDigit(ch)) {
                state = 'int'
                curValue = possibleValue
            } else if (possibleValue === '//') {
                state = 'lineComment'
                curValue = possibleValue
            } else if (possibleValue === '/*') {
                state = 'blockComment'
                curValue = possibleValue
            } else if (curValue === '/' && !isDivision()) {
                state = 'regexp'
                curValue = possibleValue
            } else {
                setBegin(state)
            }
        } else if (state === 'int') {
            const possibleValue = curValue + ch
            if (ch === '.' || ch.toLowerCase() === 'e') {
                curValue = possibleValue
                state = 'float'
            } else if (/^-?\d+$/.test(possibleValue)) {
                curValue = possibleValue
            } else if (/^-?0x$/i.test(possibleValue)) {
                curValue = possibleValue
                state = 'hex'
            } else {
                setBegin('number')
            }
        } else if (state === 'hex') {
            const possibleValue = curValue + ch
            if (/^-?0x[\dA-F]+$/i.test(possibleValue)) {
                curValue = possibleValue
            } else {
                setBegin('number')
            }
        } else if (state === 'float') {
            const possibleValue = curValue + ch
            if (/^-?\d+(\.\d*)?(E[-+]?\d*)?$/i.test(possibleValue)) {
                curValue = possibleValue
            } else {
                setBegin('number')
            }
        } else if (state === 'lineComment') {
            if (ch === '\n' || ch === '\r') {
                setBegin('comment')
            } else {
                curValue += ch
            }
        } else if (state === 'blockComment') {
            curValue += ch
            if (curValue.endsWith('*/')) {
                setBegin('comment', {lastCharIsCorrect: true})
            } else if (ch === '\n') {
                curLine = ''
                lineNumber++
            }
        } else if (state === 'string') {
            // В JavaScript многострочным является только строка в обратных апострофах.
            // Но здесь нам это не очень важно, т.к. это не компилятор. Используем код как есть.
            const begin = curValue[0]
            curValue += ch
            if (ch === begin && curValue[curValue.length - 2] !== '\\') {
                setBegin(state, {lastCharIsCorrect: true})
            }
        } else if (state === 'regexp') {
            curValue += ch
            if (ch === '/' && curValue[curValue.length-2] !== '\\') {
                state = 'rSuffix'
            }
        } else if (state === 'rSuffix') {
            if ('gimy'.indexOf(ch) < 0) {
                setBegin('regexp')
            } else {
                curValue += ch
            }
        }
    }
    return lexems
}
