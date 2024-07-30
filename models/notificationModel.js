var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var notification = new Schema({
    "message":{
        type: String,
        required: true
       },
    "type":{
        type: String,
        required: true},
    "id":String,
    "userId":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "requestId":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'requests'
    },
    "receiver":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "isFor":String
});
module.exports = mongoose.model('notifications', notification);