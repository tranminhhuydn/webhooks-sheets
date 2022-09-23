const console = require("console");
const fs = require("fs");
const bcrypt = require('bcrypt');

const {Project} = require('../../models/project');
const {Sheets} = require('../../models/sheets');
const {Member} = require('../../models/member');
const {authorize} = require('../../config/database');


exports.before = async function(req, res,next) {
    next()
}
exports.join = async function(req, res) {
    var id = req.params[0]
    var token = req.cookies['session-token']
    const values = await Member.get()
    const result = values.find((e, i) => {
        if (e[1] == token.email) return e
    })
    //write
    if (!result) {
        const salt = await bcrypt.genSalt(10)
        const plainText = Math.random()+"appsecret"
        const secret = await bcrypt.hash(plainText,salt)
        await Member.add({values:[[id,token.email,'open','',secret]]})

        var data = await Project.get()
        data = data.find((e,i)=>{return e[0]==id})
        const spreadsheetId = data[5]
        await Sheets.add(spreadsheetId,token.email)

        //create maximum row
        const response = await Sheets.get(spreadsheetId,token.email)
        const sheetId = response.sheets[0].properties.sheetId
        const rowCount = response.sheets[0].properties.gridProperties.rowCount
        //max row in excell 1048576
        if(response){
            var resource = {
                "requests": [
                    {
                        "insertDimension": 
                        {
                            "range": {
                                "sheetId": sheetId,
                                "dimension": "ROWS",
                                "startIndex": rowCount-1,
                                "endIndex": rowCount+49000
                            }
                            ,"inheritFromBefore": false
                        }
                    }
                ]
            }
            await Sheets.batchUpdate(spreadsheetId,resource)
            //return res.send(JSON.stringify({message:"sheet "+token.email+" insertDimension"}))
        }

        req.flash('success', req.t('You are join this project'))
        return res.redirect("/member/members/"+id)
    }
    req.flash('danger', req.t('You are realy join this project'))
    return res.redirect("/member/members/"+id)
};
exports.index = async function(req, res) {
    const values = await Project.get() 
    //res.locals.layout = 'layout.ejs'
    //res.locals.isHome = true;
    res.locals.isSliderCenter = true
    res.render('index',{data:values})
};
exports.add = async function(req, res) {

    if(req.method=='POST'){
        const {name,credentialsjson,sheetid} = req.body
        const values = await Project.get()
        const result = values.find((e,i)=>{
            if(e[1]==name) return e
        })
        //write
        if(!result){
            await Project.add({values:[[values.length,name,req.cookies['session-token'].email,'open',credentialsjson,sheetid]]})
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
    var data = await Project.get()
    data = data.find((e,i)=>{return e[0]==id})

    console.log(data)
    var { SheetName, Column, RowNumber, CelValue, Type, now } = req.query

    var {authemail,authsecret} = req.query
    if(!authemail||!authemail){
        res.status(403)  
        return res.send(JSON.stringify({error:"no value"}))
    }
    //check auth email and secret
    var values = await Member.get()
    var rowIndex = -1
    let ok = values.find((e,i)=>{rowIndex = i;return e[1]==authemail && e[4]==authsecret})
    if(!ok){
        res.status(403)  
        return res.send(JSON.stringify({error:"authemail or authsecret not truth"}))
    }

    // member update lastupdate index = 3
    if(rowIndex!=-1){
        await Member.update("D"+(rowIndex+1),[now+""])
    }

    var strQ = strQFn(req.query)
    //data
    try {
        const { auth, spreadsheets} = await authorize();
        //const spreadsheetId = fs.readFileSync(`./dist/tmp/${id}-sheetid.txt`, 'utf8')
        const spreadsheetId = data[5]
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
            response = (await spreadsheets.values.append(request)).data;           
        }
        if(Type=='update'){
            request.range =  `${SheetName}!${Column}${RowNumber}`
            response = (await spreadsheets.values.update(request)).data;           
        }
        if (Type == 'Paste') {
            request = {
                auth,
                spreadsheetId,
                valueInputOption: "USER_ENTERED",
                range: `${SheetName}!${Column}:${RowNumber}`,//'public!A186:C191',
                resource: {
                    values: JSON.parse(CelValue)
                },
            }
            response = (await spreadsheets.values.update(request)).data;
        }
        if (Type=='Clear') {
            request = {
                auth,
                spreadsheetId,
                valueInputOption: "USER_ENTERED",
                range: `${SheetName}!${Column}:${RowNumber}`,//'public!A186:C191',
                resource: {
                    values: JSON.parse(CelValue),//JSON.parse(CelValue)
                },
            }
            response = (await spreadsheets.values.update(request)).data;
            return res.send(`{"message":"Clear"}`)
        }
        if(Type=='Insert'){
            var { startIndex,endIndex } = req.query
            const requestSheet = {
                spreadsheetId: spreadsheetId,
                ranges:  [`${SheetName}`], 
                includeGridData: false,
                auth: auth,
              };

            const responseSheet = (await spreadsheets.get(requestSheet)).data;
            const sheetId = responseSheet.sheets[0].properties.sheetId
            var resource = {
                "requests": [
                    {
                        "insertDimension": 
                        {
                            "range": {
                                "sheetId": sheetId,
                                "dimension": "ROWS",
                                "startIndex": parseInt(startIndex)-1,
                                "endIndex": parseInt(endIndex)
                            }
                            ,"inheritFromBefore": false
                        }
                    }
                ]
            }
            await Sheets.batchUpdate(spreadsheetId,resource)
            return res.send(`{"message":"Insert"}`)
        }
        if(Type=='DeleteRow'){
            var { startIndex,endIndex } = req.query
            const requestSheet = {
                spreadsheetId: spreadsheetId,
                ranges:  [`${SheetName}`], 
                includeGridData: false,
                auth: auth,
              };

            const responseSheet = (await spreadsheets.get(requestSheet)).data;
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
              
            response = (await spreadsheets.batchUpdate({
                auth,
                spreadsheetId,
                resource: resource
            })).data;  
            return res.send(`{"message":"DeleteRow"}`)
        }
        if(Type=='DeleteColumn'){
            var { startIndex,endIndex } = req.query
            const requestSheet = {
                spreadsheetId: spreadsheetId,
                ranges:  [`${SheetName}`], 
                includeGridData: false,
                auth: auth,
              };

            const responseSheet = (await spreadsheets.get(requestSheet)).data;
            const sheetId = responseSheet.sheets[0].properties.sheetId
            const resource = {
                "requests": [
                  {
                    "deleteDimension": {
                      "range": {
                        "sheetId": sheetId,
                        "dimension": "COLUMNS",
                        "startIndex": parseInt(startIndex),
                        "endIndex": parseInt(endIndex)
                      }
                    }
                  }
                ]
              }
              
            response = (await spreadsheets.batchUpdate({
                auth,
                spreadsheetId,
                resource: resource
            })).data;  
            return res.send(`{"message":"DeleteColumn"}`)
        }
        console.log(JSON.stringify(response, null, 2)); 
    } catch (e) {
        console.log('-------------------')
        console.error(e.code)
        console.error(e)
        return res.send(`{"error":"${e}"}`)
    }
    return res.send(`{"message":"create"}`)
}
