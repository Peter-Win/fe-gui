const {expect} = require('chai')
const {parseExpression} = require('./parseExpression')
const {ReaderCtx} = require('./ReaderCtx')
const {Lex} = require('./Lex')

const testStr = (text, stoppers) =>
    parseExpression(ReaderCtx.fromText(text), stoppers).toString()

describe('parseExpression', () => {
    it('simple cases', () => {
        expect(testStr('main')).to.equal('TxName:main')
        expect(testStr('3.14')).to.equal('TxConst:3.14')
        expect(testStr('"ABC"')).to.equal('TxConst:"ABC"')
        expect(testStr(' first , second', [','])).to.equal('TxName:first')
        expect(testStr('/^[a-z]+$/i')).to.equal('TxConst:/^[a-z]+$/i')
    })
    it('bin op', () => {
        expect(testStr('a+b')).to.eql('TxBinOp:+ (TxName:a, TxName:b)')
        expect(testStr('a ** 2')).to.eql('TxBinOp:** (TxName:a, TxConst:2)')
        expect(testStr('a + b * c')).to.eql('TxBinOp:+ (TxName:a, TxBinOp:* (TxName:b, TxName:c))')
        expect(testStr('a * b + c')).to.eql('TxBinOp:+ (TxBinOp:* (TxName:a, TxName:b), TxName:c)')
        expect(testStr('a + b * c ** 2')).to.eql(
            'TxBinOp:+ (TxName:a, TxBinOp:* (TxName:b, TxBinOp:** (TxName:c, TxConst:2)))')
        expect(testStr('a+b, c', [',',')'])).to.eql('TxBinOp:+ (TxName:a, TxName:b)')
        expect(testStr('this.x')).to.equal('TxBinOp:. (TxName:this, TxName:x)')
        expect(testStr('/\\.js$/i.test(name)')).to.equal(
            'TxFnCall:call (TxBinOp:. (TxConst:/\\.js$/i, TxName:test), TxName:name)')
    })
    it('terminators', () => {
        const r1 = ReaderCtx.fromText('a = 1; b = 2;')
        const n11 = parseExpression(r1, [';'])
        expect(n11.toString()).to.equal('TxBinOp:= (TxName:a, TxConst:1)')
        expect(n11.stopper).to.equal(';')
        expect(parseExpression(r1, [';']).toString()).to.equal('TxBinOp:= (TxName:b, TxConst:2)')

        const r2 = ReaderCtx.fromText('x = 1\ny = 2')
        const n21 = parseExpression(r2, [';'])
        expect(n21.toString()).to.equal('TxBinOp:= (TxName:x, TxConst:1)')
        expect(n21.stopper).to.equal(';')
        expect(parseExpression(r2, [';']).toString()).to.equal('TxBinOp:= (TxName:y, TxConst:2)')

        const r3 = ReaderCtx.fromText('n\n =\n 1\n  k = 2')
        const n31 = parseExpression(r3, [';'])
        expect(n31.toString()).to.equal('TxBinOp:= (TxName:n, TxConst:1)')
        expect(n31.stopper).to.equal(';')
        expect(parseExpression(r3, [';']).toString()).to.equal('TxBinOp:= (TxName:k, TxConst:2)')
    })
    it('end of body', () => {
        expect(testStr('a = b\n}', [';'])).to.equal('TxBinOp:= (TxName:a, TxName:b)')
    })
    it('brackets', () => {
        expect(testStr('(a)')).to.eql('TxBrackets:( (TxName:a)')
        expect(testStr(' ( a ) ')).to.eql('TxBrackets:( (TxName:a)')
        expect(testStr('(a + b)')).to.eql('TxBrackets:( (TxBinOp:+ (TxName:a, TxName:b))')
        expect(testStr('c * (a + b)')).to.eql(
            'TxBinOp:* (TxName:c, TxBrackets:( (TxBinOp:+ (TxName:a, TxName:b)))')
        expect(testStr('(a + b) * c')).to.equal(
            'TxBinOp:* (TxBrackets:( (TxBinOp:+ (TxName:a, TxName:b)), TxName:c)')
        expect(testStr('"x" in dict')).to.equal('TxBinOp:in (TxConst:"x", TxName:dict)')
    })
    it('unary op', () => {
        expect(testStr('!a')).to.eql('TxUnOp:! (TxName:a)')
        expect(testStr('--a')).to.eql('TxUnOp:-- (TxName:a)')
        expect(testStr('-a')).to.eql('TxUnOp:- (TxName:a)')
        expect(testStr('a + -b')).to.eql('TxBinOp:+ (TxName:a, TxUnOp:- (TxName:b))')
        expect(testStr('!~a')).to.eql('TxUnOp:! (TxUnOp:~ (TxName:a))')
    })
    it('Postfix', () => {
        expect(testStr('i++')).to.equal('TxPostfix:++ (TxName:i)')
        expect(testStr('j-- + 1')).to.equal('TxPostfix:-- (TxBinOp:+ (TxName:j, TxConst:1))')
    })
    it('call', () => {
        expect(testStr('fn()')).to.equal('TxFnCall:call (TxName:fn)')
        expect(testStr('foo( )')).to.equal('TxFnCall:call (TxName:foo)')
        expect(testStr('fx( /* empty */ )')).to.equal('TxFnCall:call (TxName:fx)')

        expect(testStr('fn(x)')).to.equal('TxFnCall:call (TxName:fn, TxName:x)')
        expect(testStr('fn(x, y, 12)')).to.equal(
            'TxFnCall:call (TxName:fn, TxName:x, TxName:y, TxConst:12)')
        expect(testStr('min(x, f(y + 1))')).to.equal(
            'TxFnCall:call (TxName:min, TxName:x, TxFnCall:call (TxName:f, TxBinOp:+ (TxName:y, TxConst:1)))')
        expect(testStr('hoc(1)(2)')).to.equal(
            'TxFnCall:call (TxFnCall:call (TxName:hoc, TxConst:1), TxConst:2)')
        expect(testStr('!await exists(name)')).to.equal(
            'TxUnOp:! (TxUnOp:await (TxFnCall:call (TxName:exists, TxName:name)))')
        expect(testStr('new MyClass()')).to.equal('TxFnCall:call (TxUnOp:new (TxName:MyClass))')
    })
    it('arrow function', () => {
        expect(testStr('() => 123;', [';'])).to.equal('TxArrowFunc:=> (TxArguments:, TxConst:123)')
        expect(testStr('(x, y, z) => (x + y) * z', [';'])).to.equal(
            'TxArrowFunc:=> (TxArguments: (TxName:x, TxName:y, TxName:z), TxBinOp:* (TxBrackets:( (TxBinOp:+ (TxName:x, TxName:y)), TxName:z))'
        )
        expect(testStr('() => {}', [';'])).to.equal('TxArrowFunc:=> (TxArguments:, TxBody:{)')
        expect(testStr('(a, b) => {\n return a + b\n }', [';'])).to.equal(
            'TxArrowFunc:=> (TxArguments: (TxName:a, TxName:b), TxBody:{ (TxReturn:return (TxBinOp:+ (TxName:a, TxName:b))))')
    })
    it('arrow func detection', () => {
        const reader = ReaderCtx.fromText('x, y, z) => (x+y)*z')
        let nodes = []
        for (;;) {
            const node = parseExpression(reader, [',', ')'])
            nodes.push(node)
            if (node.stopper === ')') break
        }
        expect(reader.getNextLexem()).to.eql(Lex.cmd('=>'))
    })
    it('arrow function without brackets', () => {
        expect(testStr('first => second.toString(),', [','])).to.equal(
            'TxArrowFunc:=> (TxArguments: (TxName:first), TxFnCall:call (TxBinOp:. (TxName:second, TxName:toString)))'
        );
    })
    it('ternop', () => {
        expect(testStr('a < c ? first : second')).to.equal(
            'TxTernOp:? (TxBinOp:< (TxName:a, TxName:c), TxName:first, TxName:second)')
        expect(testStr('a ? first : second + 1')).to.equal(
            'TxTernOp:? (TxName:a, TxName:first, TxBinOp:+ (TxName:second, TxConst:1))')
        expect(testStr('a ? first + 2 : second')).to.equal(
            'TxTernOp:? (TxName:a, TxBinOp:+ (TxName:first, TxConst:2), TxName:second)')
    })
    it('Array declaration', () => {
        expect(testStr('[]')).to.equal('TxArray:[')
        expect(testStr('[12]')).to.equal('TxArray:[ (TxConst:12)')
        expect(testStr('[x, y,]')).to.equal('TxArray:[ (TxName:x, TxName:y, :)')
        expect(testStr('[x, y, z]')).to.equal('TxArray:[ (TxName:x, TxName:y, TxName:z)')
        expect(testStr('[x, y].map')).to.equal('TxBinOp:. (TxArray:[ (TxName:x, TxName:y), TxName:map)')
        expect(testStr('[[x, 1], [y, 2]]')).to.equal(
            'TxArray:[ (TxArray:[ (TxName:x, TxConst:1), TxArray:[ (TxName:y, TxConst:2))')
        // example of destructuring
        expect(testStr('[,x,,y=10]')).to.equal(
            'TxArray:[ (:, TxName:x, :, TxBinOp:= (TxName:y, TxConst:10))')
    })
    it('Index of an array or object', () => {
        expect(testStr('arr[i]')).to.equal('TxIndex:[ (TxName:arr, TxName:i)')
        expect(testStr('a + arr[i+1]')).to.equal(
            'TxBinOp:+ (TxName:a, TxIndex:[ (TxName:arr, TxBinOp:+ (TxName:i, TxConst:1)))')
        expect(testStr('a + arr[i] * b')).to.equal(
            'TxBinOp:+ (TxName:a, TxBinOp:* (TxIndex:[ (TxName:arr, TxName:i), TxName:b))')
        expect(testStr('fn(x)[i]')).to.equal('TxIndex:[ (TxFnCall:call (TxName:fn, TxName:x), TxName:i)')
    })
    it('ObjectDecl', () => {
        expect(testStr('{}')).to.equal('TxObject:{')
        expect(testStr('{x: 10}')).to.equal('TxObject:{ (TxName:x, TxConst:10)')
        expect(testStr('{x: 10, y: 20}')).to.equal(
            'TxObject:{ (TxName:x, TxConst:10, TxName:y, TxConst:20)')
        const n = parseExpression(ReaderCtx.fromText('{name, value: name}'))
        expect(n.toString()).to.equal(
            'TxObject:{ (TxName:name, TxName:value, TxName:name)')
        expect(n.args.map(i => i.stopper)).to.eql([',', ':', '}'])

        expect(testStr('{test: /\\.js$/,}')).to.equal(
            'TxObject:{ (TxName:test, TxConst:/\\.js$/, :)')
    })
    it('spread', () => {
        expect(testStr('[...a]')).to.equal('TxArray:[ (TxUnOp:... (TxName:a))')
        expect(testStr('{...props, x: 12}')).to.equal(
            'TxObject:{ (TxUnOp:... (TxName:props), TxName:x, TxConst:12)')
    })
    it('function', () => {
        const n1 = parseExpression(ReaderCtx.fromText('function f(x, y) { print(x+y); }'))
        const args = 'TxArguments: (TxName:x, TxName:y)'
        const body = 'TxBody:{ (TxFnCall:call (TxName:print, TxBinOp:+ (TxName:x, TxName:y)))'
        expect(n1.name).to.equal('f')
        expect(n1.toString()).to.equal(`TxFunction:function (${args}, ${body})`)
    })
    it('function2', () => {
        const src = 'function dist(x,y){\n const x2=x*x, y2=y*y\n return sqrt(x2+y2)\n}'
        const n1 = parseExpression(ReaderCtx.fromText(src))
        expect(n1.name).to.equal('dist')
        const dst = 'TxFunction:function ('+
            'TxArguments: (TxName:x, TxName:y), '+
            'TxBody:{ ('+
            'TxVarDecl:const (TxBinOp:= (TxName:x2, TxBinOp:* (TxName:x, TxName:x)), TxBinOp:= (TxName:y2, TxBinOp:* (TxName:y, TxName:y))), '+
            'TxReturn:return (TxFnCall:call (TxName:sqrt, TxBinOp:+ (TxName:x2, TxName:y2)))'+
            '))'
        expect(n1.toString()).to.equal(dst)
    })
})

