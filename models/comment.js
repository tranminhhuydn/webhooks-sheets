const mongoose = require('mongoose');

const CommentSchema = new Schema();

CommentSchema.add({
  title: {
    type: String,
    index: true
  },
  body: String,
  date: {
    type:Date,
    immutable:true,
    default:()=> Date.now()
  },
  model:{
    type: String,
    required: true
  },
  modelId: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  comments: [CommentSchema]
});

const Comment = mongoose.model('Comment', CommentSchema);
module.exports.Comment = Comment;