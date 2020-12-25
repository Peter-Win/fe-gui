const {ParserNode} = require('./ParserNode')
const {Lex} = require('./Lex')

/**
 * @param {ParserNode} curOp
 * @param {Array<ParserNode>} args
 * @param {ReaderCtx} reader
 */
const updateOp = (curOp, args, reader) => {
    if (curOp.txType === 'TxBinOp') {
        const arg2 = args.pop()
        const arg1 = args.pop()
        curOp.args.push(arg1, arg2)
        args.push(curOp)
    } else if (curOp.txType === 'TxUnOp' || curOp.txType === 'TxPostfix') {
        curOp.args.push(args.pop())
        args.push(curOp)
    } else if (curOp.txType = 'TxTernOp') {
        const arg3 = args.pop()
        const arg2 = curOp.args.pop()
        const arg1 = args.pop()
        curOp.args.push(arg1, arg2, arg3)
        args.push(curOp)
    } else {
        reader.error(`Invalid operation: ${curOp}`)
    }
}

/**
 *
 * @param {Array<ParserNode>} ops
 * @param {Array<ParserNode>} args
 * @param {ReaderCtx} reader
 * @return {ParserNode}
 */
const unwind = (ops, args, reader) => {
    while (ops.length > 0) {
        const curOp = ops.pop()
        updateOp(curOp, args, reader)
    }
    if (args.length !== 1) {
        reader.error(`Invalid expression ops(${ops.length}), args(${args.length})`)
    }
    return args.pop()
}

/**
 *
 * @param {ParserNode} node
 * @param {ParserNode[]} ops
 * @param {ParserNode[]} args
 * @param {ReaderCtx} reader
 */
const checkPrior = (node, ops, args, reader) => {
    while (ops.length > 0) {
        const curOp = ops.pop()
        if (curOp.prior < node.prior) {
            ops.push(curOp)
            ops.push(node)
            return
        }
        updateOp(curOp, args, reader)
    }
    ops.push(node)
}

/**
 * @param {ReaderCtx} reader
 * @return {[null|{value: string, type: ("id"|"cmd"|"number"|"string"|"regexp"|"comment"|"space"|"eol")}, []]}
 */
const skipSpaces = (reader) => {
    const prev = []
    let lexem = null
    while (true) {
        lexem = reader.readLexem()
        if (!lexem || !(lexem.type in {space: 1, comment: 1, eol: 1})) break
        prev.push(lexem)
    }
    return [lexem, prev]
}

/**
 *
 * @param {ReaderCtx} reader
 * @param {string[]} stoppers
 * @param {{canEmpty:boolean?}?} options
 * @return {ParserNode}
 */
const parseExpression = (reader, stoppers = [], options = {}) => {
    const asi = stoppers.includes(';') // Automatic Semicolon Insertion
    const ops = []
    const args = []
    let state = 'start'
    let isNewLine = false
    let curStopper = ''
    while (true) {
        const lex = reader.readLexem()
        if (!lex) {
            if (args.length === 0) {
                reader.error('Unexpected end of expression')
            }
            break
        }
        if (lex.type === 'comment' || lex.type === 'space' || lex.type === 'eol') {
            isNewLine = isNewLine || lex.type === 'eol'
            continue
        }
        if (lex.type === 'cmd' && stoppers.includes(lex.value)) {
            curStopper = lex.value
            break
        }
        const node = new ParserNode(lex)
        if (state === 'start') {
            // Можно ожидать: unop, const, name, (, [
            if (node.value === 'function') {
                args.push(node)
                node.txType = 'TxFunction'
                const headers = []
                while (true) {
                    const [nextLex] = skipSpaces(reader)
                    if (!nextLex) reader.error('Invalid function declaration')
                    headers.push(nextLex)
                    if (nextLex.value === '(') break
                }
                if (headers.length === 2) node.name = headers[0].value
                const fnArgs = new ParserNode({value: '', type: ''}, 'TxArguments')
                const fnBody = new ParserNode(Lex.cmd('{'), 'TxBody')
                node.args = [fnArgs, fnBody]
                fnArgs.args = parseExprList(reader, ')', [','], {canEmpty: true})
                const [brLex] = skipSpaces(reader)
                if (!brLex || brLex.value !== '{') reader.error('Expected "{"')
                fnBody.args = parseBody(reader, '}')
                state = 'postArg'
            } else if (node.isArg()) {
                // Если аргумент, добавить в стек аргументов
                node.setArgType()
                args.push(node)
                state = 'postArg'
            } else if (lex.value === '(') {
                // Скобки для группировки операций (а не список параметров функции)
                const argNode = parseExpression(reader, [')'])
                node.initOp(reader)
                node.args.push(argNode)
                args.push(node)
                state = 'postArg'
            } else if (lex.value === '[') {
                // Начало нового массива или деструктуризация, но не извлечение по индексу
                node.args = parseExprList(reader, ']', [','], {canEmpty: true})
                node.txType = 'TxArray'
                args.push(node)
                state = 'postArg'
            } else if (lex.value === '{') {
                // Объект или деструктуризация
                node.args = parseExprList(reader, '}', [',', ':'])
                node.txType = 'TxObject'
                args.push(node)
                state = 'postArg'
            } else if (node.isOp()) {
                if (node.value === '-') {
                    node.opcode = 'neg'
                }
                node.initOp(reader)
                ops.push(node)
            } else {
                reader.error(`Invalid lexem in expression: "${lex.value}"`)
            }
        } else if (state === 'postArg') {
            if (lex.value === '(') {
                // начало параметров функции
                node.value = 'call'
                node.initOp(reader)
                checkPrior(node, ops, args, reader)
                const callNode = ops.pop()
                const list = parseExprList(reader, ')', [','])
                callNode.args = [args.pop(), ...list]
                args.push(callNode)
                state = 'postArg'
            } else if (node.value === '[') { // index of an array or object
                node.initOp(reader)
                checkPrior(node, ops, args, reader)
                const indexOp = ops.pop()
                indexOp.args.push(args.pop())
                indexOp.args.push(parseExpression(reader, [']']))
                args.push(indexOp)
                state = 'postArg'
            } else if (node.value === '?') {
                node.initOp(reader)
                checkPrior(node, ops, args, reader)
                const midArg = parseExpression(reader, [':'])
                node.args.push(midArg)
                state = 'start'
            } else if (node.isOp()) {
                // бинарный оператор или точка или постфикс
                if (node.value === '++' || node.value === '--') {
                    node.opcode = '#'+node.value
                }
                if (!node.initOp(reader, asi && isNewLine)) {
                    reader.backToBeginOfLine()
                    curStopper = ';'
                    break
                }
                checkPrior(node, ops, args, reader)
                state = 'start'
            } else {
                if (asi && isNewLine) {
                    reader.backToBeginOfLine()
                    curStopper = ';'
                    break
                }
                reader.error('Invalid postArg ' + node.toString())
            }
        }
        isNewLine = false
    }
    if (args.length === 0 && options.canEmpty) {
        return new ParserNode({value: '', type: ''})
    }
    const resultNode = unwind(ops, args, reader)
    resultNode.stopper = curStopper
    return resultNode
}

/**
 * Распарсить список выражений
 * @param {ReaderCtx} reader
 * @param {string} terminator
 * @param {string[]} dividers
 * @param {{canEmpty?:boolean}?} options
 * @return {ParserNode[]} // Можно использовать поле stopper, чтобы узнать символ-разделитель
 */
const parseExprList = (reader, terminator, dividers, options={}) => {
    const list = []
    const next = reader.getNextLexem(0)
    if (!next) {
        return list
    }
    if (next.value === terminator) {
        // Пустой список аргументов
        while (reader.readLexem().value !== terminator) {}
        return list
    }
    const stoppersEx = [...dividers, terminator]
    while (true) {
        const expr = parseExpression(reader, stoppersEx, options)
        if (!expr) {
            break
        }
        list.push(expr)
        if (expr.stopper === terminator || (expr.stopper === '' && terminator === ';')) {
            break
        }
    }
    return list
}

const varDeclarators = new Set(['const', 'let', 'var'])

/**
 *
 * @param {ReaderCtx} reader
 * @return {ParserNode|null}
 */
const parseInstruction = (reader) => {
    const pos0 = reader.getPos()
    const [lexem] = skipSpaces(reader)
    if (!lexem) return null
    if (lexem.type === 'id' && varDeclarators.has(lexem.value)) {
        const declNode = new ParserNode(lexem, 'TxVarDecl')
        declNode.args = parseExprList(reader, ';', [','])
        declNode.stopper = (declNode.args[declNode.args.length - 1] || {}).stopper
        return declNode
    }
    if (lexem.value === 'return') {
        const returnNode = new ParserNode(lexem, 'TxReturn')
        const pos1 = reader.getPos()
        const [nextLex, spaces] = skipSpaces(reader)
        if (spaces.find(lex => lex.type === 'eol')) { // return<EOL>
            reader.backToBeginOfLine()
        } else if (nextLex && nextLex.value !== ';') {
            reader.seek(pos1)
            returnNode.args.push(parseInstruction(reader))
        }
        return returnNode
    }
    reader.seek(pos0)
    // В остальных случаях считаем, что это выражение.
    // Это может быть присваивание или объявление функции через function
    return parseExpression(reader, [';'])
}

/**
 * @param {ReaderCtx} reader
 * @param {string} terminator
 * @return {ParserNode[]}
 */
const parseBody = (reader, terminator) => {
    const commands = []
    while (true) {
        const pos = reader.getPos()
        const [lex1] = skipSpaces(reader)
        if (!lex1) {
            if (!terminator) break
            reader.error(`Expected "${terminator}"`)
        }
        if (lex1.type === 'cmd' && lex1.value === terminator) {
            break
        }
        reader.seek(pos)
        const instr = parseInstruction(reader)
        commands.push(instr)
    }
    return commands
}

module.exports = {ParserNode, parseExpression, parseExprList, parseInstruction, parseBody}