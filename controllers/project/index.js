const fs = require("fs");
const { google } = require("googleapis");

exports.before = async function(req, res,next) {
    next()
}
exports.index = async function(req, res) {
    // console.log('----------------cookie');
    // console.log(req.cookies);

    const {auth, spreadsheetId,dbObject } = req.sysApi
    //read
    const getRows = await dbObject.get({
        auth,
        spreadsheetId,
        range: "project!A:F",
    });
    const {values} = getRows.data
    
    //const filter = values.filter((e,i)=>{if(e[2]==req.cookies['session-token'].email) return e})
    
    res.render('index',{data:values})
};
exports.add = async function(req, res) {
    //Tự Điển Viện Nghiên Cứu Phật Học Việt Nam
    if(req.method=='POST'){
        const {name,credentialsjson,sheetid} = req.body
        const {auth, spreadsheetId,dbObject } = req.sysApi
        //read
        const getRows = await dbObject.get({
            auth,
            spreadsheetId,
            range: "project!A:F",
        });
        //find
        const {values} = getRows.data
        const result = values.find((e,i)=>{
            if(e[1]==name) return e
        })
        //write
        if(!result){
            await dbObject.append({
                auth,
                spreadsheetId,
                range: "project!A:F",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [[values.length,name,req.cookies['session-token'].email,'open',credentialsjson,sheetid]],
                },
            });
            req.flash('success', req.t('The project created'))
        }
        return res.redirect(`/${res.controller}/`)
    }
    if(req.method=='GET'){
        res.render('add')
    }
}

exports.prebind = async function (req,res,next) {

    var id=projectID = req.params[0]
    var { sheetname, cellColum, cellRow, cellValue } = req.query
    var clienDB

    const { auth, spreadsheetId, dbObject } = req.sysApi
    //read
    const getRows = await dbObject.get({
        auth,
        spreadsheetId,
        range: "project!A:F",
    });
    const { values } = getRows.data
    clienDB = values
    //res.cookie('clienDB', clienDB)


    const result = clienDB.find((e, i) => {
        if (e[0] == projectID) return e
    })
    console.log('------------------------')
    console.log(result)
    if (result) {
        if(!fs.existsSync('./dist/tmp'))
            fs.mkdirSync('./dist/tmp')
        fs.writeFileSync(`./dist/tmp/${id}-credentials.json`, result[4], 'utf8')
        fs.writeFileSync(`./dist/tmp/${id}-sheetid.txt`, result[5], 'utf8')
        //next(bind)
    }
    var strQ = strQFn(req.query)
    return res.redirect(`/${res.controller}/bind/${id}?${strQ}`)
}
function strQFn(query){
    var strQ = ''
    for(var e in query)
        strQ +=`${e}=${query[e]}&`
    strQ = strQ.slice(0,strQ.length-1)
    return strQ
}
async function bind(req, res, next) {
    var id = projectID = req.params[0]
    //Sheet1%27&cellColum=%27A%27&cellRow=%271%27&cellValue=%27toi%27%27
    //return res.send(strQ)
    var { SheetName, Column, RowNumber, CelValue, Type } = req.query
    var strQ = strQFn(req.query)
    if (!fs.existsSync(`./dist/tmp/${id}-sheetid.txt`))
        return res.redirect(`/${res.controller}/prebind/${id}?${strQ}`)
    try {
        const auth = await authorize(id);
        const spreadsheetId = fs.readFileSync(`./dist/tmp/${id}-sheetid.txt`, 'utf8')
        const googleSheets = google.sheets({ version: "v4", auth: auth });
        let response
        let request = {
            auth,
            spreadsheetId,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[CelValue]],
            }
        };
        if(!Type||Type=='add'){
            request.range =  `${SheetName}!${Column}${RowNumber}`
            response = (await googleSheets.spreadsheets.values.append(request)).data;           
        }
        if(Type=='update'){
            request.range =  `${SheetName}!${Column}${RowNumber}`
            response = (await googleSheets.spreadsheets.values.update(request)).data;           
        }
        if(Type=='Insert'){
        }
        if(Type=='Delete'){
            const requestSheet = {
                spreadsheetId: spreadsheetId,
                //sheets:`${SheetName}!`,
                ranges: [`${SheetName}!${Column}${RowNumber}`], 
                includeGridData: false,
                auth: auth,
              };

            const responseSheet = (await googleSheets.spreadsheets.get(requestSheet)).data;
            // TODO: Change code below to process the `response` object:
            //console.log(JSON.stringify(responseSheet, null, 2));
            console.log(responseSheet.sheets[0].properties.sheetId);
            console.log(parseInt(RowNumber));
            RowNumber = parseInt(RowNumber)-1
            const resource = {
                "requests": [
                  {
                    "deleteDimension": {
                      "range": {
                        "sheetId": responseSheet.sheets[0].properties.sheetId,
                        "dimension": "ROWS",
                        "startIndex": RowNumber,//parseInt(RowNumber),
                        "endIndex": RowNumber+1
                      }
                    }
                  }
                ]
              }
              
            response = (await googleSheets.spreadsheets.batchUpdate({
                auth,
                spreadsheetId,
                resource: resource
            })).data;   
        }
        if(Type=='Clear'){
            request.range =  `${SheetName}!${Column}${RowNumber}`
            request.resource={}
            request.valueInputOption = undefined
            response = (await googleSheets.spreadsheets.values.clear(request)).data;           
        }
        console.log(JSON.stringify(response, null, 2)); 
    } catch (e) {
        console.error(e)
        return res.send(`{"error":"${e}"}`)
    }
    return res.send(`{"message":"create"}`)
}
exports.bind = bind
async function authorize(id) {
    const auth = new google.auth.GoogleAuth({
        keyFile: `./dist/tmp/${id}-credentials.json`,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const authClient = await auth.getClient();  
    if (authClient == null) {
      throw Error('authentication failed');
    }
  
    return authClient;
  }
