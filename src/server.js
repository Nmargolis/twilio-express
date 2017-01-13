// const accountSid = secrets.secrets.TWACCOUNTSID;
// const authToken = secrets.secrets.TWAUTHTOKEN;
const accountSid = process.env.TWACCOUNTSID;
const authToken = process.env.TWAUTHTOKEN;

// const http = require('http'); //Never used
const twilio = require('twilio');
const express = require('express');
const urlencoded = require('body-parser').urlencoded;

// Static data
import Data from './data';

const app = express();
app.use(urlencoded({
  extended: false
}));

// Create twilio client with credentials
const client = require('twilio')(accountSid, authToken);

// Route to answer phone
app.post('/answer', function(request, response) {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();
  // let fromNumber = request.body.From;
  twiml.say('Hello, you have reached the network activation center.', {
    voice: 'alice'
  });


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

  twiml.say('Record your message after the beep. To Do.', {voice: 'alice'});

  response.type('text/xml');
  response.send(twiml.toString());
});


app.post('/deployMessages', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  for (let contact of Data) {
    testSendText(contact.phoneNumber, contact.message);
  }

  twiml.say('Your messages have been sent.');
  response.type('text/xml');
  response.send(twiml.toString());
});

// Helpers
function sendText(number, message) {
  // var client = require('twilio')(accountSid, authToken);

  client.messages.create({
    to: number,
    from: "+15103700864",
    body: message
  }, function(err, message) {
    if (err) {
      console.log("ERROR:", err);
    }
    console.log(message.sid);
  });
}

// TESTING functions
// test functions execute the same logic as the "real" functions without
//  actually sending messages through Twilio.
//

/**
 * Test Route
 */
app.post('/test', (request, response) => {
  // getUserData();
  for (let c of Data) {
    testSendText(c.phoneNumber, c.message);
  }
  console.log('your messages have been sent.');
  response.status(200).send('POST request to homepage');
});

/**
 * Mimics text messages being sent in the console.
 * @param {String} number Phone number to send message to
 * @param {String} message The text message to be sent
 */
function testSendText(number, message) {
  let clientMessage = {
    to: number,
    from: "+15103700864",
    body: message
  };
  console.log(clientMessage);
}

// Create an HTTP server and listen for requests on port 8080
app.listen(8080);
console.log('Server running at http://127.0.0.1:8080/');
