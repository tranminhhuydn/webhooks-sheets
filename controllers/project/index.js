const console = require("console");
const fs = require("fs");
const { google } = require("googleapis");
async function getSheetId (req, res) {
    var id = projectID = req.params[0]

    const {auth, spreadsheetId, dbObject } = req.sysApi
    //read
    const getRows = await dbObject.get({
        auth,
        spreadsheetId,
        range: "project!A:F",
    });
    const {values} = getRows.data
    var iget =   values.find((e,i)=>{return e[0]==id})
    //console.log(iget)
    return iget
};
exports.before = async function(req, res,next) {
    next()
}
exports.join = async function(req, res) {
    var id=projectID = req.params[0]
    var token = req.cookies['session-token']
    const { googleSheets, auth, spreadsheetId, dbObject } = req.sysApi
    //read
    const getRows = await dbObject.get({
        auth,
        spreadsheetId,
        range: "member!A:C",
    });
    //find
    const { values } = getRows.data
    const result = values.find((e, i) => {
        if (e[1] == token.email) return e
    })
    //write
    if (!result) {
        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: "member!A:C",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[id,token.email,'open']],
            },
        });
        req.flash('success', req.t('You are join this project'))
        return res.redirect("/"+res.controller+"/members/"+id)
    }
    req.flash('denger', req.t('You are realy join this project'))
    return res.redirect("/"+res.controller+"/members/"+id)
};
exports.members = async function(req, res) {
    var id=projectID = req.params[0]

    const {auth, spreadsheetId, dbObject } = req.sysApi

    //read project 
    const getProjectRows = await dbObject.get({
        auth,
        spreadsheetId,
        range: "project!A:F",
    });
    var {values} = getProjectRows.data
    var project =   values.find((e,i)=>{return e[0]==id})
    console.log(project)

    const getRows = await dbObject.get({
        auth,
        spreadsheetId,
        range: "member!A:C",
    });
    
    //filter
    var { values } = getRows.data
    const result = values.filter((e, i) => {
        if (e[0] == id) return e
    })
    console.log(result)
    res.render('members',{data:result,project:project})
};
exports.index = async function(req, res) {

    const {auth, spreadsheetId, dbObject } = req.sysApi
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
        clientemail = process.env.CLIENT_EMAIL
        res.render('add')
    }
}
function strQFn(query){
    var strQ = ''
    for(var e in query)
        strQ +=`${e}=${query[e]}&`
    strQ = strQ.slice(0,strQ.length-1)
    return strQ
}
exports.bind = async function (req, res, next) {
    var id = projectID = req.params[0]
    //Sheet1%27&cellColum=%27A%27&cellRow=%271%27&cellValue=%27toi%27%27
    //return res.send(strQ)
    var data = await getSheetId(req, res)
    console.log(data)
    var { SheetName, Column, RowNumber, CelValue, Type } = req.query
    var strQ = strQFn(req.query)
    //data
    try {
        const auth = await authorize(id);
        //const spreadsheetId = fs.readFileSync(`./dist/tmp/${id}-sheetid.txt`, 'utf8')
        const spreadsheetId = data[5]
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
        if (Type == 'Paste'||Type=='Clear') {
            //console.log(`${SheetName}!${Column}:${RowNumber}`)
            //console.log(JSON.parse(CelValue))
            request = {
                auth,
                spreadsheetId,
                valueInputOption: "USER_ENTERED",
                range: `${SheetName}!${Column}:${RowNumber}`,//'public!A186:C191',
                resource: {
                    values: JSON.parse(CelValue)
                    
                },
            }
            response = (await googleSheets.spreadsheets.values.update(request)).data;
        }
        if(Type=='Insert'){
        }
        if(Type=='Delete'){
            var { startIndex,endIndex } = req.query
            const requestSheet = {
                spreadsheetId: spreadsheetId,
                ranges:  [`${SheetName}!${Column}${RowNumber}`], 
                includeGridData: false,
                auth: auth,
              };

            const responseSheet = (await googleSheets.spreadsheets.get(requestSheet)).data;
            // TODO: Change code below to process the `response` object:
            //console.log(JSON.stringify(responseSheet, null, 2));
            // console.log(responseSheet.sheets[0].properties.sheetId);
            // console.log(parseInt(RowNumber));
            RowNumber = parseInt(RowNumber)-1
            const resource = {
                "requests": [
                  {
                    "deleteDimension": {
                      "range": {
                        "sheetId": responseSheet.sheets[0].properties.sheetId,
                        "dimension": "ROWS",
                        "startIndex": parseInt(startIndex)-1 ,//RowNumber,//parseInt(RowNumber),
                        "endIndex": endIndex //RowNumber+1
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
        // if(Type=='Clear'){
        //     request.range =  `${SheetName}!${Column}${RowNumber}`
        //     request.resource={}
        //     request.valueInputOption = undefined
        //     response = (await googleSheets.spreadsheets.values.clear(request)).data;           
        // }
        console.log(JSON.stringify(response, null, 2)); 
    } catch (e) {
        console.error(e)
        return res.send(`{"error":"${e}"}`)
    }
    return res.send(`{"message":"create"}`)
}

async function authorize(id) {
    const auth = new google.auth.GoogleAuth({
        keyFile: "./dist/credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const authClient = await auth.getClient();  
    if (authClient == null) {
      throw Error('authentication failed');
    }
  
    return authClient;

}

