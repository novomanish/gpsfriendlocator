/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        /*
        if (! SMS ) {
            alert( 'SMS plugin not ready' ); return;
        }else{
           // alert( 'SMS plugin is ready' );
        }

        //app.receivedEvent('deviceready');
        $("#alertPhone").on("click", function(){
            alert(Storage.get("phoneNumber"));
            
        });
        if(Storage.get("phoneNumber")){
            $("#phone").val(Storage.get("phoneNumber"));
        }
        $("#savePhone").on("click", function(){
            var otp = OTP.generate(),
                number = $("#phone").val();
        //    alert("Sending OTP:"+otp+", number:"+number);
            Storage.put("phoneNumber",number);
            // SMSManager.sendOTP(number, otp, function(){
            //     Storage.put("phoneNumber",number);
            //     alert("OTP received:"+otp+", Number stored:"+number);
            // });
        });*/
        window.map = plugin.google.maps.Map.getMap($("#map_canvas")[0]);

        map.on(plugin.google.maps.event.MAP_READY, function(){
            alert("ready");
        });
        /*GPS.startPublishing();
        
        GPS.subscribe("SELF", app.displaySelfGPSCoordinates);
        GPS.subscribe("+918792892374", app.displayMoverGPSCoordinates);*/
    },
    i:0,
    displaySelfGPSCoordinates: function(coordinates){
        var div = document.getElementById("self");
        app._displayGPSCoordinates(div, coordinates);
    },
    displayMoverGPSCoordinates: function(coordinates){
        var div = document.getElementById("mover");
        app._displayGPSCoordinates(div, coordinates);
    },
    _displayGPSCoordinates: function(div, coordinates){
        var screen = div;
        screen.innerHTML = "count: "+app.i++;

        screen.innerHTML += "<br />Phone: "+ ((coordinates.user.isSelf)?"SELF":coordinates.user.phoneNumber);
        screen.innerHTML += "<br />Lat: "+coordinates.latitude;
        screen.innerHTML += "<br />Long: "+coordinates.longitude;
        screen.innerHTML += "<br />";
    }
};
window.onerror = function(message, file, line) {
  var error = [];
  error.push('---[error]');
  if (typeof message == "object") {
    var keys = Object.keys(message);
    keys.forEach(function(key) {
      error.push('[' + key + '] ' + message[key]);
    });
  } else {
    error.push(line + ' at ' + file);
    error.push(message);
  }
  alert(error.join("\n"));
};
