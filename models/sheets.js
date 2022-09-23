const { google } = require("googleapis");
const { authorize } = require('../config/database');

const range = "project!A:F"

module.exports.Sheets = {
    add: async function (spreadsheetId, name) {
        try {
            const { auth, spreadsheets } = await authorize();

            await spreadsheets.batchUpdate({
                auth,
                spreadsheetId,
                requestBody: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: name,
                            }
                        }
                    }]
                }
            })
            return true
        } catch (e) { 

        }
        return false
    },
    get: async function (spreadsheetId, name) {
        const { auth, spreadsheets } = await authorize()
        try {
            const requestSheet = {
                auth,
                spreadsheetId,
                ranges: [name],
                includeGridData: false,
            };
            return (await spreadsheets.get(requestSheet)).data;
        } catch (e) {
            //console.log(e)
        }
        return false
    },
    valuesGet: async function (spreadsheetId, range) {
      const { auth, spreadsheets } = await authorize()
      
      const getRows = await spreadsheets.values.get({
        auth,
        spreadsheetId: spreadsheetId,
        range: range,
      });
      return getRows.data.values
    },
    delete: function () {

    },
    update: function () {

    },
    batchUpdate: async function (spreadsheetId, resource){
        try {
            const { auth, spreadsheets } = await authorize();
            return await spreadsheets.batchUpdate({
                auth,
                spreadsheetId,
                resource: resource
            })
        } catch (e) { 
            console.log(e)
        }
        return false
    }
}

/*
The Sheets API allows you to insert, remove, and manipulate rows and columns in sheets. 
[API Trang tính cho phép bạn chèn, xóa và thao tác các hàng và cột trong trang tính.] 
The examples on this page illustrate how some common row and column operations can be achieved with the API. 
[Các ví dụ trên trang này minh họa cách một số thao tác hàng và cột phổ biến có thể đạt được với API.]
In these examples, the placeholders spreadsheetId and sheetId are used to indicate where you would provide those IDs. 
[Trong các ví dụ này, các bảng tính chỗ dành sẵn và sheetId được sử dụng để chỉ ra nơi bạn sẽ cung cấp các ID đó.] 
The spreadsheet ID can be discovered from the spreadsheet URL; the sheet ID can be obtained from the spreadsheet.get method. 
[ID bảng tính có thể được tìm thấy từ URL của bảng tính; ID trang tính có thể được lấy từ phương thức Spreadheet.get.]
Adjust column width or row height 
[Điều chỉnh chiều rộng cột hoặc chiều cao hàng] 
The following spreadsheets.batchUpdate request updates the width of column A to 160 pixels. 
[Yêu cầu sau Spreadheets.batchUpdate cập nhật chiều rộng của cột A lên 160 pixel.] 
A second request updates the row height of the first three rows to be 40 pixels. 
[Yêu cầu thứ hai cập nhật chiều cao hàng của ba hàng đầu tiên là 40 pixel.]
The request protocol is shown below. [Giao thức yêu cầu được hiển thị bên dưới.] 
The Updating Spreadsheets guide shows how to implement a batch update in different languages using the Google API client libraries. 
[Hướng dẫn Cập nhật Bảng tính cho biết cách triển khai cập nhật hàng loạt bằng các ngôn ngữ khác nhau bằng cách sử dụng các thư viện ứng dụng API của Google.]

POST https://sheets.googleapis.com/v4/spreadsheets/spreadsheetId:batchUpdate

{
  "requests": [
    {
      "updateDimensionProperties": {
        "range": {
          "sheetId": sheetId,
          "dimension": "COLUMNS",
          "startIndex": 0,
          "endIndex": 1
        },
        "properties": {
          "pixelSize": 160
        },
        "fields": "pixelSize"
      }
    },
    {
      "updateDimensionProperties": {
        "range": {
          "sheetId": sheetId,
          "dimension": "ROWS",
          "startIndex": 0,
          "endIndex": 3
        },
        "properties": {
          "pixelSize": 40
        },
        "fields": "pixelSize"
      }
    }
  ]
}
Append empty rows or columns [Nối các hàng hoặc cột trống] 
The following spreadsheets.batchUpdate request appends rows and columns. [Yêu cầu sau Spreadheets.batchUpdate thêm các hàng và cột.] The first request appends three empty rows to the end of the sheet, while the second appends a single empty column. [Yêu cầu đầu tiên nối ba hàng trống vào cuối trang tính, trong khi yêu cầu thứ hai nối một cột trống duy nhất.]
The request protocol is shown below. [Giao thức yêu cầu được hiển thị bên dưới.] The Updating Spreadsheets guide shows how to implement a batch update in different languages using the Google API client libraries. [Hướng dẫn Cập nhật Bảng tính cho biết cách triển khai cập nhật hàng loạt bằng các ngôn ngữ khác nhau bằng cách sử dụng các thư viện ứng dụng API của Google.]

POST https://sheets.googleapis.com/v4/spreadsheets/spreadsheetId:batchUpdate

{
  "requests": [
    {
      "appendDimension": {
        "sheetId": sheetId,
        "dimension": "ROWS",
        "length": 3
      }
    },
    {
      "appendDimension": {
        "sheetId": sheetId,
        "dimension": "COLUMNS",
        "length": 1
      }
    }
  ]
}
Automatically resize a column [Tự động thay đổi kích thước cột] 
The following spreadsheets.batchUpdate request will resize columns A through C, based on the size of the column content. [Yêu cầu sau đây Spreadheets.batchUpdate sẽ thay đổi kích thước các cột từ A đến C, dựa trên kích thước của nội dung cột.]
The request protocol is shown below. [Giao thức yêu cầu được hiển thị bên dưới.] The Updating Spreadsheets guide shows how to implement a batch update in different languages using the Google API client libraries. [Hướng dẫn Cập nhật Bảng tính cho biết cách triển khai cập nhật hàng loạt bằng các ngôn ngữ khác nhau bằng cách sử dụng các thư viện ứng dụng API của Google.]

POST https://sheets.googleapis.com/v4/spreadsheets/spreadsheetId:batchUpdate

{
  "requests": [
    {
      "autoResizeDimensions": {
        "dimensions": {
          "sheetId": sheetId,
          "dimension": "COLUMNS",
          "startIndex": 0,
          "endIndex": 3
        }
      }
    }
  ]
}
Automatically resize a row [Tự động thay đổi kích thước một hàng] 
The following spreadsheets.batchUpdate request will clear the row heights of the first three rows. [Yêu cầu sau Spreadheets.batchUpdate sẽ xóa chiều cao hàng của ba hàng đầu tiên.] The row heights will then each grow dynamically based on the content of the cells in each row. [Sau đó, độ cao của mỗi hàng sẽ tự động tăng lên dựa trên nội dung của các ô trong mỗi hàng.]
The request protocol is shown below. [Giao thức yêu cầu được hiển thị bên dưới.] The Updating Spreadsheets guide shows how to implement a batch update in different languages using the Google API client libraries. [Hướng dẫn Cập nhật Bảng tính cho biết cách triển khai cập nhật hàng loạt bằng các ngôn ngữ khác nhau bằng cách sử dụng các thư viện ứng dụng API của Google.]

POST https://sheets.googleapis.com/v4/spreadsheets/spreadsheetId:batchUpdate

{
  "requests": [
    {
      "autoResizeDimensions": {
        "dimensions": {
          "sheetId": sheetId,
          "dimension": "ROWS",
          "startIndex": 0,
          "endIndex": 3
        }
      }
    }
  ]
}
Delete rows or columns [Xóa hàng hoặc cột] 
The following spreadsheets.batchUpdate request deletes the first three rows in the sheet. 
[Yêu cầu sau đây Spreadheets.batchUpdate xóa ba hàng đầu tiên trong trang tính.] 
A second request deletes columns B:D. 
[Yêu cầu thứ hai xóa các cột B: D.]
The request protocol is shown below. 
[Giao thức yêu cầu được hiển thị bên dưới.] 
The Updating Spreadsheets guide shows how to implement a batch update in different languages using the Google API client libraries. 
[Hướng dẫn Cập nhật Bảng tính cho biết cách triển khai cập nhật hàng loạt bằng các ngôn ngữ khác nhau bằng cách sử dụng các thư viện ứng dụng API của Google.]

POST https://sheets.googleapis.com/v4/spreadsheets/spreadsheetId:batchUpdate

{
  "requests": [
    {
      "deleteDimension": {
        "range": {
          "sheetId": sheetId,
          "dimension": "ROWS",
          "startIndex": 0,
          "endIndex": 3
        }
      }
    },
    {
      "deleteDimension": {
        "range": {
          "sheetId": sheetId,
          "dimension": "COLUMNS",
          "startIndex": 1,
          "endIndex": 4
        }
      }
    },
  ],
}
Insert an empty row or column [Chèn một hàng hoặc cột trống] 
The following spreadsheets.batchUpdate request inserts two blank columns at column C. [Yêu cầu sau đây Spreadheets.batchUpdate chèn hai cột trống tại cột C.] A second request inserts three empty rows at row 1. [Yêu cầu thứ hai chèn ba hàng trống ở hàng 1.] The inheritFromBefore field, if true, tells the API to give the new columns or rows the same properties as the prior row or column; otherwise the new columns or rows acquire the properties of those that follow them. inheritFromBefore cannot be true if inserting a row at row 1 or a column at column A. [Trường inheritFromBefore, nếu đúng, yêu cầu API cung cấp cho các cột hoặc hàng mới các thuộc tính giống như hàng hoặc cột trước đó; nếu không thì các cột hoặc hàng mới có thuộc tính của những cột hoặc hàng theo sau chúng. inheritFromBefore không thể đúng nếu chèn một hàng ở hàng 1 hoặc một cột ở cột A.]
The request protocol is shown below. [Giao thức yêu cầu được hiển thị bên dưới.] The Updating Spreadsheets guide shows how to implement a batch update in different languages using the Google API client libraries. [Hướng dẫn Cập nhật Bảng tính cho biết cách triển khai cập nhật hàng loạt bằng các ngôn ngữ khác nhau bằng cách sử dụng các thư viện ứng dụng API của Google.]

POST https://sheets.googleapis.com/v4/spreadsheets/spreadsheetId:batchUpdate

{
  "requests": [
    {
      "insertDimension": {
        "range": {
          "sheetId": sheetId,
          "dimension": "COLUMNS",
          "startIndex": 2,
          "endIndex": 4
        },
        "inheritFromBefore": true
      }
    },
    {
      "insertDimension": {
        "range": {
          "sheetId": sheetId,
          "dimension": "ROWS",
          "startIndex": 0,
          "endIndex": 3
        },
        "inheritFromBefore": false
      }
    },
  ],
}
Move a row or column [Di chuyển một hàng hoặc cột] 
The following spreadsheets.batchUpdate request moves column A to the column D position. [Yêu cầu sau đây spreadheets.batchUpdate di chuyển cột A sang vị trí cột D.] A second request moves rows 5 through 10 to the row 20 position. [Yêu cầu thứ hai di chuyển từ hàng 5 đến hàng 10 đến vị trí hàng 20.]
The request protocol is shown below. [Giao thức yêu cầu được hiển thị bên dưới.] The Updating Spreadsheets guide shows how to implement a batch update in different languages using the Google API client libraries. [Hướng dẫn Cập nhật Bảng tính cho biết cách triển khai cập nhật hàng loạt bằng các ngôn ngữ khác nhau bằng cách sử dụng các thư viện ứng dụng API của Google.]

POST https://sheets.googleapis.com/v4/spreadsheets/spreadsheetId:batchUpdate

{
  "requests": [
    {
      "moveDimension": {
        "source": {
          "sheetId": sheetId,
          "dimension": "COLUMNS",
          "startIndex": 0,
          "endIndex": 1
        },
        "destinationIndex": 3
      }
    },
    {
      "moveDimension": {
        "source": {
          "sheetId": sheetId,
          "dimension": "ROWS",
          "startIndex": 4,
          "endIndex": 10
        },
        "destinationIndex": 19
      }
    },
  ],
}
*/