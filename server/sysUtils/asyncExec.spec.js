const {expect} = require('chai')
const {asyncExec} = require('./asyncExec')

describe('asyncExec', () => {
    it('npm search success', async () => {
        const {stdout, stderr} = await asyncExec('npm search ws --json')
        expect(typeof stdout).to.equal('string')
        expect(typeof stderr).to.equal('string')
        const stdoutTxt = stdout.replace(/\s/g, '')
        expect(stdoutTxt.slice(0, 14)).to.equal('[{"name":"ws",')
        const result = JSON.parse(stdout)
        expect(result).to.be.an.instanceof(Array)
        expect(result[0]).to.have.property('name', 'ws')
    })
    /* С какой-то новой версии npm не выдает ошибку, а выдает пустой список
    it('npm search fail', async () => {
        let err = null
        try {
            await asyncExec('npm search яя --json')
        } catch(e) {
            err = e
        }
        expect(err).to.not.be.null
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.include('Command failed: npm search яя --json')
    })
    */
})