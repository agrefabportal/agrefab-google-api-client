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
// WARNING: Remove access token before committing to version control. 
var MOCK_TOKEN = { "access_token": "###REMOVED###", "scope": "https://www.googleapis.com/auth/spreadsheets.readonly", "token_type": "Bearer", "expiry_date": 1632197422807 };
const assert = require('assert');
const fs = require('fs');
const GoogleApiClient = require('./index.js');
(async function main() {
    await WRITE_TOKEN_FILE();
    Promise.all([
        await testListExampleData_returnsListOfItems(),
        await testGetGuide_returnsAgrefabGuide(),
    ]).then(async function (value) {
        console.log('🏖  All tests passed. ✅');
    });
    await DELETE_TOKEN_FILE();
})().catch(error => console.error(error));
/**
 * Test get guide returns all the neccessary fields for an Appsheet guide to be converted into a PDF
 */
async function testGetGuide_returnsAgrefabGuide() {
    try {
        let api = await getGoogleApiClient();
        let tables = await api.getGuide().catch(error => {
            console.log('GOOGLE API RESPONSE ERROR: ' + error);
        });
        assert.equal(tables.length > 0, true);
    } catch (error) { console.log(error); }
}
/**
 * Test api call to a known public spreadsheet
 */
async function testListExampleData_returnsListOfItems() {
    try {
        let api = await getGoogleApiClient();
        let data = await api.listExampleData().catch(error => {
            console.log('GOOGLE API RESPONSE ERROR: ' + error);
        });
        assert.equal(data.length > 0, true);
    } catch (error) { console.error(error); }
}
/**
 * Get an instance of the google api client
 * @returns {GoogleApiClient} api Google API Client
 */
async function getGoogleApiClient() {
    let api = new GoogleApiClient(MOCK_CREDENTIALS);
    let authResult = await api.authorize();
    assert.equal(authResult, true, "Mock credentials weren't valid. Any calls to a live API in this test won't work.");
    return api;
}
/**
 * Write mock token file
 */
async function DELETE_TOKEN_FILE() {
    fs.unlink('tokens.json', () => { });
}
/**
 * Write mock token file
 */
async function WRITE_TOKEN_FILE() {
    return new Promise((resolve, reject) => {
        fs.writeFile('tokens.json', JSON.stringify(MOCK_TOKEN), 'utf8', function MOCK_TOKEN_CALLBACK(error) {
            if (error) return reject(error);
            resolve();
        });
    });
}

