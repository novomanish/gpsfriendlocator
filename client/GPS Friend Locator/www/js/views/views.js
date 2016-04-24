var BaseView = Backbone.View.extend({
  render: function(){
    this.doScaling();
  },

  doScaling: function(){
    scroll(0, 0);
    var content = $.mobile.getScreenHeight() - this.$el.find(".ui-header").outerHeight() - this.$el.find(".ui-footer").outerHeight() - this.$el.find(".ui-content").outerHeight() + this.$el.find(".ui-content").height();
    this.$el.find(".ui-content").height(content);
  }
});

var EntryView = BaseView.extend({
  el: "#entry",

  initialize: function() {
    var that = this;
    this.$el.find("#savePhone").on("click", $.proxy(this.save, this));

    FlowManager.register("#entry", $.proxy(this.beforeRender, this));
  
  },
  
  beforeRender: function(){
    var number = Storage.get("phoneNumber");

    if(!number){
      if(!SMS) {
        alert( 'SMS plugin not ready' );
        return;
      }else{
        // alert( 'SMS plugin is ready' );
      }
      this.render();
    }else{
      utils.showLoading("Loggin In");

      if(!this.model){
        this.initModel(number);

        this.model.once("sync", function(){
          FlowManager.navigate("#map");
          GPS.startPublishing();
        });
        this.model.fetch();
      }else{
        FlowManager.navigate("#map");
      }
    }
  },
  initModel: function(number){
    if(!app.models.selfUser){
      var that = this;
      this.model = app.models.selfUser = new ModelUser({
        "id": number
      });
      this.model.once("sync", function(){
        app.UID = app.models.selfUser.id;
        $(document).trigger("models:selfUser:ready");
      });

      this.model.on("sync", function(){
        that.render();
      });
    }
  },

  save: function(){
    var number = this.$el.find("input[name=phoneNumber]").val(),
      name = this.$el.find("input[name=userName]").val(),
      that = this;

    if(!number){
      alert("Please enter valid phone number");
      return;
    }

    if(!name){
      alert("Please enter your name");
      return;
    }

    // alert("Sending OTP:"+otp+", number:"+number);
    Storage.put("phoneNumber",number);

    this.initModel(number);
    this.model.set("name", name);
    this.model.once("sync", $.proxy(this.beforeRender, this));

    utils.showLoading("Validating Number..");


    return;

    var otp = OTP.generate();
    SMSManager.sendOTP(number, otp, function(){
      Storage.put("phoneNumber",number);
      alert("OTP received:"+otp+", Number stored:"+number);
    });
  },

  render: function() {
    if(this.model){
      var name = this.model.get("name");
      var number = this.model.get("id");
  
      if(name){
        this.$el.find("input[name=userName]").val(name);
      }
      if(number){
        this.$el.find("input[name=phoneNumber]").val(number);
      }
    }
  }

});


var MapView = BaseView.extend({
  el: "#map",

  initialize: function(options) {
    var that = this;
    this.options = options;

    this.map = plugin.google.maps.Map.getMap();
    this.$el.on("pageshow", $.proxy(this.render, this));
    this.$el.find("._mapSearchInput").on("click", function(){
      FlowManager.navigate("#colleagues", {"transition": "slide"});
    });
  },
  trackUser: function(userId){
    if(this._currentTrackingUser){
      this._currentTrackingUser.off("sync", $.proxy(this._markCurrentUserOnMap, this));
    }
    this._currentTrackingUser = new ModelUser({id: userId});
    this._currentTrackingUser.fetch();
    this._currentTrackingUser.on("sync", $.proxy(this._markCurrentUserOnMap, this));
  },
  
  _markCurrentUserOnMap: function(){
    this.setMarker({
      "name": this._currentTrackingUser.get("name"),
      "number": this._currentTrackingUser.get("id"),
      "latitude": this._currentTrackingUser.get("latitude"),
      "longitude": this._currentTrackingUser.get("longitude")
    });
  },
  
  setMarker: function(markerObj){
    var that = this;
    console.log("Got Marker");
    console.log(markerObj);
    
    var COLLEAGUE_LATLONG = new plugin.google.maps.LatLng(markerObj.latitude, markerObj.longitude);
    var SELF_LATLONG = new plugin.google.maps.LatLng(app.models.selfUser.get("latitude"), app.models.selfUser.get("longitude"));
    
    this.map.addMarker({
        'position': COLLEAGUE_LATLONG,
        'title': markerObj.name
      },function(marker) {
        if(that.marker){
          that.marker.remove();
        }
        that.marker = marker;
        marker.showInfoWindow();
        
    });

    that.map.addPolyline({
        points: [
          SELF_LATLONG,
          COLLEAGUE_LATLONG
        ],
        'color' : '#AA00FF',
        'width': 10,
        'geodesic': true
      }, function(polyline) {
        if(that.polyline){
          that.polyline.remove();
        }
        that.polyline = polyline;
        
      });

    that.map.animateCamera({
      'target': COLLEAGUE_LATLONG,
      'tilt': 0,
      'zoom': 10,
      'bearing': 0
    });

  },

  render: function() {
    this.constructor.__super__.render.apply(this, arguments);
    
    if(!app.views.ColleaguesView){
      app.views.colleaguesView = new ColleaguesView();
    }

    if(!app.views.trackRequestReceptionView){
      app.views.trackRequestReceptionView = new TrackRequestReceptionView();
    }
    this.map.setDiv(this.$el.find("#map_canvas")[0]);
    this.map.setMyLocationEnabled(true);
    
  }

});

var ColleaguesView = Backbone.View.extend({
  el: "#colleagues",

  initialize: function(options) {
    FlowManager.register("#colleagues", $.proxy(this.preRender, this));
    this.model = app.models.modelColleagues = new ModelColleagues();
    this.model.on("sync", $.proxy(this.sync, this));

    this.$input = this.$el.find("#inset-autocomplete-input");
    this.$ul = this.$el.find("._colleaguesList");
    this._relator = new Relator();

    this.$ul.on("click", "li", $.proxy(this.handleClick, this));
    this.$ul.on( "filterablebeforefilter", $.proxy(this.handleInput, this));

    this.$template = this.$el.find("#coleagueListTemplate");
    this.$invite = this.$ul.find("#inviteLi");

    this.model.fetch();
  },
  preRender: function(){
    this._isInitialized = true;
    this.render();
  },

  handleInput: function( e, data ){
    var value = data.input.val();

    if(!value){
        this.$ul.find("#inviteLi").hide();
    }else{
      this.$ul.find("#inviteLi").show();
      this.$ul.find("#inviteLi").attr("data-filtertext", value);
      this.$ul.find("#inviteLi").find("a").html("Invite "+value);
    }
  },

  sync: function(){
    var colleagues = {},
      that = this;
    var list = utils.getModelKeys(this.model);

    this._relator.relate(list, ModelUser, $.proxy(this.setColleagues, this));

    var newKeys = [],
       key;
    var previousAttributes = this.model.previousAttributes();
    var keysChanged = Object.keys(this.model.changedAttributes());
    for(var i=0; i<keysChanged.length; i++){
      key = keysChanged[i];
      if(!previousAttributes[key]){
        this.handleInvitationAccept(key);
        break;
      }
    }

  },
  handleInvitationAccept: function(userId){
      app.views.mapView.trackUser(userId);
  },

  handleClick: function(evt, el){
    var userId = $(evt.currentTarget).attr("data-userid");
    if(!userId){
      // Invitation Request
      var number = this.$input.val();
      // TODO Number Check

      var outgoingModel = new ModelOutgoingRequest({id: number});
      outgoingModel.set(app.UID, true);

      this.$input.val("");
      this.$ul.listview( "refresh");

    }else{

      this.$input.val("");
      this.$ul.listview( "refresh");
      app.views.mapView.trackUser(userId);
    }
    
  },
  _colleagues:[],
  setColleagues: function(colleagues){
    this._colleagues = colleagues;
    this.render();
  },
  _contacts:[],
  setContacts: function(contacts){
    this._contacts = contacts;
    this.render();
  },
  render: function() {
    if(this._isInitialized){
      var that = this;

      var template = Handlebars.compile(this.$template.html());
      var html = template({
        colleagues: this._colleagues,
        contacts: this._contacts,
        search: this.$input.val()
      });
    
      this.$ul.html(html);

      this.$ul.listview( "refresh");
      this.$ul.trigger( "updatelayout");

      if(!this.$input.val()) {
        this.$ul.find("#inviteLi").hide();
      }
      this.$input.focus();
    }

  }

});

var TrackRequestReceptionView = Backbone.View.extend({
  el: "#trackRequestReceiveDialog",
  initialize: function() {
    this.model = app.models.modelIncomingRequest = new ModelIncomingRequest();
    this.model.on("sync", $.proxy(this.processSync, this));

    this.$el.find("._invAccept").on("click", $.proxy(this.acceptRequest, this));
    this.$el.bind({"popupafterclose": $.proxy(this.handlePopupClose, this)});
  },
  processSync: function(){
    var list = utils.getModelKeys(this.model);
    list.forEach($.proxy(this.processEntry, this));

    // var newKeys = [],
    //   key;
    // var previousAttributes = model.previousAttributes();
    // var keysChanged = Object.keys(model.changedAttributes());
    // for(var i=0; i<keysChanged.length; i++){
    //   key = keysChanged[i];
    //   if(!previousAttributes[key]){
    //    newKeys.push(key);
    //   }
    // }
  },
  processEntry: function(entryKey){
    var that = this;
    this.model.unset(entryKey);
    var user = new ModelUser({id: entryKey});
    this._trackReqQue.push(user);
    this.processQue();

  },
  _trackReqQue: [],
  processQue: function(){
    if(!this._processing && this._trackReqQue.length > 0){
      this._processing = true;
      this.currentUser = this._trackReqQue.splice(0,1)[0];

      this.listenTo(this.currentUser, "sync", $.proxy(this.render, this));

      this.showDialog();
    }
  },
  processComplete: function(){
    this._processing = false;
    this.stopListening(this.currentUser, "sync");
    this.currentUser = null;
  },
  showDialog: function(){
    app.views.mapView.map.setClickable(false);
    this.$el.popup("open");
    this.render();
  },
  render:function(){
    var that = this;
    var template = Handlebars.compile(this.$el.find("#trackRequestReceiveDialogContent").html());
    var html = template({
      "name": this.currentUser.get("name"),
      "number": this.currentUser.get("id")
    });
    this.$el.find("._content").html(html);
    this.$el.popup("reposition", {positionTo: 'origin'});
  },
  handlePopupClose: function(){
    this.processComplete();
    app.views.mapView.map.setClickable(true);
    setTimeout($.proxy(this.processQue, this), 200);
  },
  acceptRequest: function(){
    var modelTrackerColleagues = new ModelTrackerColleagues({id: this.currentUser.get("id")});
    modelTrackerColleagues.set(app.UID, true);
  }
});


