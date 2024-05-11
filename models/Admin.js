const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
    Username: { type: String, required: true },
    AdminID: { type: String, required: true },
    Password: { type: String, required: true },
});

AdminSchema.pre('save', async function (next) {
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

AdminSchema.statics.login = async function (Username, Password) {
    const admin = await this.findOne({ Username: Username });

    if (admin) {
        const auth = await bcrypt.compare(Password, admin.Password);
        if (auth) {
            return admin;
        }
        throw new Error('Incorrect Username or Password!');
    }
};

module.exports = mongoose.model('Admin', AdminSchema);
