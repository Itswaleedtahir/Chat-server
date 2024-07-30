var mongoose = require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
var Schema = mongoose.Schema;
var admin = new Schema({
    "password": String,
    "fullName": String,
    "email": {
        type: String,
        required: true
    },
    "resetPasswordOtp": String,
    "profilepic": String,
    "isSuperAdmin": Boolean
});
admin.plugin(softDeletePlugin)
module.exports = mongoose.model('admins', admin);