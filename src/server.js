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

const client = require('twilio')(accountSid, authToken);

app.post('/answer', function(request, response) {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();
  // let fromNumber = request.body.From;
  twiml.say('Hello, you have reached the network activation center.', {
    voice: 'alice'
  });

  twiml.redirect('/deployMessages');

  // Render the response as XML in reply to the webhook request
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
