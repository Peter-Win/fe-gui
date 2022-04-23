const {expect} = require('chai')
const {parseExpression} = require('../parseExpression')
const {ReaderCtx} = require('../ReaderCtx')
const {Style} = require('../Style')
const {chunks2text} = require('../Chunk')

const parse = text => parseExpression(ReaderCtx.fromText(text)).createTaxon()
const write = taxon => {
    const chunks = []
    taxon.exportChunks(chunks, new Style())
    return chunks2text(chunks)
}

it('TxBinOp', () => {
    expect(write(parse('a+1'))).to.equal('a + 1')
    expect(write(parse('1+a**2'))).to.equal('1 + a ** 2')
    expect(write(parse('first.org.x*2'))).to.equal('first.org.x * 2')
    expect(write(parse('a*(b+c)'))).to.equal('a * (b + c)')
    expect(write(parse('-a+b'))).to.equal('-a + b')
})

it('TxArray', () => {
    expect(write(parse('a = []'))).to.equal('a = []')
    expect(write(parse('[a+b]'))).to.equal('[a + b]')
    expect(write(parse('[1,2,3]'))).to.equal('[1, 2, 3]')
    expect(write(parse('a[i]'))).to.equal('a[i]')
    expect(write(parse('elem=matrix[y][x+1]'))).to.equal('elem = matrix[y][x + 1]')
    expect(write(parse('dict[name](x,y)'))).to.equal('dict[name](x, y)')
})

it('TxFnCall', () => {
    expect(write(parse('myFunc()'))).to.equal('myFunc()')
    expect(write(parse('myFunc(a)'))).to.equal('myFunc(a)')
    expect(write(parse('myFunc(a/b)'))).to.equal('myFunc(a / b)')
    expect(write(parse('myFunc(x, y, z)'))).to.equal('myFunc(x, y, z)')
    expect(write(parse('await myFunc(name)'))).to.equal('await myFunc(name)')
    expect(write(parse('new MyClass()'))).to.equal('new MyClass()')
    expect(write(parse('new MyClass(a, b)'))).to.equal('new MyClass(a, b)')
})

it('TxPostfix', () => {
    expect(write(parse('++i'))).to.equal('++i')
    expect(write(parse('i++'))).to.equal('i++')
})

it('TxObject', () => {
    expect(write(parse('{}'))).to.equal('{}')

    const tx1 = parse('{x:1.1,y:2.2}')
    expect(write(tx1)).to.equal('{x: 1.1, y: 2.2}')
    expect(Object.keys(tx1.dict)).to.eql(['x', 'y'])
    expect(write(tx1.dict.x)).to.equal('1.1')

    const tx2 = parse('{value,key:value + "!"}')
    expect(write(tx2)).to.equal('{value, key: value + "!"}')
    expect(tx2.items).to.be.lengthOf(2)
    expect(Object.keys(tx2.dict)).to.eql(['value', 'key'])
    expect(write(tx2.dict.value)).to.equal('value')
    expect(write(tx2.dict.key)).to.equal('value + "!"')

    expect(write(parse('{1: "one", "2-1": "two"}'))).to.equal('{1: "one", "2-1": "two"}')
    expect(write(parse('{...acc,[key]:value}'))).to.equal('{...acc, [key]: value}')
})

it('TxTernOp', () => {
    expect(write(parse("a<b?'yes':'no'"))).to.equal("a < b ? 'yes' : 'no'")
    expect(write(parse('0 <= x && x < 1 ? Math.floor(x) : Math.min(1, Math.max(0, x))')))
        .to.equal('0 <= x && x < 1 ? Math.floor(x) : Math.min(1, Math.max(0, x))')
    expect(write(parse('value === ok ? a+b*c:a**2'))).to.equal(
        'value === ok ? a + b * c : a ** 2')
})

describe('Destructuring.', () => {
    it('list matching', () => {
        expect(write(parse('[a,,b] = [1,2,3]'))).to.equal('[a, , b] = [1, 2, 3]')
        expect(write(parse('[a=1]=[]'))).to.equal('[a = 1] = []')
        const tx1 = parse('[ a, [ b, c, d ], e ] = array')
        expect(write(tx1)).to.equal('[a, [b, c, d], e] = array')
        // Извлечь имена переменных
        const names = []
        tx1.walk(taxon => {
            if (taxon.owner && taxon.owner.type === 'TxArrayDestruct' && taxon.name) names.push(taxon.name)
        })
        expect(names).to.eql(['a', 'b', 'c', 'd', 'e'])
    })
    it('Objects', () => {
        const getVarNames = (taxon) => {
            let list = []
            taxon.walk(curItem => {
                if (curItem.type === 'TxObjectDestruct') {
                    list = [...list, ...curItem.getAllVars().map(taxon => taxon.name)]
                }
            })
            return list
        }
        const tx1 = parse('{x,y}=this')
        expect(write(tx1)).to.equal('{x, y} = this')
        expect(getVarNames(tx1)).to.eql(['x', 'y'])

        const tx2 = parse('{a=1, b=2}=src')
        expect(write(tx2)).to.equal('{a = 1, b = 2} = src')
        expect(getVarNames(tx2)).to.eql(['a', 'b'])

        const tx3 = parse('{a, b:B, c:C=22} = props')
        expect(tx3.left.type).to.equal('TxObjectDestruct')
        expect(tx3.left.items).to.be.lengthOf(3)
        expect(write(tx3)).to.equal('{a, b: B, c: C = 22} = props')
        expect(getVarNames(tx3)).to.eql(['a', 'B', 'C'])

        const tx4 = parse('{x:{y:{z:w}}} = {x:{y:{z:100}}}')
        expect(write(tx4)).to.equal('{x: {y: {z: w}}} = {x: {y: {z: 100}}}')
        expect(getVarNames(tx4)).to.eql(['x','y','w'])
    })
})