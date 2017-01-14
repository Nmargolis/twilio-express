// const accountSid = Secrets.TWACCOUNTSID;
// const authToken = Secrets.TWAUTHTOKEN;
const accountSid = process.env.TWACCOUNTSID;
const authToken = process.env.TWAUTHTOKEN;

const twilio = require('twilio');
const express = require('express');
const urlencoded = require('body-parser').urlencoded;

// import Firebase from 'firebase';
const firebase = require("firebase-admin");
const serviceAccount =
  require("./igloo-7d549-firebase-adminsdk-s6ucw-914f7b873b.json");
// firebase.database.enableLogging(true)

// Global instance variable
var instanceUser = {};

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://igloo-7d549.firebaseio.com"
});

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

  twiml.gather({
    timeout: 10,
    action: '/validateId'
  }, gatherNode => {
    gatherNode.say('Please enter your phone number and press pound.', {
      voice: 'alice'
    });
  });

  twiml.redirect('/getId');

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/validateId', (request, response) => {
  console.log('validateId');
  let twiml = new twilio.TwimlResponse();

  // let tempphoneNumber = request.query.id;
  // console.log('posting…')
  // console.log('instanceuserID', instanceUser.userId)

  if (request.body.Digits) {
    let phoneNumber = request.body.Digits;
    twiml.say('You entered ' + phoneNumber + '.', {
      voice: 'alice'
    });

    let userId = phoneNumber;
    let uri = '/sayMainOptions/?id=' + userId;
    instanceUser.userId = userId;

    twiml.redirect(uri);
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/sayMainOptions', (request, response) => {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();

  twiml.say('Here are your options.', {
    voice: 'alice'
  });

  twiml.gather({
    timeout: 3,
    action: '/handleMainOption'
  }, gatherNode => {
    gatherNode.say('Press 1 to hear your rights. Press 2 to record a message. Press 3 to send out your messages.', {
      voice: 'alice'
    });
  });

  twiml.redirect('/sayMainOptions');

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/handleMainOption', (request, response) => {
  let twiml = new twilio.TwimlResponse();
  let selection = request.body.Digits;

  let selectionMap = {
    '1': '/sayRights',
    '2': '/recordMessage',
    '3': '/deployMessages'
  };

  twiml.say('You selected ' + selection, {
    voice: 'alice'
  });

  let uri = selectionMap[selection];

  twiml.redirect(uri);

  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/sayRights', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  twiml.say('Here are your rights. Coming soon.', {
    voice: 'alice'
  });

  twiml.redirect('/sayMainOptions');

  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/recordMessage', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  twiml.say('Record your message after the beep and press pound.', {
    voice: 'alice'
  });

  twiml.record({
    transcribe: false,
    maxLength: 30,
    action: '/handleRecording'
  });
  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/handleRecording', (request, response) => {
  let twiml = new twilio.TwimlResponse();
  // console.log('this is the action');
  // console.log(request.body);

  let recordingUrl = request.body.RecordingUrl;
  twiml.say('Your recorded message is: ', {
    voice: 'alice'
  });
  twiml.play(recordingUrl);

  let confirmRecordingUri = '/confirmRecording/?recordingUrl=' + recordingUrl;

  twiml.gather({
    timeout: 3,
    action: confirmRecordingUri
  }, gatherNode => {
    gatherNode.say('Press 1 to confirm and send your messages. Press 2 to record again. Press 3 to return to the main menu.', {
      voice: 'alice'
    });
  });

  twiml.redirect('/handleRecording');

  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/confirmRecording', (request, response) => {
  let twiml = new twilio.TwimlResponse();

  let recordingUrl = request.query.recordingUrl;
  let selection = request.body.Digits;

  let selectionMap = {
    '1': '/deployMessages/?recordingUrl=' + recordingUrl,
    '2': '/recordMessage',
    '3': '/sayMainOptions'
  };
    // twiml.redirect('/handleRecording');

  twiml.redirect(selectionMap[selection]);

  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/deployMessages', (request, response) => {
  console.log('Instance user id', instanceUser.userId);
  // get user data, then based on the contact list, send out the messages
  getUserData(instanceUser.userId).then(payload => {
    console.log('payload', payload);
    for (let contact of payload.contacts) {
      console.log('sending…messages…');
      console.log(`${contact.phoneNumber}: ${contact.message}`);

      sendText(contact.phoneNumber, contact.message);

      if (request.query.recordingUrl) {
        sendText(contact.phoneNumber, request.query.recordingUrl);
      }
    }
  });
});

app.post('/deployMessagesFromApp', (request, response) => {
  let userId = request.query.id;

  getUserData(userId).then(payload => {
    console.log('payload', payload);
    for (let contact of payload.contacts) {
      console.log('sending…messages…');
      console.log(`${contact.phoneNumber}: ${contact.message}`);
      sendText(contact.phoneNumber, contact.message);
    }
  });

  console.log('your messages have been sent.');
  response.status(200).send('POST request to homepage');
});

app.get('/data', (request, response) => {
  // get the user id
  let userId = request.query.id;
  console.log('request id', userId);
    // lookup the user id
  getUserData(userId).then(payload => {
    // return the contacts data
    response.send(payload);
  });
});

// Helpers

/**
 * Send a SMS Text message through/from Twilio.
 * @param {String} number the recipients phone number.
 * @param {String} message message to be sent.
 * @param {Object} options any options that need to be passed through.
 */
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

/**
 * Retrieves user data from Firebase
 * @param {String} userId the users unique id, phone number as a string
 * @return {Promise} firebase user data object.
 */
function getUserData(userId) {
  let ref = firebase.database().ref('users/' + userId);
  return new Promise(resolve => {
    ref.once('value', function(snapshot) {
      console.log('snapshot', snapshot.val());
      resolve(snapshot.val());
    });
  });
}

// TESTING functions.
// test functions execute the same logic as the "real" functions without
//  actually sending messages through Twilio.
//

/**
 * Test Route
 */
app.post('/test', (request, response) => {
  // getUserData();
  let userId = request.query.id;
  console.log(userId);
  getUserData(userId).then(payload => {
    console.log('payload', payload);
    for (let c of payload.contacts) {
      testSendText(c.phoneNumber, c.message);
    }
  });

  // console.log('your messages have been sent.');
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
app.listen(process.env.PORT || 8080);
console.log('Server Started!');
