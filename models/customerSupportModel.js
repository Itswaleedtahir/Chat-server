var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var customersupport = new Schema({
    "customerSupportTitle":{
        type: String,
        required: true
       },
    "customerSupportDescription":{
        type: String,
        required: true},
    "customerSupportBy":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "customerSupportStatus":{
        type: String,
        default:"Pending"
    },
    "customerSupportAdminAnswer":String,
    "isChatInitiated":{
        type:Boolean,
        default:false
    },
    
},{
    timestamps:true
});
module.exports = mongoose.model('customersupports', customersupport);