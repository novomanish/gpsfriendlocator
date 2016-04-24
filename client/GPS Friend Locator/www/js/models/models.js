// The url for this User will be https://<your-firebase>.firebaseio.com/users/:id
// SelfUser = new ModelUser({id:<phoneNumber>});
var ModelUser = Backbone.Firebase.Model.extend({
    "urlRoot": 'https://gps-friend-locator.firebaseio.com/users'
});

var ModelColleagues = Backbone.Firebase.Model.extend({
    "url": function(){
        return 'https://gps-friend-locator.firebaseio.com/colleagues/' + app.UID;
    }
});

var ModelIncomingRequest = Backbone.Firebase.Model.extend({
    "url": function(){
        return 'https://gps-friend-locator.firebaseio.com/colleagues-request/' + app.UID;
    }
});

var ModelOutgoingRequest = Backbone.Firebase.Model.extend({
    "urlRoot": 'https://gps-friend-locator.firebaseio.com/colleagues-request/'
});

var ModelTrackerColleagues = Backbone.Firebase.Model.extend({
    "urlRoot": 'https://gps-friend-locator.firebaseio.com/colleagues/'
});

