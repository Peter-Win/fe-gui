var srcFoldersList = [];

Rn.F.Aliases = function() {
    var askCounter = 0;
    var foldersHash = '';
    function srcAsk() {
        wsSend('srcFoldersAsk');
    }
    function srcAskDebounce() {
        askCounter++;
        setTimeout(function(){
            askCounter--;
            if (askCounter === 0) srcAsk();
        }, 300);
    }
    this.superClass = 'Upgrade';
    this.onInit = function() {
        wsOff('srcFolders');
        wsOn('srcFolders', function(folders){
            srcFoldersList = folders;
            var i, datalist = $('#foldersForAliases').empty();
            for (i=0; i<folders.length; i++) {
                $('<option/>').val(folders[i]).appendTo(datalist);
            }
            Rn.update();
        });
        srcAsk();
        var i, data = {pairs: []}
        for (var i=0; i<AliasData.pairs.length; i++) {
            var pair = AliasData.pairs[i];
            data.pairs.push({oldKey: pair[0], key: pair[0], value: pair[1]});
        }
        this.load(data);
    }
    this.onUpdate = function() {
        var data = this.save();
        var i, pairs = data.pairs, values=[];
        for (i=0; i<pairs.length; i++) values.push(pairs[i].value);
        var newHash = values.join('\n');
        if (newHash !== foldersHash) {
            foldersHash = newHash;
            srcAskDebounce();
        }
    }
}

Rn.V.AliasReserved = function() {
    this.superClass = "Base";
    this.check = function(value) {
        if (value in AliasData.reserved) {
            return this.msg;
        }
    }
}

Rn.V.AliasDuplicate = function() {
    this.superClass = "Base";
    this.check = function(value) {
        var thisRow = this.ctrl.owner;
        var ctrlList = thisRow.owner;
        var i, rows = ctrlList.items;
        for (i=0; i<rows.length; i++) {
            var row = rows[i];
            if (row !== thisRow && 'key' in row.ctrls) {
                var v = row.ctrls.key.getValue();
                if (v === value) return this.msg;
            }
        }
    }
}

Rn.V.SrcFolder = function() {
    this.superClass = "Base";
    this.check = function(value) {
        var i;
        for (i=0; i<srcFoldersList.length; i++) {
            if (srcFoldersList[i] === value) return '';
        }
        return this.msg;
    }
}