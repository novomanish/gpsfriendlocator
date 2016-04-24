var utils = {
    showLoading: function(msg){
        $.mobile.loading( "show", {
          text: msg,
          textVisible: true,
          theme: "b",
          textonly: false
        });

    },
    hideLoading: function(){
        $.mobile.loading( "hide");
    }
};

utils.getModelKeys = function(model){
    var obj = model.toJSON();
    delete(obj.id);
    return Object.keys(obj);
};

var Relator = function(){
        this._list = {};
        this._modelClass = {};
        this._listModel = {};
        this._resolved = {};
        this._successCallback = null;
};
Relator.prototype = {
    relate: function(list, modelClass, successCallback){
        if(list.length === 0){
            successCallback([]);
            return;
        }
        this._list = list;
        this._modelClass = modelClass;
        this._listModel = {};
        this._resolved = {};
        this._successCallback = successCallback;

        this._list.forEach($.proxy(this._resolve, this));
    },
    _resolve: function(id){
        var that = this;
        this._resolved[id] = new this._modelClass({"id": id});
        var f = function(){
            that._resolved[id].resolved = true;
            that._checkFinish(id);
        };
        that._resolved[id].on("sync", f);
        this._resolved[id].fetch();
    },
    _checkFinish: function(id){
        if(!this._resolved[id]) return;

        var resolveUnfinished = false;
        for(var i=0; i<this._list.length; i++){
            if(!this._resolved[this._list[i]].resolved){
                resolveUnfinished = true;
                break;
            }
        }
        if(!resolveUnfinished){
            var resolved = {};
            for(i=0; i<this._list.length; i++){
                resolved[this._list[i]] = this._resolved[this._list[i]].toJSON();
            }
            this._successCallback(resolved);
        }
    }
};