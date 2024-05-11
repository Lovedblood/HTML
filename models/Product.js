const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    ProductID: { type: String, required: true },
    Price: { type: Number, required: true },
    Name: { type: String, required: true }, 
    Description: { type: String }, 
    Quantity: { type: Number, required: true }, 
});

module.exports = mongoose.model('Product', ProductSchema);
