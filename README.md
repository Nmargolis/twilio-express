# Twilio Express
Twilio routes to receive a phone call, look up a user by phone number, record a message, and send both the recording and prepopulated texts to a user's contacts.

## Getting Started

Clone the repo

```
git clone https://github.com/Nmargolis/twilio-express.git

```

Change into the twilio-express directory and install dependencies

```
npm install

```

Create a Twilio account, get a phone number, and store your credentials in your environment

```
export TWACCOUNTSID='your_twilio_account_sid'
export TWAUTHTOKEN='your_twilio_autho_token'
```

* Also change the "From" phone number in sendText() in server.js

OPTIONAL: Install nodemon globally to automatically restart the server as you work

```
npm install -g nodemon
```


### Running the app

In a terminal window, start gulp

```
gulp
```

In another terminal window, start the server.
If you have nodemon installed:
```
nodemon dist/server.js
```
Otherwise:
```
node dist/server.js
```

## Deployment

To connect this app and Twilio, the app needs to be deployed.

A quick way to do this during development is to expose the port your server is running on to make it public with ngrok.

* Follow the instructions to [install ngrok](https://ngrok.com/download).

* In the directory where it's downloaded:

```
ngrok http 8080
```
(Since the server is set to run on port 8080)

* Copy the ngrok forwarding url

* Go to your Twilio console in the browser and navigate to "Manage numbers"

* Click on the number you're using, and add the ngrok url with the route '/answer' as the webhook for receiving calls


## License

This project is licensed under the MIT License
