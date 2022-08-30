const mongoose = require('mongoose');
//
const objSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    native:{
        type: String,
        required: true
    },
    alias:{
        type: String,
        required: true
    },
    locale:{
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    weight: {
        type: Number
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

const Language = mongoose.model('Language', objSchema);

module.exports.Language = Language;
