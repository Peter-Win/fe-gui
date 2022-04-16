const {expect} = require('chai')
const {parseLexems} = require('./parseLexems')
const {Lex} = require('./Lex')

describe('parseLexems', () => {
    it('eol', () => {
        expect(parseLexems('\n\n\n')).to.eql([Lex.eol, Lex.eol, Lex.eol])
        expect(parseLexems('\n\r\n\r\n\r')).to.eql([Lex.eol, Lex.eol, Lex.eol])
    })
    it('space', () => {
        expect(parseLexems('   \n  ')).to.eql([Lex.spaces('   '), Lex.eol, Lex.spaces('  ')])
        expect(parseLexems('\t\t\t')).to.eql([Lex.spaces('\t\t\t')])
    })
    it('id', () => {
        expect(parseLexems('lastName')).to.eql([Lex.id('lastName')])
        expect(parseLexems('hello21')).to.eql([Lex.id('hello21')])
        expect(parseLexems('node_modules')).to.eql([Lex.id('node_modules')])
        expect(parseLexems('hello world')).to.eql([Lex.id('hello'), Lex.space, Lex.id('world')])
    })
    it('cmd', () => {
        expect(parseLexems('*')).to.eql([Lex.cmd('*')])
        expect(parseLexems('-')).to.eql([Lex.cmd('-')])
        expect(parseLexems('--')).to.eql([Lex.cmd('--')])
        expect(parseLexems('+++')).to.eql([Lex.cmd('++'), Lex.cmd('+')])
        expect(parseLexems('+a')).to.eql([Lex.cmd('+'), Lex.id('a')])
        expect(parseLexems('...a')).to.eql([Lex.cmd('...'), Lex.id('a')])
    })
    it('number', () => {
        expect(parseLexems('1')).to.eql([Lex.num('1')])
        expect(parseLexems('123')).to.eql([Lex.num('123')])
        expect(parseLexems('-1')).to.eql([Lex.num('-1')])
        expect(parseLexems('-900')).to.eql([Lex.num('-900')])
        expect(parseLexems('1A')).to.eql([Lex.num('1'), Lex.id('A')])
        expect(parseLexems('0x1')).to.eql([Lex.num('0x1')])
        expect(parseLexems('0xABCD')).to.eql([Lex.num('0xABCD')])
        expect(parseLexems('-0xFE')).to.eql([Lex.num('-0xFE')])
        expect(parseLexems('-0xfe-a')).to.eql([Lex.num('-0xfe'), Lex.cmd('-'), Lex.id('a')])
        expect(parseLexems('-0xfe+2')).to.eql([Lex.num('-0xfe'), Lex.cmd('+'), Lex.num(2)])
        expect(parseLexems('3.14')).to.eql([Lex.num('3.14')])
        expect(parseLexems('3.14+e')).to.eql([Lex.num('3.14'), Lex.cmd('+'), Lex.id('e')])
        expect(parseLexems('-0.123e-12')).to.eql([Lex.num('-0.123e-12')])
        expect(parseLexems('-0.123e-12*x')).to.eql([Lex.num('-0.123e-12'), Lex.cmd('*'), Lex.id('x')])
        expect(parseLexems('1e2')).to.eql([Lex.num('1e2')])
    })
    it('comment', () => {
        expect(parseLexems(' // hello')).to.eql([Lex.space, Lex.comm('// hello')])
        expect(parseLexems('// hello\nworld')).to.eql([Lex.comm('// hello'), Lex.eol, Lex.id('world')])
        expect(parseLexems('/* comment */')).to.eql([Lex.comm('/* comment */')])
        expect(parseLexems(' /* comment */ ')).to.eql([Lex.space, Lex.comm('/* comment */'), Lex.space])
        expect(parseLexems(' /* first\n second */ ')).to.eql(
            [Lex.space, Lex.comm('/* first\n second */'), Lex.space])
    })
    it('string', () => {
        // simple cases
        expect(parseLexems("'hello'")).to.eql([Lex.str("'hello'")])
        expect(parseLexems('"world"')).to.eql([Lex.str('"world"')])
        expect(parseLexems('`long comment`')).to.eql([Lex.str('`long comment`')])
        // escaped chars
        expect(parseLexems(`'D\\'Artagnan'`)).to.eql([Lex.str(`'D\\'Artagnan'`)])
        expect(parseLexems(`"name=\\"A\\""`)).to.eql([Lex.str(`"name=\\"A\\""`)])
        expect(parseLexems('`let s=\\`B\\``')).to.eql([Lex.str('`let s=\\`B\\``')])
        const multiLine = `\`first
second\``
        expect(parseLexems(multiLine)).to.eql([Lex.str('\`first\nsecond\`')])
        expect(parseLexems("s='hello'")).to.eql([Lex.id('s'), Lex.cmd('='), Lex.str("'hello'")])
        expect(parseLexems('"a"+a')).to.eql([Lex.str('"a"'), Lex.cmd('+'), Lex.id('a')])
    })
    it('regexp', () => {
        expect(parseLexems('/^hello$/')).to.eql([Lex.regexp('/^hello$/')])
        expect(parseLexems("/\\.js$/.test('.js')")).to.eql([Lex.regexp('/\\.js$/'),
            Lex.cmd('.'), Lex.id('test'), Lex.cmd('('), Lex.str("'.js'"), Lex.cmd(')')])
        // escaped slash
        expect(parseLexems('/^a\\/b$/')).to.eql([Lex.regexp('/^a\\/b$/')])
        // suffixes
        expect(parseLexems('/[a-z]+/ig.test')).to.eql([Lex.regexp('/[a-z]+/ig'),
            Lex.cmd('.'), Lex.id('test')])
        // division
        expect(parseLexems('a/b')).to.eql([Lex.id('a'), Lex.cmd('/'), Lex.id('b')])
        expect(parseLexems('1.0/b')).to.eql([Lex.num('1.0'), Lex.cmd('/'), Lex.id('b')])
        expect(parseLexems('(a)/b')).to.eql([Lex.cmd('('), Lex.id('a'), Lex.cmd(')'),
            Lex.cmd('/'), Lex.id('b')])
        expect(parseLexems('a / b')).to.eql([Lex.id('a'), Lex.space, Lex.cmd('/'),
            Lex.space, Lex.id('b')])
        expect(parseLexems('x=/a/i')).to.eql([Lex.id('x'), Lex.cmd('='), Lex.regexp('/a/i')])
    })
    it('arrow function', () => {
        expect(parseLexems('() => -123.4')).to.deep.equal([
            Lex.cmd('('), Lex.cmd(')'), Lex.space, Lex.cmd('=>'), Lex.space, Lex.num('-123.4')
        ])
        expect(parseLexems('() => {}')).to.deep.equal([
            Lex.cmd('('), Lex.cmd(')'), Lex.space, Lex.cmd('=>'), Lex.space, Lex.cmd('{'), Lex.cmd('}')
        ])
    })
})