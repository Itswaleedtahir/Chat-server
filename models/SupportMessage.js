const mongoose = require("mongoose");

let Schema = mongoose.Schema;

const supportmessageSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
   },
   admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admins'
   },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["text", "file"],
    default: "text",
  },
  deliveredAt: {
    type: Date,
  },
});

let message = mongoose.model("supportmessages", supportmessageSchema);
module.exports = message;
