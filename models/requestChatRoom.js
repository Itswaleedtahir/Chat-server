const mongoose = require("mongoose");

const message = require("./Message").schema;
let Schema = mongoose.Schema;

const requestChatroomSchema = new Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      required: "Chatroom is required!",
      ref: "users",
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      required: "Chatroom is required!",

      ref: "users",
    },
    requestId:String,
    createdAt: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    chat: [message],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("requestChatroom", requestChatroomSchema);
