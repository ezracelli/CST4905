const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
const readline = require('readline');

require('dotenv').config();

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

module.exports.auth = async function auth () {
    const {
        client_secret: clientSecret,
        client_id: clientId,
        redirect_uris: redirectUris,
    } = (await credentials()).installed;

    const auth = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUris[0],
    );

    auth.setCredentials(await tokens(auth));

    return auth;
}

async function credentials () {
    const credentials = await fs.promises.readFile(CREDENTIALS_PATH, 'utf-8');
    return JSON.parse(credentials);
}

/** @param {google.auth.OAuth2} auth a Google OAuth2 client */
async function tokens (auth) {
    try {
        return JSON.parse(await fs.promises.readFile(TOKEN_PATH, 'utf-8'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            const { tokens } = await (async () => {
                const authUrl = auth.generateAuthUrl({
                    access_type: 'offline',
                    scope: JSON.parse(process.env.GOOGLE_API_SCOPES),
                });

                console.log(authUrl);

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                const code = await new Promise((resolve, reject) => {
                    rl.question('Code: ', (answer) => resolve(answer))
                });

                rl.close();

                return await auth.getToken(code);
            })();

            fs.promises.writeFile(TOKEN_PATH, JSON.stringify(token), 'utf-8');

            return token;
        } else throw err;
    }
}

if (process.argv.includes(__filename)) {
    auth();
}
