var http = require('http'),
    twilio = require('twilio'),
    express = require('express'),
    urlencoded = require('body-parser').urlencoded;

var app = express();

app.use(urlencoded({ extended: false}));

app.post('/answer', function(request, response) {
  // Use the Twilio Node.js SDK to build an XML response
  var twiml = new twilio.TwimlResponse();
  var text = '';
  var fromNumber = request.body.From;
  twiml.say('Hello, you have reached the network activation center.', { voice: 'alice' });
  
  // getPhoneNumber();
  // var phoneNumber = request.body. 

  // Send sms text
  // sendText();

});

// Create an HTTP server and listen for requests on port 1337
app.listen(1337);


console.log('TwiML servin\' server running at http://127.0.0.1:1337/');
