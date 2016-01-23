var GPSCloud = {
    _getRootRef: function(){
        if(!GPSCloud._rootRef){
            GPSCloud._rootRef = new Firebase("https://gps-friend-locator.firebaseio.com/");
        }
        return GPSCloud._rootRef;
    },
    _storeGeoLocation: function(latitude, longitude){
        var phoneNumber = Storage.get("phoneNumber");

        //TODO Handle this
        if(!phoneNumber) return;

        var user = this._getRootRef().child("users").child(phoneNumber);
        user.set({
            "latitude": latitude,
            "longitude": longitude
        });
    },
    _getGeoLocation: function(phoneNumber, callback){
        var isSelf = false;
        if(phoneNumber === "SELF" || phoneNumber === Storage.get("phoneNumber")){
            isSelf = true;
            phoneNumber = Storage.get("phoneNumber");
        }
        
        //TODO Handle this
        if(!phoneNumber) return;

        var user = this._getRootRef().child("users").child(phoneNumber);
        
        user.on("value", function(userSnapshot){
            var userObject = userSnapshot.val();
            callback({
                "user": {
                    "isSelf": isSelf,
                    "phoneNumber":phoneNumber
                },
                "latitude": userObject.latitude,
                "longitude": userObject.longitude
            });
        });
    },
    testStoreSelfGeolocation: function(latitude, longitude){
        this._storeGeoLocation(latitude, longitude);
    },
    testGetGeolocation: function(phoneNumber, callback){
        this._getGeoLocation(phoneNumber, callback);
    }
};