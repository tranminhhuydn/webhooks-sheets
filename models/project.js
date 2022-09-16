const { google } = require("googleapis");
const {authorize} = require('../config/database');

const range = "project!A:F"

module.exports.Project = {
  add: async function (resource) {
    const { auth, googleSheets } = await authorize()

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
  update: function () {

  }
}

