const mongoose = require('mongoose');
const objSchema = mongoose.Schema({
    locale:{
        type: String,
        required: true
    },
    model:{
        type: String,
        required: true
    },
    foreignKey:{
        type: String,
        required: true
    },
    field:{
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    createAt:{
        type:Date,
        immutable:true,
        default:()=> Date.now()
    },
    updateAt:{
        type:Date,
        default:()=> Date.now()
    },
    author: {
        type: String,
        required: true
    }
});

const I18n = mongoose.model('I18n', objSchema);

module.exports.I18n = I18n;
