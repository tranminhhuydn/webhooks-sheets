// const mongoose = require('mongoose');

// // User Schema
// const UserSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   username: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   dateforget:{
//     type:Date,
//     default:()=> Date.now()
//   },
//   forgetpass:{
//     type: String,
//   },
//   role:{
//     type: String,
//     required: true
//   }
// });

// const User = mongoose.model('User', UserSchema);
// module.exports.User = User;

const ROLE = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  POSTER: 'poster',
  BASIC: 'basic',
  BLOCK: 'block'
}
module.exports.ROLE = ROLE;