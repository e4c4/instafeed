/*

    Instagram real-time updates demo app.

*/


var url = require('url'),
  redis = require('redis'),
  settings = require('./settings'),
  helpers = require('./helpers'),
  subscriptions = require('./subscriptions');

var app = settings.app;


app.get('/callbacks/geo/:geoName', function(request, response){
    // The GET callback for each subscription verification.
  helpers.debug("GET " + request.url); 
  var params = url.parse(request.url, true).query;
  response.send(params['hub.challenge'] || 'No hub.challenge present');
});

app.get('/callbacks/tag/:tagName', function(request, response){
    // The GET callback for each subscription verification.
  helpers.debug("GET " + request.url); 
  var params = url.parse(request.url, true).query;
  response.send(params['hub.challenge'] || 'No hub.challenge present');
});

app.post('/callbacks/geo/:geoName', function(request, response){
  helpers.debug("PUT /callbacks/geo/" + request.params.geoName);
   // The POST callback for Instagram to call every time there's an update
   // to one of our subscriptions.
    
   // doesn't like subscription.js line 12:
   // hmac.update(request.rawBody);
   // First, let's verify the payload's integrity
   //if(!helpers.isValidRequest(request)) {
   //  response.send('FAIL');
   //  return;
   //}
    
    // Go through and process each update. Note that every update doesn't
    // include the updated data - we use the data in the update to query
    // the Instagram API to get the data we want.
  var updates = request.body;
  var geoName = request.params.geoName;
  for(index in updates){
    var update = updates[index];
    if(update['object'] == "geography")
      helpers.processGeography(geoName, update);
  }
  helpers.debug("Processed " + updates.length + " updates");
  response.send('OK');
});

// callback for tag instead of geo
app.post('/callbacks/tag/:tagName', function(request, response){
	helpers.debug("PUT /callbacks/tag/" + request.params.tagName);
   // The POST callback for Instagram to call every time there's an update
   // to one of our subscriptions.
    
   // doesn't like subscription.js line 12:
   // hmac.update(request.rawBody);
   // First, let's verify the payload's integrity
   //if(!helpers.isValidRequest(request)) {
   //  response.send('FAIL');
   //  return;
   //}
    
    // Go through and process each update. Note that every update doesn't
    // include the updated data - we use the data in the update to query
    // the Instagram API to get the data we want.
  var updates = request.body;
  var tagName = request.params.tagName;
  for(index in updates){
    var update = updates[index];
    if(update['object'] == "tag")
      helpers.processTag(tagName, update);
  }
  helpers.debug("Processed " + updates.length + " updates");
  response.send('OK');
});

// Render the home page
app.get('/', function(request, response){
  helpers.getMedia(function(error, media){
  response.render('geo.jade', {
        locals: { images: media }
    });
  });
});

app.listen(settings.appPort);
