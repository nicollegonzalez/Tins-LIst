const mongoose = require('mongoose');
const Schema   = mongoose.Schema;



const listingSchema = new Schema({
      title: String,
      image: String,
      description: String,
      price: String,
      author: {type: Schema.Types.ObjectId, ref: 'User'}
})



const ListingModel = mongoose.model('Listing', listingSchema);


module.exports = ListingModel;