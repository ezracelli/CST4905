const { auth } = require('./auth');
const { google } = require('googleapis');

const { GOOGLE_SHEET_ID } = process.env;

module.exports = class Db {
    constructor () {
        this._auth = auth();
    }

    async populate () {
        this._sheets = google.sheets({ version: 'v4', auth: await this._auth });

        const { data: { values } } = await this._sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Students!A1:ZZ',
            valueRenderOption: 'UNFORMATTED_VALUE',
        });

        this._rows = values;
    }

    async get (id) {
        if (!this._rows) await this.populate();

        const [ headers, ...rows ] = this._rows;
        const row = this._rows.find((row) => row[0]?.toString() === id.toString());

        return row ? Object.assign(
            ...headers.map((header, j) => ({
                [header]: row[j],
            })),
        ) : undefined;
    }

    async set (id, value) {
        if (!this._rows) await this.populate();

        const [ headers ] = this._rows;
        const row = headers.map((header) => value[header]);

        const rowIndex = this._rows.findIndex((row) => {
            return row[0]?.toString() === id.toString()
        });

        if (rowIndex !== -1) this._rows[rowIndex] = row;
        else this._rows.push([ ...row.slice(0, -1), true ]);

        await this._sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Students!A1:ZZ',
            valueInputOption: 'RAW',
            requestBody: {
                values: this._rows,
            },
        });
    }

    toObject () {
        const [ headers, ...rows ] = this._rows;

        return Object.assign(
            ...rows.map((row, i) => ({
                [row[0]]: Object.assign(
                    ...headers.map((header, j) => ({
                        [header]: row[j],
                    })),
                ),
            })),
        );
    }
}
