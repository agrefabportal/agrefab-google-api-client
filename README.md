# Agrefab Google API Client for NodeJS
NodeJS client for getting data from various Google APIs.

## Installation
`npm i agrefab-google-api-client`

## How to use
```javascript
const GoogleApiClient = require('agrefab-google-api-client');


(async function main() {
    let your_credentials = {
        "web": {
            "client_id": "###REMOVED###",
            "project_id": "###REMOVED###",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": "###REMOVED###",
            "redirect_uris": [
                "http://localhost:3000/a"
            ],
            "javascript_origins": [
                "https://awsagrefab.com",
                "http://localhost",
                "http://localhost:3000"
            ]
        }
    };
    let api = new GoogleApiClient(your_credentials);
    let authResult = await api.authorize();
    let data = await api.listExampleData().catch(error => {
        console.log('GOOGLE API RESPONSE ERROR: ' + error);
    });
})().catch(error => console.error(error));
```
See [tests.js](tests.js) for more examples.

## Usage information
* Requires valid token saved at ./tokens.json. You are responsible for using a web server to get this or copy pasting a token from an API explorer into a file at that location.
* You must call api.authrorize() and get a successful response from before making a call to any API.
*  The program needs to be run on a server with a persistent filesystem due to tokens being saved as files.
* You must create your own web OAuth project in Google Cloud console. Make sure to enable all APIs that are used.

### Google APIs used
* Google Sheets