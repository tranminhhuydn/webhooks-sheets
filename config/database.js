const { google } = require("googleapis");
const
    fs = require('fs'),
    path = require('path')

async function authorize() {

  if(!fs.existsSync('./dist'))
  fs.mkdirSync('./dist')

  if(!fs.existsSync('./dist/credentials.json')){
      fs.writeFileSync('./dist/credentials.json',process.env.CREDENTIALS,"utf8")
  }


  const auth = new google.auth.GoogleAuth({
      keyFile: "./dist/credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const authClient = await auth.getClient();  
  if (authClient == null) {
    throw Error('authentication failed');
  }
  const googleSheets = google.sheets({ version: "v4", auth: authClient });
  const spreadsheets =  googleSheets.spreadsheets
  const spreadsheetId = process.env.SHEETID
  //return authClient;
  return { auth, authClient, googleSheets,spreadsheetId,spreadsheets};

}

module.exports.authorize = authorize;