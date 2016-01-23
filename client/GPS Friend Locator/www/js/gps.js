/* 
 * Public API version: 0.1
 * 
 * GPS.subscribe (phoneNumbers, callback<coordinates>);
 *      phoneNumber: 1. phoneNumber of user (with country code ex: +91..)
 *                   2. "SELF" if user is self
 *      coordinates  -> {user:{displayName, phoneNumber}, latitude, longitude}
 * 
 * GPS.unsubscribe (phoneNumbers);
 *
 * GPS.startPublishing (auth): starts publishing self's geolocation
 *      auth  -> {token, path}
 *      puts: {latitude, longitude} on given path
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
     * @Public: GPS.subscribe (phoneNumber, callback(coordinates));
     */
    subscribe: function(phoneNumber, callback){
        GPSCloud.testGetGeolocation(phoneNumber, function(coordinates){
            callback(coordinates);
        });
    },
    /* 
     * @Public: GPS.unsubscribe (phoneNumber): Stops further updates for a particular number
     */
    unsubscribe: function(phoneNumber){
        // TODO Implement this
    },

    _geolocationSuccess: function(position){
        GPS._coords = position.coords;
        Events.trigger("GEO:change", GPS._getLastCoordinates());
        GPSCloud.testStoreSelfGeolocation(GPS._coords.latitude, GPS._coords.longitude);
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
        this.startPublishing();
    },

};
