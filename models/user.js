const {authorize} = require('../config/database');

const range = "account!A:C"

module.exports.User = {
  add: async function (resource) {
    const { auth, authClient, googleSheets } = await authorize()

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId: process.env.SHEETID,
      range: range,
      valueInputOption: "USER_ENTERED",
      resource:resource
    });
  },
  get: async function () {
    const { auth, authClient, googleSheets } = await authorize()
    
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

const ROLE = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  POSTER: 'poster',
  BASIC: 'basic',
  USER: 'user',
  BLOCK: 'block',
}
module.exports.ROLE = ROLE;