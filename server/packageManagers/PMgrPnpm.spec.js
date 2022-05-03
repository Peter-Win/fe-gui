const {expect} = require('chai')
const {findVersionInYaml} = require('./PMgrPnpm')

const pnpmLockYaml = `
lockfileVersion: 5.4

specifiers:
  react: ^18.1.0
  webpack: ^5.72.0

dependencies:
  react: 18.1.0

devDependencies:
  webpack: 5.72.0

packages:

  /react/18.1.0:
    resolution: {integrity: sha512-4oL8ivCz5ZEPyclFQXaNksK3adutVS8l2xzZU0cqEFrE9Sb7fC0EFK5uEk74wIreL1DERyjvsU915j1pcT2uEQ==}
    engines: {node: '>=0.10.0'}
    dependencies:
      loose-envify: 1.4.0
    dev: false
`.split('\n')

describe('findVersionInYaml', () => {
    it('react', () => {
        expect(findVersionInYaml(pnpmLockYaml, 'react')).to.equal('18.1.0')
    })
    it('webpack', () => {
        expect(findVersionInYaml(pnpmLockYaml, 'webpack')).to.equal('5.72.0')
    })
    it('not found', () => {
        expect(findVersionInYaml(pnpmLockYaml, 'wrongName')).to.be.null
    })
})