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

    let uri = '/sayMainOptions/?id=' + userId;

    twiml.redirect(uri);
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
})

app.post('/sayMainOptions', (request, response) => {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();

  if (request.query.id) {
    let userId = request.query.id;

    twiml.say('Your id is ' + userId + '.');
  }

  twiml.say('Here are your options.', { voice: 'alice' });

  twiml.gather({ timeout: 5, action: '/handleMainOption'}, (gatherNode) => {
    gatherNode.say('Press 1 to hear your rights. Press 2 to record a message. Press 3 to send out your messages.', { voice: 'alice'});
  });

  twiml.redirect('/sayMainOptions');

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
})

app.post('/handleMainOption', (request, response) => {
  let twiml = new twilio.TwimlResponse();
  let selection = request.body.Digits;

  let selectionMap = {
    '1': '/sayRights',
    '2': '/recordMessage',
    '3': '/deployMessages'
  }

  twiml.say('You selected ' + selection, {voice: 'alice'});

  let uri = selectionMap[selection];

  twiml.redirect(uri);

  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/sayRights', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  twiml.say('Here are your rights. To Do.', {voice: 'alice'});

  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/recordMessage', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  twiml.say('Record your message after the beep.', {voice: 'alice'});

  twiml.record({transcribe: true, maxLength: 30, recordingStatusCallback: '/recordingCallback'})
  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/recordingCallback', (request, response) => {
  let twiml = new twilio.TwimlResponse();
  console.log(request.body.RecordingUrl);

  let recordingUrl = request.body.RecordingUrl;

  sendText('+15104499800', recordingUrl);

  // twiml.redirect('/sayMainOptions');

  // twiml.say('Record your message after the beep. To Do.', {voice: 'alice'});

  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/handleRecording', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  console.log(request.body)
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
var sendText = function(number, body) {
  // var client = require('twilio')(accountSid, authToken); 
  if (!body) {
    let body = "Natalia's in trouble. Pick up her kids!"
  }

  client.messages.create({ 
      to: "+15104499800", 
      from: "+16506655133", 
      body: body, 
  }, function(err, message) { 
      console.log(message.sid); 
  });
};

// Create an HTTP server and listen for requests on port 1337
app.listen(1337);

console.log('TwiML servin\' server running at http://127.0.0.1:1337/');

