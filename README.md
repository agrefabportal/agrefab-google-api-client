# Agrefab Google API Client for NodeJS
NodeJS client for getting data from Google APIs.

## Installation
`npm i agrefab-google-api-client`

## How to use
```javascript
let api = new GoogleApiClient(MOCK_CREDENTIALS);
let authResult = await api.authorize();
let data = await api.listExampleData().catch(error => {
    console.log('GOOGLE API RESPONSE ERROR: ' + error);
});
```
See [tests.js](tests.js) for more examples.

## Usage information
* You must call and get a successful response from api.authrorize() before making a call to any API.
*  The program needs to be run on a server with a persistent filesystem due to tokens being saved as files.
* Requires valid credentials to be created in Google Cloud console. Make sure to enable all APIs that you plan to use.

### Google APIs used
* Google Sheets