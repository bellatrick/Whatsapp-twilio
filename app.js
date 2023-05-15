// Import Express
const express = require("express");
//import helper functions
const {
  sendMessage,
  setLanguage,
  getLanguage,
  setReciever,
  getReceiver,
} = require("./helperfunctions.js");
// Create an instance of Express
const app = express();
app.use(express.json());
// Define a port number for the server
const port = process.env.PORT || 3000;

// Import Translate from the Google Cloud client library
const { Translate } = require("@google-cloud/translate").v2;

// Create an instance of Translate with your project ID
const translate = new Translate({
  projectId: "twitter-e364c",
  key: process.env.GOOGLE_API_KEY
});

// Define a route for handling WhatsApp messages
app.post("/", express.urlencoded(), (req, res) => {
  // Define the text to be translated
  const text = req.body.Body;
  // Define the sender's number
  const from = req.body.From;
  // define twilio's number
  const twilioNumber = req.body.To;
  // Split the text by space
  const parts = text.split(" ");
  // get the reciever's number by splitting by the string "whatsapp:+"
  const to = parts[0].startsWith("whatsapp:+")
    ? parts.shift()
    : getReceiver(from);

  try {
    // Check if the text starts with the /lang command to switch languages
    if (text.startsWith("/lang")) {
      // Get the language code from the text
      const language = parts[1];
      if (language.length > 2) {
        sendMessage(
          twilioNumber,
          from,
          `Please ensure that your language is in the ISO 639-1 format or your message will not be delivered. You can search for your language format here https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes`
        );
        return;
      }
      // Set the preferred language of the sender to the file
      setLanguage(from, language);
      // Send back a confirmation message to WhatsApp with Twilio API
      sendMessage(
        twilioNumber,
        from,
        `Your preferred language is set to ${language}.`
      );
      return;
    }
    // Check if the receiver's number is null or not
    if (to === null) {
      // Send back a message to the sender asking them to provide a valid receiver's number
      sendMessage(
        twilioNumber,
        from,
        "Welcome to LinguaLink. Please provide a valid receiver's number in the format whatsapp:+146786543. To change your default language type /lang <language code>. For example /lang fr will set your preferred language to French. Please ensure that your language is in the ISO 639-1 format or your message will not be delivered. You can search for your language format here https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes"
      );
      return;
    } else {
      // Get the message from either the rest of the parts or from the whole text
      const message = parts.length > 0 ? parts.join(" ") : text;
      setReciever(from, to);
      // Get the preferred language of both sender and receiver from the file
      const sourceLanguage = getLanguage(from);
      const targetLanguage = getLanguage(to);

      if (sourceLanguage !== targetLanguage) {
        // Translate the message using the translate() method

        translate.translate(message, targetLanguage).then(([translation]) => {
          // Send back a translated message to WhatsApp with Twilio API

          sendMessage(twilioNumber, to, translation);

          // Log the translation to the console

          console.log(`Text: ${message}`);

          console.log(`Translation: ${translation}`);
        });
      } else {
        // Send back an untranslated message to WhatsApp with Twilio API
        sendMessage(twilioNumber, to, message);
      }
    }
  } catch (err) {
    console.log(err);
  }

  res.send();
});

// Start the server and listen for incoming requests
app.listen(port, () => {
  // Print a message to the console indicating that the server is running
  console.log(`Server is running on port ${port}`);
});

// Global error handler - route handlers/middlewares which throw end up here
app.use((err, req, res, next) => {
  // response to user with error status and details
  res.status(err.status || 500).send(err.message || "Something went wrong");
});


