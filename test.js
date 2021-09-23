const assert = require('assert')
const fs = require('fs');
const GoogleApiClient = require('./index.js');
// WARNING: Remove client secret, client id, and project id before committing to version control. 
var MOCK_CREDENTIALS = {
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
// WARNING: Remove this entire token before committing to version control. 
var MOCK_TOKEN = { "access_token": "###REMOVED###", "scope": "https://www.googleapis.com/auth/spreadsheets.readonly", "token_type": "Bearer", "expiry_date": 1632197422807 };
(async function main() {
    await MOCK_WRITE_TOKEN_FILE();
    await testListExampleData_returnsListAsString();
    await testGetNewAuthToken_savesTokenAsFile();
    await MOCK_DELETE_TOKEN_FILE();
})().catch(error => console.error(error));
/**
 * Test generating a pdf from an appsheets request
 */
async function testListExampleData_returnsListAsString() {
    try {
        let api = new GoogleApiClient(MOCK_CREDENTIALS);
        let authResult = await api.authorize();
        assert.equal(authResult, true, "Mock credentials weren't valid. Any calls to a live API in this test won't work.");
        let data = await api.listExampleData().catch(function (error) { console.log('GOOGLE API RESPONSE ERROR: ' + error); });
        assert.equal(data.length > 0, true);
    } catch (error) {
        console.error(error);
    }
}
/**
 * Write mock token file
 */
async function MOCK_DELETE_TOKEN_FILE() {
    fs.unlink('tokens.json', () => { });
}
/**
 * Write mock token file
 */
async function MOCK_WRITE_TOKEN_FILE() {
    return new Promise((resolve, reject) => {
        fs.writeFile('tokens.json', JSON.stringify(MOCK_TOKEN), 'utf8', function MOCK_TOKEN_CALLBACK(error) {
            if (error) return reject(error);
            resolve();
        });
    });
}

