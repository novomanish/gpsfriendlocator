var FlowManager = {
    _registry:{},
    register: function(path, func){
        FlowManager._registry[path] = func;
        $(path).on("pageshow", func);
    },
    navigate: function(path, args){
        $.mobile.navigate(path, args);
    }
};
