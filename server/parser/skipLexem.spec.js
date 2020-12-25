const {expect} = require('chai')
const {skipLexem} = require('./skipLexem')
const {Lex} = require('./Lex')

describe('skipLexem', () => {
    it('single spaces', () => {
        // 0    12345678910
        // const x = y + 22
        const lexems = [Lex.id('const'), Lex.space, Lex.id('x'), Lex.space, Lex.cmd('='),
            Lex.space, Lex.id('y'), Lex.space, Lex.cmd('+'), Lex.space, Lex.num(22)]
        expect(skipLexem(lexems, 0, 1)).to.equal(2)
        expect(skipLexem(lexems, 0, 2)).to.equal(4)
        expect(skipLexem(lexems, 10, -1)).to.equal(8)
        expect(skipLexem(lexems, 10, -2)).to.equal(6)
        // маловероятно, но должно работать
        expect(skipLexem(lexems, 3, 1)).to.equal(4)
        expect(skipLexem(lexems, 3, -1)).to.equal(2)
        // wrong cases
        expect(skipLexem(lexems, -10, 1)).to.equal(-1)
        expect(skipLexem(lexems, 100, -1)).to.equal(-1)
        expect(skipLexem(lexems, 0, -10)).to.equal(-1)
        expect(skipLexem(lexems, 2, -10)).to.equal(-1)
        expect(skipLexem(lexems, 10, 1)).to.equal(-1)
    })
    it('multiple spaces', () => {
        // 0   123 4         5
        // name =  // comment
        //     "hello";
        // 6   7      8
        const lexems = [Lex.id('name'), Lex.space, Lex.cmd('='), Lex.spaces('  '),
            Lex.comm('// comment'), Lex.eol, Lex.spaces('\t'), Lex.str('"hello"'), Lex.cmd(';')]
        expect(skipLexem(lexems, 0, 1)).to.equal(2)
        expect(skipLexem(lexems, 0, 2)).to.equal(7)
        expect(skipLexem(lexems, 0, 3)).to.equal(8)
        expect(skipLexem(lexems, 0, 4)).to.equal(-1)

        expect(skipLexem(lexems, 8, -1)).to.equal(7)
        expect(skipLexem(lexems, 8, -2)).to.equal(2)
        expect(skipLexem(lexems, 8, -3)).to.equal(0)
        expect(skipLexem(lexems, 8, -4)).to.equal(-1)
    })
})