
var foldersSet = {}

/**
 * @param {{files: {name: string; data: string;}[]} | null} info 
 */
function drawComponentPreview(info) {
    var $dst = $('#react-component-preview').empty()
    if (info) {
        info.files.forEach(function(fileRec){
            Rn.tm('TmFilePreview', fileRec, $dst)
        })
    } else {
        Rn.tm('TmNoPreview', null, $dst)
    }
}

Rn.F.ReactComponent = function() {
    function srcAsk() {
        wsSend('srcFoldersAsk');
    }
    this.superClass = 'Upgrade';
    this.onInit = function () {
        wsOff('srcFolders');
        wsOn('srcFolders', function(folders){
            srcFoldersList = folders;
            var i, datalist = $('#foldersForReactComp').empty();
            foldersSet = {}
            for (i=0; i<folders.length; i++) {
                $('<option/>').val(folders[i]).appendTo(datalist);
                foldersSet[folders[i]] = 1;
            }
            Rn.update();
        });
        wsOff('componentPreview');
        wsOn('componentPreview', drawComponentPreview)
        $('#react-comp-folders-reload').on('click', function(e){
            e.preventDefault();
            srcAsk();
        });
        srcAsk();
    }
    var availJest = null;
    var jestOptions = null;
    var availInlineSnapshots = null;
    var availStorybook = null, useStorybook = null;
    this.onUpdate = function() {
        var isAvailJest = !!this.ctrls.availJest.getValue()
        if (isAvailJest !== availJest) {
            availJest = isAvailJest
            $('#react-comp-jest').toggle(availJest)
        }
        var useJest = !!this.ctrls.useJest.getValue()
        if (useJest !== jestOptions) {
            jestOptions = useJest;
            $('#jest-options').toggle(useJest);
        }
        if (availInlineSnapshots === null) {
            availInlineSnapshots = this.ctrls.availInlineSnapshots.getValue();
            this.ctrls.useInlineSnapshot.show(availInlineSnapshots)
            this.ctrls.useInlineSnapshot.setValue(false)
        }
        if (availStorybook === null) {
            availStorybook = this.ctrls.availStorybook.getValue();
            $('#react-comp-storybook').toggle(availStorybook)
        }
        var isStorybook = this.ctrls.useStorybook.getValue();
        if (isStorybook !== useStorybook) {
            useStorybook = isStorybook;
            $('#storybook-options').toggle(isStorybook);
        }

        var multiFiles = this.ctrls.styles.getValue() || useJest || isStorybook;
        var ctrlCreateFolder = this.ctrls.createFolder;
        ctrlCreateFolder.enable(!multiFiles);
        if (multiFiles) ctrlCreateFolder.setValue(true);

        // Запрещать defaultValue, если isRequired
        this.ctrls.props.items.forEach(function(row){
            var ctrlReq = row.ctrls.isRequired, ctrlVal = row.ctrls.defaultValue;
            var req = ctrlReq.getValue();
            if (req) ctrlVal.setValue('');
            ctrlVal.enable(!req);
        })
    }
    this.onPostUpdate = function() {
        if (this.ok) {
            var res = this.save();
            wsSend('componentPreviewAsk', res);
        } else {
            drawComponentPreview(null);
        }
    }
}

Rn.V.ReactCompFolders = function() {
    this.superClass = 'Base';
    this.check = function(value) {
        if (value in foldersSet) return '';
        return this.msg || "Folder is not exist";
    }
}

Rn.V.PropNoDup = function() {
    this.superClass = 'Base';
    this.check = function(value) {
        if (!value) return;
        var curRow = this.ctrl.owner;
        var arr = curRow.owner;
        var dup = arr.items.find(function(row) {
            console.log('>', row)
            return row !== curRow && row.ctrls.propName.getValue() === value;
        })
        if (dup) return this.msg;
    }
}

Rn.V.PropDefaultValue = function() {
    this.superClass = 'Base';
    function badString(value) {
        if (value.length < 2) return true;
        if (value[0] !== '"' && value[0] !== "'") return true;
        if (value[0] !== value[value.length-1]) return true;
        try {
            JSON.parse('"'+value.slice(1,-1)+'"')
        } catch (e) {
            return true;
        }
        return false;
    }
    this.check = function(value) {
        if (!value) return;
        var curRow = this.ctrl.owner;
        var type = curRow.ctrls.type.getValue();
        switch (type) {
            case 'number':
                if (value !== 'NaN' && isNaN(value)) return 'Need number value';
                break;
            case 'boolean':
                if (value !== 'true' && value !== 'false') return "Need true or false";
                break;
            case "string":
                if (badString(value)) return "Need quoted string";
                break;
        }
    }
}


Rn.V.ComponentUnique = function() {
    this.superClass = 'Base';

    var lockCount = 0;
    var curInfo = { exists: false }
    // Предполагается, что такой валидатор существует в единственном экземпляре
    wsOff('componentExists');
    wsOn('componentExists', function(info) {
        console.log('componentExists', info)
        lockCount--;
        curInfo = info;
        Rn.update();
    });
    var prevValue = null;
    
    this.check = function(value) {
        var path = this.ctrl.owner.ctrls.folder.getValue() + '/' + value;
        if (path !== prevValue) {
            prevValue = path;
            lockCount++;
            wsSend('componentExistsAsk', path)
        }
        if (lockCount) {
            return "Please wait..."
        }
        if (curInfo.exists) {
            return 'A component with the same name already exists'
        }
    }
}
