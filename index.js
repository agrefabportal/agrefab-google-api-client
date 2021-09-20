const fs = require('fs');
const googleapis = require('googleapis');

/**
 * Access the google api with valid credentials.
 */
class GoogleApiClient {
    scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
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
    // 
    /**
     * Access google apis. Make sure the application is OAuth Web and "web" is in the client secret file
     * @param {JSON} credentials Private credentials downloaded from Google Cloud.
     */
    constructor(credentials) {
        this.credentials = credentials;
        let { client_secret, client_id, redirect_uris } = this.credentials.web;
        this.oAuth2Client = new googleapis.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    }
    /**
     * Generate PDF document from google sheet data
     */
     generatePDF() {
        return new Promise(resolve => {
            fs.readFile(this.tokensFile, (err, token) => {
                if (err) {
                    resolve(false);
                } else {
                    this.oAuth2Client.setCredentials(JSON.parse(token));
                    resolve(true);
                }
            });
        });
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
            fs.readFile(this.tokensFile, async (err, token) => {
                if (err) {
                    resolve(false);
                } else {
                    this.oAuth2Client.setCredentials(token);
                    this.users.count = 1;
                    resolve(true);
                }
            });
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
     * Prints the names and majors of students in a sample spreadsheet:
     * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
     * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
     */
     listMajors(auth) {
        const sheets = googleapis.google.sheets({ version: 'v4', auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            range: 'Class Data!A2:E',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                console.log('Name, Major:');
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => {
                    console.log(`${row[0]}, ${row[4]}`);
                });
            } else {
                console.log('No data found.');
            }
        });
    }
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getNewToken(oAuth2Client, callback) {
        this.oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(this.tokensFile, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', this.tokensFile);
            });
            callback(oAuth2Client);
        });
    }
    /**
     * Parse code from succesful authentication callback from google's server
     * @param {*} req 
     * @param {*} res 
     * @returns {Promise}
     */
    async parseCode(req, res) {
        return new Promise(resolve => {
            let code = req.url.slice(req.url.indexOf('code=') + 5, req.url.indexOf('&scope='));
            this.oAuth2Client.getToken(decodeURIComponent(code), (err, token) => {
                if (err) return resolve(false);
                this.oAuth2Client.setCredentials(token);
                fs.writeFile(this.tokensFile, JSON.stringify(token), (_) => resolve(false));
                return resolve(true)
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