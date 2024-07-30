const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const privacySetting = new Schema({
    "lastSeen": {
        type: String,
        required: true,
        enum: ['nobody', 'mycontacts', 'everybody'],
        default: "mycontacts"
    },
    "profilePic": {
        type: String,
        required: true,
        enum: ['nobody', 'mycontacts', 'everybody'],
        default: "mycontacts"
    },
    "about": {
        type: String,
        required: true,
        enum: ['nobody', 'mycontacts', 'everybody'],
        default: "mycontacts"
    },
    "status": {
        type: String,
        required: true,
        enum: ['nobody', 'mycontacts', 'everybody'],
        default: "mycontacts"
    },
    "readReceipts": {
        type: Boolean,
        required: true,
        default: true
    },
    "advertisementsOptOut": {
        type: Boolean,
        required: true,
        default: true
    },
    "userId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});
module.exports = mongoose.model('privacysettings', privacySetting);