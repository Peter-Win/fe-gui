const { installPackageSmart } = require('../commands/installPackage')
const { wsSendCreateEntity } = require('../wsSend')

class ReactTestingLibrary {
    name = 'ReactTestingLibrary'
    depends = ['React', 'Jest']
    isInit = false
    isReady = false

    async init() {
        const {entities} = require('./all')
        const { PackageJson, React, Jest } = entities
        this.isReady = false
        this.isInit = PackageJson.isDevDependency('@testing-library/react')
        if (!this.isInit) {
            this.isReady = React.isInit && Jest.isInit
        }
    }

    async create() {
        await installPackageSmart(this.name, ['@testing-library/react', '@testing-library/jest-dom'])
        wsSendCreateEntity(this.name, 'Now, when creating tests through the ReactComponent addon, React Testing Library will be used.', 'success')
    }

    description = `
    <h2 style="display: flex; flex-direction: row; align-items: center; margin-bottom: .5em;">
      <img
        src="https://raw.githubusercontent.com/testing-library/react-testing-library/main/other/goat.png"
        alt="React Testing Library" 
        style="width: 32px; margin-right: 0.5em;"
      />
      React Testing Library
    </h2>
    <div>
      This library allows you to write much less code for developing tests.
    </div>
    <div>
      <a href="https://testing-library.com/docs/react-testing-library/intro" target="_blank">Official page</a>
    </div>
    `
}

module.exports = { ReactTestingLibrary }