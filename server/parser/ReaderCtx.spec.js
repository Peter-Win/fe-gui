const {expect} = require('chai')
const {ReaderCtx} = require('./ReaderCtx')
const {Lex} = require('./Lex')

it('ReaderCtx', () => {
    const reader = new ReaderCtx()
    reader.setText('const x = Math.max(y, 100);')
    expect(reader.readLexem()).to.eql(Lex.id('const'))
    expect(reader.readLexem()).to.eql(Lex.space)
    expect(reader.readLexem()).to.eql(Lex.id('x'))
    expect(reader.readLexem()).to.eql(Lex.space)
    expect(reader.readLexem()).to.eql(Lex.cmd('='))
    expect(reader.readLexem()).to.eql(Lex.space)
    expect(reader.readLexem()).to.eql(Lex.id('Math'))
    expect(reader.readLexem()).to.eql(Lex.cmd('.'))
    expect(reader.readLexem()).to.eql(Lex.id('max'))
    expect(reader.readLexem()).to.eql(Lex.cmd('('))
    expect(reader.readLexem()).to.eql(Lex.id('y'))
    expect(reader.readLexem()).to.eql(Lex.cmd(','))
    expect(reader.readLexem()).to.eql(Lex.space)
    expect(reader.readLexem()).to.eql(Lex.num(100))
    expect(reader.readLexem()).to.eql(Lex.cmd(')'))
    expect(reader.readLexem()).to.eql(Lex.cmd(';'))
    expect(reader.readLexem()).to.equal(null)
    expect(reader.readLexem()).to.equal(null)
})