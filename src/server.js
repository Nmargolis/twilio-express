// Static data
import Users from './data';
import Secrets from './setup';

const accountSid = Secrets.TWACCOUNTSID;
const authToken = Secrets.TWAUTHTOKEN;
// const accountSid = process.env.TWACCOUNTSID;
// const authToken = process.env.TWAUTHTOKEN;

const twilio = require('twilio');
const express = require('express');
const urlencoded = require('body-parser').urlencoded;

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

  // twiml.redirect('/deployMessages');
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
  }

  twiml.say('Here are your options.', { voice: 'alice' });

  twiml.gather({ timeout: 3, action: '/handleMainOption'}, (gatherNode) => {
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

  twiml.say('Here are your rights. Coming soon.', {voice: 'alice'});

  twiml.redirect('/sayMainOptions');

  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/recordMessage', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  twiml.say('Record your message after the beep and press pound.', {voice: 'alice'});

  twiml.record({transcribe: false, maxLength: 30, action: '/handleRecording'})
  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/recordingCallback', (request, response) => {
  let twiml = new twilio.TwimlResponse();
  console.log('this is the callback');
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
  // console.log('this is the action');
  // console.log(request.body);

  let recordingUrl = request.body.RecordingUrl;
  twiml.say('Your recorded message is: ', {voice: 'alice'});
  twiml.play(recordingUrl);

  let confirmRecordingUri = '/confirmRecording/?recordingUrl=' + recordingUrl;

  twiml.gather({ timeout: 3, action: confirmRecordingUri}, (gatherNode) => {
    gatherNode.say('Press 1 to confirm and send your messages. Press 2 to record again. Press 3 to return to the main menu.', { voice: 'alice'});
  });

  // twiml.redirect('/handleRecording');

  response.type('text/xml');
  response.send(twiml.toString());
});


app.post('/confirmRecording', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  let recordingUrl = request.query.recordingUrl;
  let selection = request.body.Digits;

  let selectionMap = {
    '1': '/deployMessages/?recordingUrl='+recordingUrl,
    '2': '/recordMessage',
    '3': '/sayMainOptions'
  }
  // twiml.redirect('/handleRecording');

  twiml.redirect(selectionMap[selection]);


  response.type('text/xml');
  response.send(twiml.toString());
})


app.post('/deployMessages', (request, response) => {
  let twiml = new twilio.TwimlResponse();
  // console.log(Users);

  for (let contact of Users['15104499800'].contacts) {
    // console.log(contact);
    sendText(contact.phoneNumber, contact.message);

    if (request.query.recordingUrl) {
      sendText(contact.phoneNumber, request.query.recordingUrl);
    }
  }

  twiml.say('Your messages have been sent.', {voice: 'alice'});
  response.type('text/xml');
  response.send(twiml.toString());
});


// Helpers
function sendText(number, message, options) {
  // var client = require('twilio')(accountSid, authToken);
  console.log('sending text');
  client.messages.create({
    to: number,
    from: "+16506655133",
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
  for (let c of Users['15104499800'].contacts) {
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
    from: "+16506655133",
    body: message
  };
  console.log(clientMessage);
}

// Create an HTTP server and listen for requests on port 8080
app.listen(8080);
console.log('Server running at http://127.0.0.1:8080/');
