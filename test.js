const assert = require('assert')
const api = require('./index.js');

// WARNING: Remove client secrets before commiting to version control. 
var mockClientSecrets = `{
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
}}`
let googleClient = new api.GoogleApiClient(JSON.parse(mockClientSecrets));