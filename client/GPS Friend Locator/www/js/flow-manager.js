var FlowManager = {
    _registry:{},
    register: function(path, func){
        FlowManager._registry[path] = func;
    },
    navigate: function(path, args){
        FlowManager._registry[path].apply(this, args);
    }
};
