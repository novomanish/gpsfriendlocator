var SMSManager = {
    sendOTP: function(number, otp, callback) {
        var message = "GPSFriendLocator:OTP:"+otp;

/*        //CONFIGURATION
        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                //intent: 'INTENT'  // send SMS with the native android SMS messaging
                intent: '' // send SMS without open any other app
            }
        };
*/
        var success = function () { alert('Message sent successfully'); };
        var error = function (e) { alert('Message Failed:' + e); };
        SMS.sendSMS(number, message, success, error);
        
        var parser = function(data){
            if(data.body == message && data.address.indexOf(number) >-1){
                callback();
                SMSManager.stopWatch();
            }
        };
        SMSManager.startWatch(parser);
    },
    _watching: false,
    
    stopWatch: function(f){
        SMS.stopWatch();
    },
    //e: address, body, date_sent, date, read, seen, status, type, service_center
    startWatch: function(parser){
        document.addEventListener('onSMSArrive', function(e){
            var data = e.data;
            //alert("Message received:"+JSON.stringify(data));
            if(parser){
                parser(data);
            }
        });

        if(!SMSManager._watching){
            SMS.startWatch(function(){
               // alert('watching started');
            }, function(){
                alert('failed to start watching');
            });

            SMSManager._watching = true;
        }

    }



};