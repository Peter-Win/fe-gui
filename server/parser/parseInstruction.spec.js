const {expect} = require('chai')
const {parseInstruction, parseBody} = require('./parseExpression')
const {ReaderCtx} = require('./ReaderCtx')

const parseNode = (text, stoppers) => {
    return parseInstruction(ReaderCtx.fromText(text))
}

describe('parseInstruction', () => {
    it('Equation', () => {
        const n1 = parseNode('a = b;')
        expect(n1.toString()).to.equal('TxBinOp:= (TxName:a, TxName:b)')
        expect(n1.stopper).to.equal(';')
        const n2 = parseNode('module.exports = {x: 10}')
        expect(n2.toString()).to.equal(
            'TxBinOp:= (TxBinOp:. (TxName:module, TxName:exports), TxObject:{ (TxName:x, TxConst:10))')
        expect(n2.stopper).to.equal('')
    })
    it('Sequence', () => {
        const r = ReaderCtx.fromText('let a = 11;\nconst b = 22\na += b')
        const n1 = parseInstruction(r)
        expect(n1.toString()).to.equal('TxVarDecl:let (TxBinOp:= (TxName:a, TxConst:11))')
        expect(n1.stopper).to.equal(';')
        const n2 = parseInstruction(r)
        expect(n2.toString()).to.equal('TxVarDecl:const (TxBinOp:= (TxName:b, TxConst:22))')
        // expect(n2.stopper).to.equal('')
        const n3 = parseInstruction(r)
        expect(n3.toString()).to.equal('TxBinOp:+= (TxName:a, TxName:b)')
    })
    it('var declaration', () => {
        const n1 = parseNode('const s = "Hello"')
        expect(n1.toString()).to.equal('TxVarDecl:const (TxBinOp:= (TxName:s, TxConst:"Hello"))')
        const n2 = parseNode('let a, b, c;')
        expect(n2.toString()).to.equal('TxVarDecl:let (TxName:a, TxName:b, TxName:c)')
    })
    it('object', () => {
        const n1 = parseNode("exports = {entry: './src/index.js',}")
        expect(n1.toString()).to.equal("TxBinOp:= (TxName:exports, TxObject:{ (TxName:entry, TxConst:'./src/index.js', :))")
    })
    it('return', () => {
        const n1 = parseNode('return;')
        expect(n1.toString()).to.equal('TxReturn:return')
        const n2 = parseNode('return\n}')
        expect(n2.toString()).to.equal('TxReturn:return')
        const n3 = parseNode('return 123;')
        expect(n3.toString()).to.equal('TxReturn:return (TxConst:123)')
        const n4 = parseNode('return (\n{x: 1}\n)\n}')
        expect(n4.toString()).to.equal('TxReturn:return (TxBrackets:( (TxObject:{ (TxName:x, TxConst:1)))')
    })
})

describe('parseBody', () => {
    it('function body with ;', () => {
        const reader = ReaderCtx.fromText('{\nconst a = 1;\nprint(b);\n}')
        reader.readLexem()
        const cmds = parseBody(reader, '}')
        expect(cmds).to.be.lengthOf(2)
    })
    it('function body without ;', () => {
        const reader = ReaderCtx.fromText('{\nconst a = 1\nprint(b)\n}')
        reader.readLexem()
        const cmds = parseBody(reader, '}')
        expect(cmds).to.be.lengthOf(2)
        expect(cmds[0].toString()).to.equal('TxVarDecl:const (TxBinOp:= (TxName:a, TxConst:1))')
        expect(cmds[1].toString()).to.equal('TxFnCall:call (TxName:print, TxName:b)')
    })
})