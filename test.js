// WARNING: Remove client secret, client id, and project id before committing to version control. 
var MOCK_CREDENTIALS = {
    "web": {
        "client_id": "903489934431-9mem2jf7r4tuuj5ardp0v28sl6aq2h5i.apps.googleusercontent.com",
        "project_id": "agrefab-api-keys-325400",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "1zXN64rkcwlKL0qEL3H_oT_0",
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
var MOCK_TOKEN = { "access_token": "ya29.a0ARrdaM95aNNzi8AvJrMJJeBtZCLyOjRhMVuRcMOE_hFUdS2vs407HiDyM2qmOCRWjMFJd4dAsY4PQEm4edPCemfLFDBbpnV3CBu-Emwgz1HZuQ_kyqLCZaHb80J0T2EzEg9acNUzap2YA1Qk6sQOOqBwlkYE", "refresh_token": "1//0fTjh_SORAq_KCgYIARAAGA8SNwF-L9Irq9TdKHXrSNDa9QtJX1KGvemjXs7MlOdakHX6mkLKgv67r37Yra0gGO_Yc8AeSsrI-rM", "scope": "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly", "token_type": "Bearer", "expiry_date": 1632844072905 };
const assert = require('assert');
const fs = require('fs');
const GoogleApiClient = require('./index.js');
(async function main() {
    await WRITE_TOKEN_FILE();
    await Promise.all([
        // testListExampleData_returnsListOfItems(),
        // testGetGuide_returnsAgrefabGuide(),
        testGetGuideImage_savesFile(),
        testGetStepImages_savesFiles(),
    ]).catch(error => console.error(error)).then(async _ => console.log('🏖  All tests passed. ✅'));
    await DELETE_TOKEN_FILE();
})().catch(error => console.error(error));

/**
 * Test getting an image from google drive
 */
async function testGetGuideImage_savesFile() {
}
/**
* Get a step image from google drive and check that it saves a file.
*/
async function testGetStepImages_savesFiles() {
    let api = await getGoogleApiClient();
    let filePath = await api.saveStepImage('5fb5bee7.Photo1.132604.jpg', '05d8fd63').catch(error => console.log('GOOGLE API RESPONSE ERROR: ' + error));
    await deletePhotoFile(filePath);
}
/**
 * Get the guide image from google drive and check that it saves a file.
 */
async function testGetGuideImage_savesFile() {
    let api = await getGoogleApiClient();
    let filePath = await api.saveGuideImage('05d8fd63.GuidePhoto.143710.jpg', '05d8fd63').catch(error => console.error('GOOGLE API RESPONSE ERROR: ' + error));
    await deletePhotoFile(filePath);
}
/**
 * Test get guide returns all the neccessary fields for an Appsheet guide to be converted into a PDF
 */
async function testGetGuide_returnsAgrefabGuide() {
    let api = await getGoogleApiClient();
    let tables = await api.getGuide().catch(error => console.error('GOOGLE API RESPONSE ERROR: ' + error));
    assert.equal(tables != undefined, true);
}
/**
 * Test api call to a known public spreadsheet
 */
async function testListExampleData_returnsListOfItems() {
    let api = await getGoogleApiClient();
    let data = await api.listExampleData().catch(error => console.log('GOOGLE API RESPONSE ERROR: ' + error));
    assert.equal(data.length > 0, true);
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
 * Delete file on the local filesystem. This inherently also checks if the file exists. Assertions are made during the delete process.
 * @param {string} filePath Relative path to the file including its name and extension.
 */
async function deletePhotoFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(`photos/${filePath}`, error => {
            assert.notEqual(error?.code, 'ENOENT', `There was no file found with the following name: ${filePath}`);
            assert.equal(error, null);
            console.log(`📄🗑 ${filePath} was created and deleted. Comment out @function deleteFile() to keep the file.`);
            resolve();
        });
    });
}
/**
 * Delete mock token file
 */
async function DELETE_TOKEN_FILE() {
    return new Promise((resolve, reject) => {
        fs.unlink('tokens.json', _ => { resolve() });
    });
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

