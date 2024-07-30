const mongoose = require("mongoose");

const message = require("./SupportMessage").schema;
let Schema = mongoose.Schema;

const supportChatroomSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: "Chatroom is required!",
      ref: "users",
    },
    admin: {
      type:String,
      default:"Admin"
    },
    supportId:{
      type: mongoose.Schema.Types.ObjectId,
      required: "Chatroom is required!",
      ref: "customersupports",
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    isClosed:Boolean,
    chat: [message],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("supportChatroom", supportChatroomSchema);
