const http = require('http'),
    twilio = require('twilio'),
    express = require('express'),
    urlencoded = require('body-parser').urlencoded;

import secrets from './setup.js';

const app = express();
app.use(urlencoded({ extended: false}));

// Get account credentials
const accountSid = secrets.secrets.TWACCOUNTSID;
const authToken = secrets.secrets.TWAUTHTOKEN;

// Create twilio client with credentials
const client = require('twilio')(accountSid, authToken);

// Route to answer phone
app.post('/answer', function(request, response) {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();

  twiml.say('Hello, you have reached the network activation center.', { voice: 'alice' });

  twiml.redirect('/getId');


  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());

});

app.post('/getId', (request, response) => {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();

  twiml.gather({ timeout: 10, action: '/validateId'}, (gatherNode) => {
    gatherNode.say('Please enter your phone number and press pound.', { voice: 'alice'});
  });

  twiml.redirect('/getId');

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
})

app.post('/validateId', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  if (request.body.Digits) {
    let phoneNumber = request.body.Digits;
    twiml.say('You entered ' + phoneNumber + '.', { voice: 'alice'});

    let userId = phoneNumber;

    let uri = '/showMainOptions/?id=' + userId;

    twiml.redirect(uri);
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
})

app.post('/showMainOptions', (request, response) => {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();

  let userId = request.query.id;

  twiml.say('Your id is ' + userId + '.');

  twiml.say('Here are your options.', { voice: 'alice' });

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
})


app.post('/deployMessages', (request, response) => {
  let twiml = new twilio.TwimlResponse();
  sendText();
  twiml.say('Your messages have been sent.');

  response.type('text/xml');
  response.send(twiml.toString());
});


//Helpers
var sendText = function() {
  // var client = require('twilio')(accountSid, authToken); 
  client.messages.create({ 
      to: "+15104499800", 
      from: "+16506655133", 
      body: "Natalia's in trouble. Pick up her kids!", 
  }, function(err, message) { 
      console.log(message.sid); 
  });
};

// Create an HTTP server and listen for requests on port 1337
app.listen(1337);

console.log('TwiML servin\' server running at http://127.0.0.1:1337/');

