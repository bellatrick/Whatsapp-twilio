// Import TwilioClient
const twilio = require("twilio");

// load the .env file
require("dotenv").config()

// Define your Twilio account SID
const accountSid = process.env.ACCOUNT_SID

// Define your Twilio auth token
const authToken = process.env.AUTH_TOKEN

// Create an instance of TwilioClient
const client = twilio(accountSid, authToken);
// Import fs module for file operations
const fs = require("fs");

// Define a file name to store the preferred languages of each user
const languageFile = "languages.json";

// Define a file name to store the sender-receiver pairs
const pairFile = "pairs.json";

// Define a function to read the preferred language of a user from the file
const getLanguage = (user) => {
  // Read the file content as a string
  const data = fs.readFileSync(languageFile, "utf8");
  // Parse the string as a JSON object
  const languages = JSON.parse(data);
  // Return the preferred language of the user or "en" as default
  return languages[user] || "en";
};

// Define a function to write the preferred language of a user to the file
const setLanguage = (user, language) => {
  // Read the file content as a string
  const data = fs.readFileSync(languageFile, "utf8");
  // Parse the string as a JSON object
  const languages = JSON.parse(data);
  // Set the preferred language of the user
  languages[user] = language;
  // Stringify the JSON object as a string
  const newData = JSON.stringify(languages);
  // Write the string to the file
  fs.writeFileSync(languageFile, newData);
};
// Define a function to write the preferred Receiver of a user to the file
const setReciever = (user, receiver) => {
  // Read the file content as a string
  const data = fs.readFileSync(pairFile, "utf8");
  // Parse the string as a JSON object
  const pairs = JSON.parse(data);
  // Set the reciever
  pairs[user] = receiver;
  // Stringify the JSON object as a string
  const newData = JSON.stringify(pairs);
  // Write the string to the file
  fs.writeFileSync(pairFile, newData);
};
// Define a function to get the receiver's number from the file
const getReceiver = (sender) => {
  // Read the file content as a string
  const data = fs.readFileSync(pairFile, "utf8");
  // Parse the string as a JSON object
  const pairs = JSON.parse(data);
  // Return the receiver's number or null if not found
  return pairs[sender] || null;
};

// Define a function to send a message using Twilio API
const sendMessage = (from, to, body) => {
  // Send back a message to WhatsApp with Twilio API
  client.messages.create({ from, to, body }).then((message) => {
    // Log the message SID to the console
    console.log(message.sid);
  });
};

module.exports= {
  sendMessage,
  getReceiver,
  setReciever,
  setLanguage,
  getLanguage,
};
