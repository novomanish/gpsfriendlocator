// The url for this User will be https://<your-firebase>.firebaseio.com/users/:id
// SelfUser = new ModelUser({id:<phoneNumber>});
var ModelUser = Backbone.Firebase.Model.extend({
    "urlRoot": 'https://gps-friend-locator.firebaseio.com/users'
});

var ModelColleagues = Backbone.Firebase.Model.extend({
    "url": function(){
        return 'https://gps-friend-locator.firebaseio.com/colleagues/' + app.UID;
    }
});


var Relator = function(list, modelClass, successCallback){
    this._list = list;
    this._modelClass = modelClass;
    this._resolved = {};
    this._successCallback = successCallback;

    this._list.forEach($.proxy(this._resolve, this));
};
Relator.prototype = {
    _resolve: function(id){
        var that = this;
        var model = new this._modelClass({"id": id});
        model.on("sync", function(){
            that._resolved[id] = model.toJSON();
            that._resolved[id].resolved = true;
            that._checkFinish();
        });
        model.fetch();
    },
    _checkFinish: function(){
        var resolveUnfinished = false;
        for(var i=0; i<this._list.length; i++){
            if(!this._resolved[this._list[i]].resolved){
                resolveUnfinished = true;
                break;
            }
        }
        if(!resolveUnfinished){
            this._successCallback(this._resolved);
        }
    }
};