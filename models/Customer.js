const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const CustomerSchema = new mongoose.Schema({
    Address: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Name: { type: String, required: true },
    CustomerID: { type: String, required: true, unique: true },
    PhoneNumber: { type: String, required: true },
    Password: { type: String, required: true },
    Username: { type: String, required: true, unique: true },
    Birthdate: { type: Date, required: true },
});

CustomerSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('Password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.Password, salt);
        this.Password = hashedPassword;

        next();
    } catch (error) {
        next(error);
    }
});


CustomerSchema.statics.login = async function (Username, Password) {
    const customer = await this.findOne({ Username: Username });

    if (customer) {
        const auth = await bcrypt.compare(Password, customer.Password);
        if (auth) {
            return customer;
        }
        throw new Error('Incorrect Username or Password!');
    }
};

module.exports = mongoose.model('Customer', CustomerSchema);
