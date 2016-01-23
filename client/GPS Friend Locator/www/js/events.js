var Events = {
    on: function(eventURI, callback){
        return $(document).on(eventURI, callback);
    },
    one: function(eventURI, callback){
        return $(document).one(eventURI, callback);
    },
    unbind: function(eventURI, callback){
        return $(document).unbind(eventURI, callback);
    },
    trigger: function(eventURI, args){
        return $(document).trigger(eventURI, args);
    }
};