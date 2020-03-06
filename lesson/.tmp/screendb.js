const fs = require('fs');
const mongoose = require('mongoose');
const readline = require('readline');
const {google} = require('googleapis');
const puppeteer = require('puppeteer');
const { Schema } = require('mongoose');
const connections = require('../src/config/connection');

const UserSchema = new Schema(
    {
        link: {
            type: String,
        },
    },
    {
        collection: 'googledrive',
        versionKey: false,
    },
);

const UserModel = connections.model('UserModel', UserSchema);

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = 'token.json';

// save screenshot
async function screenUser() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/v1/users/');
  await page.screenshot({path: 'example.png'});
 
  await browser.close();
}

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  screenUser().then(() => {
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), storeFiles);
    authorize(JSON.parse(content), listFiles);
  });
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

// update files on Google Drive 
function storeFiles(auth) {
    console.log("auth", JSON.stringify(auth));
    const drive = google.drive({version: 'v3', auth});
    var fileMetadata = {
            'name': 'example.png'
    };
    var media = {
            mimeType: 'image/png',
            //PATH OF THE FILE FROM YOUR COMPUTER
            body: fs.createReadStream('./example.png')
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function (err, file) {
    if (err) {
        // Handle error
        console.error(err);
    } else {
        console.log('File Id: ', file.data.id);
    }
 });
}

// get files from Google Drive 
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      files.map((file) => {
        if (file.name == 'example.png') {
            UserModel.create({ link: `https://drive.google.com/uc?id=${file.id}` }, (err) => {
                if (err) console.log(err);
                connections.close();
            });
        }
      });
    } else {
      console.log('No files found.');
    }
  });
}
