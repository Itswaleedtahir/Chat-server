const mongoose = require("mongoose");

let Schema = mongoose.Schema;
let notificationSchema = new Schema({
  project_id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  sor_id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  organization_id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  message: {
    type: String,
  },
  status: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "users",
  },
  date: {
    type: Date
  }
});

let notification = mongoose.model("notification", notificationSchema);

module.exports = notification;
