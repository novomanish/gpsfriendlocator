var GPS = {
    _geolocationSuccess: function(position){
        GPS._coords = position.coords;
        Events.trigger("GEO:change", GPS._getLastCoordinates());
    },
    _geolocationError: function(){
        alert("Error occurred while getting gps location");
    },
    _geolocationOptions: function(){},
    _startWatch: function(){
        if(!this._watchId){
            this._watchId = navigator.geolocation.watchPosition(
                $.proxy(this._geolocationSuccess, this),
                $.proxy(this._geolocationError, this),
                $.proxy(this._geolocationOptions, this)
            );
        }
    },
    _doQuery: function(){
        navigator.geolocation.getCurrentPosition(
            $.proxy(this._geolocationSuccess, this),
            $.proxy(this._geolocationError, this),
            $.proxy(this._geolocationOptions, this)
        );
    },
    _coords: null,
    _getLastCoordinates: function(){
        return {
            "latitude": GPS._coords.latitude,
            "longitude": GPS._coords.longitude
        };
    },
    _clipEvent: function(callback){
        return function(evt, args){
            callback(args);
        };
    },
    query: function(callback){
        Events.one("GEO:change", this._clipEvent(callback));
        this._doQuery();
    },
    subscribe: function(callback){
        this._startWatch();
        Events.on("GEO:change", this._clipEvent(callback));
    }
};
