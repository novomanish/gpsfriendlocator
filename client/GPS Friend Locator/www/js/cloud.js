var Cloud = {
    _getRootRef: function(){
        if(!Cloud._rootRef){
            Cloud._rootRef = new Firebase("https://gps-friend-locator.firebaseio.com/");
        }
        return Cloud._rootRef;
    },
    _storeGeoLocation: function(phoneNumber, latitude, longitude){
        var user = this._getRootRef().child("users").child(phoneNumber);
        user.set({
            "latitude": latitude,
            "longitude": longitude
        });
    },
    _getGeoLocation: function(phoneNumber, callback){
        var user = this._getRootRef().child("users").child(phoneNumber);
        user.on("value", function(snapshot){
            var val = snapshot.val();
            callback({
                "user": {"phoneNumber":phoneNumber},
                "latitude": val.latitude,
                "longitude": val.longitude
            });
        });
    },
    testStoreSelfGeolocation: function(latitude, longitude){
        var phoneNumber = Storage.get("phoneNumber");
        if(!phoneNumber) return;
        this._storeGeoLocation(phoneNumber, latitude, longitude);
    },
    testGetGeolocation: function(phoneNumber, callback){
        this._getGeoLocation(phoneNumber, callback);
    }
};