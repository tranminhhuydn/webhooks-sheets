const { google } = require("googleapis");
const {authorize} = require('../config/database');

const range = "member!A:E"

module.exports.Member = {
  add: async function (resource) {
    const { auth,  googleSheets } = await authorize()

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId: process.env.SHEETID,
      range: range,
      valueInputOption: "USER_ENTERED",
      resource:resource
    });
  },
  get: async function () {
    const { auth, googleSheets } = await authorize()
    
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId: process.env.SHEETID,
      range: range,
    });
    return getRows.data.values
  },
  delete: function () {

  },
  //celValue is array
  update: async function (range,celValue) {
    const { auth, spreadsheets } = await authorize()
    let request = {
        auth,
        spreadsheetId: process.env.SHEETID,
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [celValue],
        }
    };
    request.range =  `member!${range}`
    return (await spreadsheets.values.update(request)).data;           
  }
}

