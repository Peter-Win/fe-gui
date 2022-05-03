const path = require('path')
const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {asyncExecShell} = require('../sysUtils/asyncExec')
const {makeFullName} = require('../fileUtils')
const {makeScriptCommand} = require('../sysUtils/makeScriptCommand')

class Husky {
    name = 'Husky'
    depends = ['Git']
    isInit = false
    isReady = false

    async init() {
        this.isInit = false
        this.isReady = false
        const { entities: { PackageJson, Git } } = require('./all')
        if (!Git.isInit) return
        this.isInit = PackageJson.isDevDependency('husky')
        this.isReady = !this.isInit
    }

    defaultParams = {
        hooks: [{type: 'pre-commit', cmd: ''}],
    }
    upgradeFormType = 'Hooks'

    /**
     *
     * @param {{hooks: Array<{type: string, cmd: string}>}} params
     * @return {Promise<void>}
     */
    async create(params) {
        const {name} = this
        const {packageManager} = CommonInfo
        await asyncExecShell(name, packageManager.makeNpx('husky-init'))
        await asyncExecShell(name, packageManager.makeInstallAll())
        params.hooks.forEach(e => console.log(e.type, '=>', e.cmd))
        for (let e of params.hooks) {
          await asyncExecShell(name, packageManager.makeNpx(`husky add .husky/${e.type} "${e.cmd}"`))
        }
    }

    async makeGuiData() {
        const { entities: { PackageJson } } = require('./all')
        const hooksDir = path.join(makeFullName('.git'), 'hooks')
        const filesList = await fs.promises.readdir(hooksDir)
        const namesSet = new Set(filesList.map(f => f.split('.')[0]))
        await PackageJson.load()
        return {
            hooks: Array.from(namesSet),
            scripts: Object.keys(PackageJson.data.scripts || {}).map(cmd => makeScriptCommand(cmd)),
        }
    }

    description = `<h2>husky</h2>
<p>Modern native Git hooks made easy</p>
<p>Husky improves your commits and more 🐶 woof!</p>
<style>
  .hook-row { display: flex; margin: 0.2em 0; }
  .hook-row > * { margin-right: 0.5em; }
  .hook-cmd-src { padding: 0.2em; border: thin solid silver; }
  .hook-cmd-src > * {
    cursor: move; background: #EEE; border-radius: 0.3em; padding: 0.2em 0.4em; display: inline-block; margin: 0.2em 0.4em; 
  }
  .hook-cmd-drop-ready { background: #DFD !important; }
  .rn-ctrl .hook-drop-target { background: #FFD; }
</style>
<script>
  var npmCommands = guiData.scripts;
  var g_hooks = guiData.hooks;
  Rn.C.HookCmd = function() {
    this.superClass = 'String';
    this.render = function() {
      var ctrl = this;
      function clear() { ctrl.$edit.removeClass('hook-cmd-drop-ready'); }
      ctrl.String_render();
      ctrl.$edit.on('dragenter', function(){
        ctrl.$edit.addClass('hook-cmd-drop-ready');
      }).on('dragover', function(ev) {
        ev.preventDefault();
      }).on('dragleave', function(ev){
        clear();
      }).on('drop', function(ev){
        var data = ev.originalEvent.dataTransfer.getData("text");
        ctrl.setValue(data)
        clear();
      });
    }
  }
  Rn.F.Hooks = function() {
    this.superClass = 'Upgrade';
    this.onInit = function() {
      var $def = this.$def;
      function backlight(on) {
        $('input[name=cmd]', $def).each(function(){
          $(this).toggleClass('hook-drop-target', on);
        });
      }
      function create(cmd) {
        var elem = $('<span/>').text(cmd).attr({draggable: true}).on('dragstart', function(ev){
          ev.originalEvent.dataTransfer.setData("text", cmd);
          backlight(true);
        }).on('dragend', function(ev){
          backlight(false);
        });
        $('.hook-cmd-src', this.$def).append(elem);
      }
      for (var i in npmCommands) create(npmCommands[i]);
    }
  }
</script>
  <script id="TmCtrlArray" type="text/html">
      <div>
        {{title}}:
        <div class="rn-array"></div>
        <button type="button" class="rn-add-item">Add command</button>
      </div>
  </script>

  <script id="TmHookItem" type="text/html">
    <div class="hook-row">
      <div class="rn-ctrl" data-name="type" data-type="Droplist" 
        data-options="g_hooks" data-option_label="#" data-option_value="#" data-value0="pre-commit"
        ></div>
      <div class="rn-ctrl" data-name="cmd" data-type="HookCmd" data-placeholder="command">
        <b class="rn-validator" data-type="NonEmpty" data-msg="Command required"></b>
      </div>
      <button type="button" class="rn-del-item">Delete</button>
    </div>
  </script>
`

    controls = `
    <div class="rn-ctrl" data-name="hooks" data-type="Array" data-title="Commands"
         data-item_tm="TmHookItem"></div>
    <div>Drag the command to an editable field.</div>
    <div class="hook-cmd-src"></div>
    `
}

module.exports = {Husky}