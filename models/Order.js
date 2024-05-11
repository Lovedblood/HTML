const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    OrderID: { type: String, required: true, unique: true },
    CustomerID: { type: String, required: true },
    Products: [
        {
            _id: { type: String, required: true },
            Price: { type: Number, required: true },
        }
    ],
    OrderDate: { type: Date, required: true },
    TotalPrice: { type: Number, required: true },
});

module.exports = mongoose.model('Order', OrderSchema);
