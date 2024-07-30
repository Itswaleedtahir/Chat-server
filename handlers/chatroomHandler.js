const mongoose = require("mongoose");
const { mongo } = require("mongoose");
const requestChatRoom = require("../models/requestChatRoom");
const supportChatroom = require("../models/supportChatroom");
const privateChatroom = mongoose.model("privateChatroom");
const chatroom = mongoose.model("Chatroom");
const Message = mongoose.model("Message");
async function createPrivateChat() {
  try {
    if (!req.body.email || !req.body.receiver || !req.body.organization)
      return res.status(500).json({
        message: "you maybe missing email receiver organization  ",
        code: "1000",
        success: false,
      });

    let newRoom = new privateChatroom({
      userA: req.body.email,
      userB: req.body.receiver,
      organization: req.body.organization,
      chat: [],
    });

    await newRoom.save();
    res.status(200).send({
      message: "privateChat created",
      code: 1000,
      success: true,
      roomid: newRoom._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}

async function savePrivateChat(user, receiver, message) {
  try {
    console.log("user,receiver,message ", user, receiver, message);
    if (!user || !receiver || !message)
      return res.status(500).json({
        message:
          "you maybe missing groupName organization creator or involved_person",
        code: "1000",
        success: false,
      });
    console.log("adding new messages", user, receiver, message);
    await chatroom
      .updateOne(
        {
          $or: [
            {
              userA: mongo.ObjectID(user),
              userB: mongo.ObjectID(receiver),
            },
            {
              userB: mongo.ObjectID(user),
              userA: mongo.ObjectID(receiver),
            },
          ],
        },
        {
          $push: {
            chat: message._id,
          },
        }
      )
      .then((data) => {
        console.log("data ", data);
        if (data.nModified > 0) {
          return true;
        } else {
          return true;
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: "message not sent",
          code: "1000",
          success: false,
        });
      });
  } catch (err) {
    console.log(err);
    return false;
  }
}
async function saveRequestChat(user, receiver, message, requestId) {
  try {
    console.log("user,receiver,requestId ", user, receiver, requestId);
    if (!user || !receiver || !message)
      return res.status(500).json({
        message:
          "you maybe missing groupName organization creator or involved_person",
        code: "1000",
        success: false,
      });
    console.log("adding new messages");
    console.log("requestId ", requestId);
    await requestChatRoom
      .updateOne(
        {
          userA: mongo.ObjectID(user),
          userB: mongo.ObjectID(receiver),
          requestId: requestId,
        },
        {
          $push: {
            chat: message,
          },
        }
      )
      .then((data) => {
        console.log("request chat data ", data);
        if (data.nModified > 0) {
          return true;
        } else {
          return true;
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: "message not sent",
          code: "1000",
          success: false,
        });
      });
    await requestChatRoom
      .updateOne(
        {
          userB: mongo.ObjectID(user),
          userA: mongo.ObjectID(receiver),
          requestId: requestId,
        },
        {
          $push: {
            chat: message,
          },
        }
      )
      .then((data) => {
        console.log("request chat data ", data);
        if (data.nModified > 0) {
          return true;
        } else {
          return true;
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: "message not sent",
          code: "1000",
          success: false,
        });
      });
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function saveGroupChat(chatroomId, message, user) {
  try {
    if (!user || !message || !chatroomId)
      return res.status(500).json({
        message: "you maybe missing user message chatroomId ",
        code: "1000",
        success: false,
      });

    await chatroom.update(
      { _id: chatroomId },
      {
        $push: {
          chat: message._id,
        },
      }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
async function saveSupportChat(user, supportId, message) {
  try {
    console.log("user,supportId,message ", user, supportId, message);
    if (!user || !supportId || !message)
      return res.status(500).json({
        message:
          "you maybe missing groupName organization creator or involved_person",
        code: "1000",
        success: false,
      });
    console.log("adding new messages");
    await supportChatroom
      .updateOne(
        {
          user: mongo.ObjectID(user),
          supportId: mongo.ObjectID(supportId),
        },
        {
          $push: {
            chat: message,
          },
        }
      )
      .then((data) => {
        if (data.nModified > 0) {
          return true;
        } else {
          return true;
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: "message not sent",
          code: "1000",
          success: false,
        });
      });
  } catch (err) {
    console.log(err);
    return false;
  }
}
module.exports.createPrivateChat = createPrivateChat;
module.exports.savePrivateChat = savePrivateChat;
module.exports.saveGroupChat = saveGroupChat;
module.exports.saveRequestChat = saveRequestChat;
module.exports.saveSupportChat = saveSupportChat;
