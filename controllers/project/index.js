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
//async function bind2(req, res, next) {
// exports.middleware={} 
// exports.middleware.bind = async function (req, res, next) {
//     return async function (req, res, next) {
//         var id = projectID = req.params[0]
//         var { sheetname, cellColum, cellRow, cellValue } = req.query
//         var clienDB

//         const { auth, spreadsheetId, dbObject } = req.sysApi
//         //read
//         const getRows = await dbObject.get({
//             auth,
//             spreadsheetId,
//             range: "project!A:F",
//         });
//         const { values } = getRows.data
//         clienDB = values
//         //res.cookie('clienDB', clienDB)


//         const result = clienDB.find((e, i) => {
//             if (e[0] == projectID) return e
//         })
//         // console.log('------------------------')
//         // console.log(result)
//         if (result) {
//             fs.writeFileSync(`./dist/tmp/${id}-credentials.json`, result[4], 'utf8')
//             fs.writeFileSync(`./dist/tmp/${id}-sheetid.txt`, result[5], 'utf8')
//         }
//         next()
//     }
// }
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
    var { SheetName, Column, RowNumber, CelValue } = req.query
    var strQ = strQFn(req.query)
    if(!fs.existsSync(`./dist/tmp/${id}-sheetid.txt`))
        return res.redirect(`/${res.controller}/prebind/${id}?${strQ}`)
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: `./dist/tmp/${id}-credentials.json`,
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        // Create client instance for auth
        const client = await auth.getClient();

        // Instance of Google Sheets API
        const googleSheets = google.sheets({ version: "v4", auth: client });

        const spreadsheetId = fs.readFileSync(`./dist/tmp/${id}-sheetid.txt`, 'utf8')
        console.log('---------------------------spreadsheetId')
        console.log(spreadsheetId)
        // Get metadata about spreadsheet
        const metaData = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId,
        });
        const dbObject = googleSheets.spreadsheets.values

        // await dbObject.append({
        //     auth,
        //     spreadsheetId,
        //     range: SheetName,
        //     valueInputOption: "USER_ENTERED",
        //     resource: {
        //         values: [[CelValue]],
        //     },
        // });
        await dbObject.update({
            auth,
            spreadsheetId,
            range: `${SheetName}!${Column}${RowNumber}`,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[CelValue]],
            },
        });
        
    } catch (e) {
        return res.send(`{"error":"${e}"}`)
    }
    return res.send(`{"message":"create"}`)
}
exports.bind = bind