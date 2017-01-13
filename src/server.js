const http = require('http'),
    twilio = require('twilio'),
    express = require('express'),
    urlencoded = require('body-parser').urlencoded;

import secrets from './setup.js';

const app = express();

app.use(urlencoded({ extended: false}));

app.post('/answer', function(request, response) {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();
  let text = '';
  let fromNumber = request.body.From;
  twiml.say('Hello, you have reached the network activation center.', { voice: 'alice' });
  
  // getPhoneNumber();
  // var phoneNumber = request.body. 

  // Send sms text
  // sendText();
  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());

});

// Create an HTTP server and listen for requests on port 1337
app.listen(1337);

console.log('TwiML servin\' server running at http://127.0.0.1:1337/');
console.log(secrets);
