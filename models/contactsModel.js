const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const contact = new Schema({
    "phoneNo": {
        type: Number,
        required: true
    },
    "name": String,
    "userId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "contactUserId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});
module.exports = mongoose.model('contacts', contact);