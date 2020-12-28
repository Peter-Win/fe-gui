const {expect} = require('chai')
const {formatChunks} = require('./WriterCtx')
const {Chunk} = require('./Chunk')
const {Style} = require('./Style')
const {parseExpression} = require('./parseExpression')
const {ReaderCtx} = require('./ReaderCtx')

const chunks = [Chunk.keyword('function'),
    Chunk.name('fn'), Chunk.paramsBegin, Chunk.paramsEnd, Chunk.bodyBegin,
    Chunk.keyword('if'), Chunk.bracketBegin, Chunk.name('first'), Chunk.bracketEnd, Chunk.bodyBegin,
    Chunk.name('print'), Chunk.paramsBegin, Chunk.Const('"Hello"'), Chunk.paramsEnd, Chunk.instrDiv,
    Chunk.bodyEnd, Chunk.keyword('else'), Chunk.keyword('if'), Chunk.bracketBegin,
    Chunk.name('second'), Chunk.bracketEnd, Chunk.bodyBegin,
    Chunk.name('return'), Chunk.instrDiv,
    Chunk.bodyEnd, Chunk.keyword('else'), Chunk.bodyBegin,
    Chunk.bodyEnd, Chunk.instrDiv,
    Chunk.bodyEnd,
]

describe('formatChunks', () => {
    it('4 spaces and no semi', () => {
        const style = new Style()
        style.semi = false
        style.tabWidth = 4
        const dst = formatChunks(chunks, style)
        expect(dst).to.equal(`function fn() {
    if (first) {
        print("Hello")
    } else if (second) {
        return
    } else {
    }
}`)
    })
    it('tabs with semi', () => {
        const style = new Style()
        style.semi = true
        style.useTabs = true
        const dst = formatChunks(chunks, style)
        expect(dst).to.equal(`function fn() {
\tif (first) {
\t\tprint("Hello");
\t} else if (second) {
\t\treturn;
\t} else {
\t}
}`)
    })
})

it('Array', () => {
    const src = '{list:[first,second,{x:1,y:2}]}'
    const expected = `{
  list: [
    first,
    second,
    {
      x: 1,
      y: 2,
    },
  ],
}`
    const tax = parseExpression(ReaderCtx.fromText(src)).createTaxon()
    const style = new Style()
    const chunks = []
    tax.exportChunks(chunks, style)
    const dst = formatChunks(chunks, style)
    expect(dst).to.equal(expected)
})