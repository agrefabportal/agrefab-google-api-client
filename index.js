const fs = require('fs');
const googleapis = require('googleapis');
/**
 * Access the google api with valid credentials.
 */
class GoogleApiClient {
    scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.readonly'];
    tokensFile = 'tokens.json';
    users = { "count": 0 };
    oAuth2Client;
    credentials;
    get authUrl() {
        return this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.scopes,
        });
    }
    /**
     * You must call @method {authorize} and get a successful response before making any API calls. Make sure the application is OAuth Web and "web" is in the client secret file
     * @param {JSON} credentials Private credentials downloaded from Google Cloud.
     */
    constructor(credentials) {
        this.credentials = credentials;
        let { client_secret, client_id, redirect_uris } = credentials.web;
        this.oAuth2Client = new googleapis.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    }
    /**
    * Get image from google drive
    * @returns {String} file Path to saved file
    */
    async saveImage(fileName, guideId) {
        const drive = googleapis.google.drive({ version: 'v3', auth: this.oAuth2Client });
        return new Promise(async function (resolve, reject) {
            let fileId = await this.googleApiClient.getFileId(fileName, drive).catch(error => {
                console.error(error);
            });
            if (fileId) {
                drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' }, ((error, response) => {
                    let destinationFileName = `${this.guideId}_${this.fileName}`;
                    var destination = fs.createWriteStream(destinationFileName);
                    response.data.on('error', error => reject(error));
                    response.data.pipe(destination);
                    destination.on('error', error => reject(error));
                    destination.on('close', () => resolve(destinationFileName));
                }).bind({ fileName: this.fileName, guideId: this.guideId, resolve, reject }));
            } else {
                reject('No file ID');
            }
        }.bind({ googleApiClient: this, guideId, fileName }));
    }
    /**
    * Get file ID from the app sheet google drive folder
    * @returns {String} fileId File ID associated with the file name
    */
    async getFileId(name, drive) {
        return new Promise(function (resolve, reject) {
            drive.files.list({
                q: `name = "${name}" and "1El9O36ejRykuK_hobtqvE8FWvqYOTB1h" in parents`,
            }, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    let files = response.data.files
                    if (files.length > 0) {
                        resolve(files[0].id);
                    } else {
                        reject('No file found matching that name.')
                    }
                }
            });
        });
    }
    /**
    * Get guide data and return a formated string
    * @returns {Object} output Data neccessary to create a guide as a PDF document
    */
    async getGuide(guideTitle) {
        const sheets = googleapis.google.sheets({ version: 'v4', auth: this.oAuth2Client });
        return new Promise(function (resolve, reject) {
            sheets.spreadsheets.values.batchGet({
                spreadsheetId: '155WzyGXQat73gHDnooFiZq-x2f_4ysAgU3n_-rjHFUg',
                ranges: ['Guides!A1:Z', 'Steps!A1:Z', 'Bullets!A1:Z', 'Tools!A1:Z']
            }, (error, response) => {
                if (error) return reject('The API returned an error: ' + error)
                let guides = response.data.valueRanges[0].values;
                let steps = response.data.valueRanges[1].values;
                let bullets = response.data.valueRanges[2].values;
                let tools = response.data.valueRanges[3].values;
                resolve({ guides, steps, bullets, tools });
            });
        }.bind(sheets));
    }
    /**
     * List data from a public google sheet
     */
    async listExampleData() {
        const sheets = googleapis.google.sheets({ version: 'v4', auth: this.oAuth2Client });
        return new Promise(function (resolve, reject) {
            sheets.spreadsheets.values.get({
                spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
                range: 'Class Data!A2:E',
            }, (err, res) => {
                if (err) return reject('The API returned an error: ' + err);
                resolve(res.data.values);
            });
        }.bind(sheets));
    }
    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     * @returns {Promise}
     */
    async authorize() {
        return new Promise(resolve => {
            fs.readFile(this.tokensFile, (async (err, token) => {
                if (err) {
                    resolve(false);
                } else {
                    this.oAuth2Client.setCredentials(JSON.parse(token));
                    this.users.count = 1;
                    resolve(true);
                }
            }).bind(this.oAuth2Client));
        });
    }
    /**
     * Verify token(s) in token file
     * @param {*} token 
     */
    async verify(token) {
        const ticket = await this.oAuth2Client.verifyIdToken({
            idToken: token,
            audience: this.credentials.web.client_id
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        // verify().catch(console.error);
    }
    /**
     * Parse code from succesful authentication callback from google's server
     * @param {*} req 
     * @param {*} res 
     * @returns {Promise}
     */
    async parseCode(req, res) {
        return new Promise((resolve, reject) => {
            let code = req.url.slice(req.url.indexOf('code=') + 5, req.url.indexOf('&scope='));
            this.oAuth2Client.getToken(decodeURIComponent(code), (error, token) => {
                if (error) return reject(error);
                this.oAuth2Client.setCredentials(token);
                fs.writeFile(this.tokensFile, JSON.stringify(token), (error) => reject(error));
                resolve(token);
            });
        });
    }
    /**
     * Sign in with Google button. Full HTML page.
     * @returns {String}
     */
    html01() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
             <meta charset="UTF-8">
         <meta http-equiv="X-UA-Compatible" content="IE=edge">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <script src="https://accounts.google.com/gsi/client"></script>
         <title>Agrefab Odoo Connector</title>
         </head>
         <body>
         <div id="g_id_onload" data-client_id="292279409542-b55635h0v9clkufit9rdvp4amej1kde6.apps.googleusercontent.com" data-login_uri="https://awsagrefab.com/a" data-auto_prompt="false"></div>
             <div class="g_id_signin"
                  data-type="standard"
                  data-size="large"
                  data-theme="outline"
                  data-text="sign_in_with"
                  data-shape="rectangular"
                  data-logo_alignment="left">
             </div>
         </body>
         </html>
         `
    }
    /**
    * Test post to server with an example page.
    * @returns {String}
    */
    html02() {
        return `
            <html>
                <body>
                    <form method="post" action="https://awsagrefab.com/a">Name: 
                        <input type="text" name="name" />
                        <input type="submit" value="Submit" />
                    </form>
                </body>
            </html>`
    }
}
module.exports = GoogleApiClient;