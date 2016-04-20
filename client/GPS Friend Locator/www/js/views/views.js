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
  
  },
  save: function(){
    var number = this.$el.find("input[name=phoneNumber]").val(),
    name = this.$el.find("input[name=userName]").val();

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

    this.model = new ModelUser({
      "id": number,
      "name": name
    });
    this.model.save();
    this.model.once("sync", function(){
      FlowManager.navigate("#entry");
    });

    return;

    var otp = OTP.generate();
    SMSManager.sendOTP(number, otp, function(){
      Storage.put("phoneNumber",number);
      alert("OTP received:"+otp+", Number stored:"+number);
    });
  },

  render: function() {
    var number = Storage.get("phoneNumber");

    if(number){
      this.$el.find("input[name=phoneNumber]").val(number);

      if(this.model){
        var name = this.model.get("name");
    
        if(name){
          this.$el.find("input[name=userName]").val(name);
        }
      }else{
        this.model = new ModelUser({
          "id": number
        });
        this.model.on("sync", this.render, this);
      }
    }
  }

});


var MapView = BaseView.extend({
  el: "#map",

  initialize: function(options) {
    var that = this;
    this.options = options;
    //this.map = plugin.google.maps.Map.getMap();

    options.selfUser.on("sync", $.proxy(this.render, this));

  },

  render: function() {
    this.constructor.__super__.render.apply(this, arguments);
    
    if(!this.colleagueSearchView){
      this.colleagueSearchView = new ColleagueSearchView();
    }

    //this.map.setDiv(this.$el.find("#map_canvas")[0]);
    //this.map.setMyLocationEnabled(true);
    
  }

});

var ColleagueSearchView = BaseView.extend({
  el: "#colleagueSearch",

  initialize: function(options) {
    this.$input = this.$el.find("#inset-autocomplete-input");
    this.$ul = this.$el.find("#myFilterable");

/*    var defaultFilterCallback = function( index, searchValue ) {
      return ( ( "" + ( $.mobile.getAttribute( this, "filtertext" ) || $( this ).text() ) )
        .toLowerCase().indexOf( searchValue ) === -1 );
    };

    $( "#myFilterable" ).filterable( "option", "filterCallback", function( index, searchValue ) {
      if(this.getAttribute("data-filtertext") == "*") return false;
      return defaultFilterCallback.call(this, index, searchValue);
    });
*/
    this.$el.find( "#myFilterable" ).on( "filterablebeforefilter", $.proxy(this.onNumberInput, this));

    this.model = new ModelColleagues();
    this.model.on("sync", $.proxy(this.sync, this));

  },

  onNumberInput: function( e, data ){
    var value;

    value = data.input.val();
    this.$ul.find("#inviteLi").attr("data-filtertext", value);
    this.$ul.find("#inviteLi a").html("Invite "+value);
  },

  sync: function(){
    var colleagues = {},
      that = this;
    var list = Object.keys(this.model.toJSON());
    list = list.splice(1, list.length-1);
    var relator = new Relator(list, ModelUser, $.proxy(this.render, this));
  },

  render: function(colleagues) {
    var that = this;
    this.constructor.__super__.render.apply(this, arguments);

    var templateHTML = this.$el.find("#coleagueListTemplate").html();
    var template = Handlebars.compile(templateHTML);
    var html = template({
      colleagues: colleagues,
      search: this.$input.val()
    });
  
    this.$ul.html(html);

    this.$ul.listview( "refresh");
    this.$ul.trigger( "updatelayout");
  }

});




