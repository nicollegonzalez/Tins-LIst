const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const userSchema = new Schema ({
  
  username: {type: String, unique: true},
  password: {type: String},
  googleID: String,
  email: String,
  image: String,
  activeListings: Array,
  leftListings: Array,
  rigthListings: Array

})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
