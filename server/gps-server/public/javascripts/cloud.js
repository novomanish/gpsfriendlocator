var FIREBASE = require("firebase");

var CLOUD = {
    _ref:null,
    _getRef: function(){
        if(!CLOUD._ref){
            CLOUD._ref = new Firebase("https://gps-friend-locator.firebaseio.com/");
        }
        return CLOUD._ref;
    },
    storeOTP:function(number, key, successCallback){
        var user = this._getRef().child("OTP").child(number);
        user.set(key, successCallback);
    }
};

module.exports = CLOUD;