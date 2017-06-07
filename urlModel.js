mongoose = require('mongoose');

let urlPrototype = mongoose.Schema({
  number : Number,
  path: String
})

let urlModel = mongoose.model('url',urlPrototype);

module.exports = urlModel;
