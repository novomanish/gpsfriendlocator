var Storage = {
    get: function(key){
        return localStorage[key];
    },
    put: function(key, value){
        localStorage[key] = value;
    }
};