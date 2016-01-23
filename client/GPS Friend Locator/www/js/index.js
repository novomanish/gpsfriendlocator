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
        //app.receivedEvent('deviceready');
        $("#alertPhone").on("click", function(){
            alert(Storage.get("phoneNumber"));
        });
        if(Storage.get("phoneNumber")){
            $("#phone").val(Storage.get("phoneNumber"));
        }
        $("#savePhone").on("click", function(){
            Storage.put("phoneNumber",$("#phone").val());
        });
        GPS.startPublishing();
        GPS.subscribe(app.displayGPSCoordinates, ["+918792892306", "+918792892374"]);
    },
    i:0,
    displayGPSCoordinates: function(coordinates){
        //var selfCoordinates = coordinates[0] || coordinates;
        var screen = document.getElementById("screen");
        screen.innerHTML = "count: "+app.i++;

        for(var i=1; i<coordinates.length; i++){
            var coord = coordinates[i];
            screen.innerHTML += "<br />Phone: "+coord.user.phoneNumber;
            screen.innerHTML += "<br />Lat: "+coord.latitude;
            screen.innerHTML += "<br />Long: "+coord.longitude;
            screen.innerHTML += "<br />";
        }
    }
};
