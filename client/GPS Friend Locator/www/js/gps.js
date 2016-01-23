/* 
 * Public API version: 0.1
 * 
 * GPS.subscribe (callback<coordinates>, phoneNumbers<List>);
 * coordinates  -> 0: self coordinates
 *              -> 1+: queried user's coordinates
 *              ->>coordinate : {user:{displayName, phoneNumber}, latitude, longitude}
 * 
 * GPS.startPublishing (auth): starts publishing self's geolocation
 * auth  -> {token, path}
 * puts: {latitude, longitude} on given path
 *
 * GPS.stopPublishing (auth): stops publishing self geolocation
 */

var GPS = {
    /* 
     * @Public
     */
    startPublishing: function(auth){
        this._startWatch();
    },
    
    /* 
     * @Public
     */
    stopPublishing: function(auth){
        this._stopWatch();
    },

    /* 
     * @Public: GPS.subscribe (callback(coordinates), phoneNumbers<List>);
     */
    subscribe: function(callback, phoneNumbers){
        var map = {};
        var _phoneNumbers = phoneNumbers.slice();
        
        var c = function(){
            var coordinates = [];
            coordinates[0] = {};
            
            for(var i=0; i<phoneNumbers.length; i++){
                var phoneNumber = phoneNumbers[i];
                coordinates[i+1] = map[phoneNumber];
            }
            callback(coordinates);

        };

        var f = function(coordinates){
            map[coordinates.user.phoneNumber] = coordinates;
            _phoneNumbers.splice(_phoneNumbers.indexOf(coordinates.user.phoneNumber));
            if(_phoneNumbers.length === 0){
                c();
            }
        };
        for(var i=0; i<phoneNumbers.length; i++){
            var phoneNumber = phoneNumbers[i];
            map[phoneNumber] = {};
            Cloud.testGetGeolocation(phoneNumber, f);
        }
    },

    _geolocationSuccess: function(position){
        GPS._coords = position.coords;
        Events.trigger("GEO:change", GPS._getLastCoordinates());
        Cloud.testStoreSelfGeolocation(GPS._coords.latitude, GPS._coords.longitude);
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
    _stopWatch: function(){
        // TODO: implement this
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
    _query: function(callback, users){
        Events.one("GEO:change", this._clipEvent(callback));
        this._doQuery();
    },
    testSubscribe: function(callback, users){
        Events.on("GEO:change", this._clipEvent(callback));
        this._startWatch();
    },

};
