const {isFileExists, makeFullName} = require('../fileUtils')
const {wsSendCreateEntity} = require('../wsSend')
const {execGit} = require('../sysUtils/execGit')
const {updateGitIgnoreFileMsg} = require('../commands/updateGitIgnore')
const {makeCmdLineParam} = require('../sysUtils/makeCmdLineParam')
const {CommonInfo} = require('../CommonInfo')

class Git {
    name = 'Git'
    depends = []
    isInit = false
    isReady = false

    async init() {
        this.isInit = await isFileExists(makeFullName('.git'))
        this.isReady = !this.isInit
        if (this.isInit) {
            CommonInfo.tech.vcs = this.name
        }
    }

    /**
     * @param {Object} params
     * @param {string} params.url
     * @param {string} params.origin  default = "origin" for "push {origin} master"
     * @param {string} params.commitText
     * @return {Promise<void>}
     */
    async create(params) {
        const cmdGit = async (command) => {
            return execGit(this.name, command)
        }
        const {url, origin, commitText} = params;
        const escOrigin = makeCmdLineParam(origin, false)
        await cmdGit('init')
        await updateGitIgnoreFileMsg(this.name)
        await cmdGit('add -A')
        await cmdGit(`commit -m ${makeCmdLineParam(commitText, true)}`)
        await cmdGit(`remote add ${escOrigin} ${makeCmdLineParam(url, false)}`)
        const msg = `Attention! Most likely, the next operation will require authentication.
        To do this, a system window will appear for entering a username and password. 
        You will need to switch to it manually.`
        wsSendCreateEntity(this.name, msg, 'err')
        await cmdGit(`push -u ${escOrigin} master`)
    }
    defaultParams = {url: '', origin: 'origin', commitText: 'The first version of the project'}
    description = `
<style>
.git-hdr-end {margin-bottom: 2em;}
.git-ctrls > * { margin: .5em 0;}
.git-ctrls .title {
    display: inline-block;
    min-width: 8em;
}
.git-ctrls input[name=url] { width: 24em;}
.git-ctrls input[name=commitText] { width: 20em;}
.git-row {display: flex; align-items: baseline;}
.git-ctrl-subtitle {color: #555;}
</style>
 <div>
   <img src="https://git-scm.com/images/logo@2x.png" width="110" height="46" alt="Git" />
 </div>
 <div>
   Git is a free and open source distributed version control system. 
</div>
<div class="git-hdr-end">
  <a href="https://git-scm.com/" target="_blank">Official site</a>
</div>
<div>
  After clicking the UPGRADE button, the project will be added to the new remote repository.
</div>
    `
    controls = `
<div class="git-ctrls">
  <div class="git-ctrl-subtitle">
    Please create a remote repository (for example on github.com) and enter the url you received.
  </div>
  <div class="rn-ctrl" data-name="url" data-type="String" data-title="Remote URL" data-autofocus="1">
    <b class="rn-validator" data-type="NonEmpty" data-msg="The url of the repository is a required field"></b>
  </div>
<div class="rn-ctrl" data-name="origin" data-type="String" data-title="Remote name">
  <b class="rn-validator" data-type="NonEmpty"></b>
  <b class="rn-validator" data-type="Regexp" data-regexp="/^[-_a-z]*$/" data-msg="Invalid characters"></b>
</div>
<div class="rn-ctrl" data-name="commitText" data-type="String" data-title="Commit text"></div>
</div>
    `
}
module.exports = {Git}