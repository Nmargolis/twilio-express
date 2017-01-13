const http = require('http'),
    twilio = require('twilio'),
    express = require('express'),
    urlencoded = require('body-parser').urlencoded;

const app = express();
app.use(urlencoded({ extended: false}));

// const accountSid = secrets.secrets.TWACCOUNTSID;
// const authToken = secrets.secrets.TWAUTHTOKEN;
const accountSid = process.env.TWACCOUNTSID;
const authToken = process.env.TWAUTHTOKEN;


// console.log(secrets);
// console.log('accountSID: ', accountSid);
// console.log('authToken: ', authToken);

console.log(`${accountSid} : ${authToken}`);

const client = require('twilio')(accountSid, authToken);

app.post('/answer', function(request, response) {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();
  // let fromNumber = request.body.From;
  twiml.say('Hello, you have reached the network activation center.', { voice: 'alice' });

  twiml.redirect('/deployMessages');

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());

});

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
      from: "+15103700864",
      body: "Natalia's in trouble. Pick up her kids!",
  }, function(err, message) {
      console.log(message.sid);
  });
};


app.post('/test', (request, response) => {
  console.log('\n\ntesting…', request.query)
  response.status(200).send('POST request to homepage');
})


// Create an HTTP server and listen for requests on port 1337
app.listen(8080);

console.log('Server running at http://127.0.0.1:1337/');

