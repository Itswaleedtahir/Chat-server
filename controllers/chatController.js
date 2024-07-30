const { mongo } = require("mongoose");
const mongoose = require("../handlers/connectionHandler");
const chatroom = require("../models/Chatroom");
const privateChatroom = require("../models/privateChatroom");
const users = require("../models/User");
const organization = require("../models/organization");
const message = require("../models/Message");
const SupportMessage = require("../models/SupportMessage");
const arraysort = require("sort-object");
const { ObjectId } = require("mongodb");
const requestChatRoom = require("../models/requestChatRoom");
const privacySetting = require("../models/privacySetting");
const requestModel = require("../models/requestModel");
const supportChatroom = require("../models/supportChatroom");
const adminModel = require("../models/adminModel");
const customerSupportModel = require("../models/customerSupportModel");
const contactsModel = require("../models/contactsModel");
async function createPrivateChat(req, res, next) {
  try {
    console.log(req.body.receiverId);
    console.log(req.userId);
    if (!req.userId || !req.body.receiverId)
      return res.status(500).json({
        message: "you maybe missing receiver  ",
        code: "1000",
        success: false,
      });
    let data = await chatroom
      .findOne({
        $or: [
          {
            userA: mongo.ObjectID(req.userId),
            userB: mongo.ObjectID(req.body.receiverId),
          },
          {
            userB: mongo.ObjectID(req.userId),
            userA: mongo.ObjectID(req.body.receiverId),
          },
        ],
        roomType: "private",
      })
      // .then((data) => {
      //   if (data) {
      //     return res.status(200).json({
      //       success: false,
      //       code: 1110,
      //       message: "already exists",
      //       data: data,
      //     });
      //   }
      // })
      .catch((err) => {
        res.send(err);
      });
    if (data)
      return res.status(200).json({
        success: false,
        code: 1110,
        message: "already exists",
        data: data,
        roomid: data._id,
      });

    let newRoom = new chatroom({
      userA: req.userId,
      userB: req.body.receiverId,
      chat: [],
      roomType: "private",
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
async function createRequestPrivateChat(req, res, next) {
  try {
    if (!req.body.userId || !req.body.receiverId)
      return res.status(500).json({
        message: "you maybe missing email receiver  ",
        code: "1000",
        success: false,
      });
    let data = await requestChatRoom
      .findOne({
        $or: [
          {
            userA: mongo.ObjectID(req.body.userId),
            userB: mongo.ObjectID(req.body.receiverId),
          },
          {
            userB: mongo.ObjectID(req.body.userId),
            userA: mongo.ObjectID(req.body.receiverId),
          },
        ],
        requestId: req.body.requestId,
      })
      // .then((data) => {
      //   if (data) {
      //     return res.status(200).json({
      //       success: false,
      //       code: 1110,
      //       message: "already exists",
      //       data: data,
      //     });
      //   }
      // })
      .catch((err) => {
        res.send(err);
      });
    if (data)
      return res.status(200).json({
        success: false,
        code: 1110,
        message: "already exists",
        data: data,
      });
    const userId = await users.findOne({ _id: ObjectId(req.body.userId) });
    const receiverId = await users.findOne({
      _id: ObjectId(req.body.receiverId),
    });
    console.log("userId ", userId);
    console.log("receiverId ", receiverId);
    if (userId?.role) {
      let newRoom = new requestChatRoom({
        userA: req.body.receiverId,
        userB: req.body.userId,
        requestId: req.body.requestId,
        chat: [],
      });

      await newRoom.save();
      res.status(200).send({
        message: "requestprivateChat created",
        code: 1000,
        success: true,
        roomid: newRoom._id,
      });
    } else if (receiverId.role) {
      let newRoom = new requestChatRoom({
        userA: req.body.userId,
        userB: req.body.receiverId,
        requestId: req.body.requestId,
        chat: [],
      });

      await newRoom.save();
      res.status(200).send({
        message: "requestprivateChat created",
        code: 1000,
        success: true,
        roomid: newRoom._id,
      });
    } else {
      let newRoom = new requestChatRoom({
        userA: req.body.userId,
        userB: req.body.receiverId,
        requestId: req.body.requestId,
        chat: [],
      });

      await newRoom.save();
      res.status(200).send({
        message: "requestprivateChat created",
        code: 1000,
        success: true,
        roomid: newRoom._id,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function savePrivateChat(req, res, next) {
  try {
    //we should recieve senderId instead email. we should recieve receiverID instead of reciever email
    if (!req.body.userId || !req.body.receiverId || !req.body.message)
      return res.status(500).json({
        message: "you maybe missing sender reciever or message",
        code: "1000",
        success: false,
      });

    let newMessage = new message({
      user: req.body.userId,
      message: req.body.message,
    });
    //it should have OR condition for updateOne condition
    /*
    await privateChatroom.updateOne(
  {
    $or: [{
      userA: req.body.userId,
      userB: req.body.receiverId,
    }, //should be id1 
    {
      userA: req.body.receiverId,
      userB: req.body.userId,
    } //should be id2
    ]
  },
  {      
    $push: { comments: comment }
  }
).catch((err) => { console.log(err); });*/

    await privateChatroom
      .updateOne(
        {
          userA: req.body.userId,
          userB: req.body.receiverId,
        },
        {
          $push: {
            chat: newMessage,
          },
        }
      )
      .then((data) => {
        if (data.nModified > 0) {
          res.status(200).json({
            message: "message sent",
            chatMessage: newMessage,
            code: "1000",
            success: true,
          });
        } else {
          res.status(200).json({
            message: "message not sent",
            code: "1000",
            success: true,
          });
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
    res.status(500).json({
      message: "oops something went wrong",
      code: "1001",
      success: false,
    });
  }
}
async function getPrivateChat(req, res, next) {
  try {
    if (!req.userId || !req.query.receiverId)
      return res.status(500).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await chatroom
      .findOne({
        $or: [
          {
            userA: mongo.ObjectID(req.userId),
            userB: mongo.ObjectID(req.query.receiverId),
          },
          {
            userB: mongo.ObjectID(req.userId),
            userA: mongo.ObjectID(req.query.receiverId),
          },
        ],
        roomType: "private",
      })
      .populate("userA")
      .populate("userB")
      .populate("chat")
      .populate("chat.user")
      .then(async (data) => {
        if (!data || !data._id) {
          let userA = await users.findById({ _id: req.userId });
          let userB = await users.findById({ _id: req.query.receiverId });

          return res.status(200).json({
            chat: [],
            _id: "",
            initiated: false,
            userA,
            userB,
          });
        } else {
          console.log("data ", data);
          if (data?.userA?._id == req.userId) {
            // Overwriting system name with contact's name
            //   ifContact = await contactsModel.findOne({ userId: req.userId, phoneNo: data?.userB?.phoneNo });
            //   if (ifContact) {
            //     data.userB.name = ifContact?.name
            //   }
            // } else {
            //   // Overwriting system name with contact's name
            //   ifContact = await contactsModel.findOne({ userId: req.userId, phoneNo: data?.userA?.phoneNo });
            //   if (ifContact) {
            //     data.userA.name = ifContact?.name
            //   }
          }
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        res.send(err);
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
async function getRequestPrivateChat(req, res, next) {
  try {
    console.log("req.query ", req.query);
    if (!req.query.userId || !req.query.receiverId)
      return res.status(500).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await requestChatRoom
      .findOne({
        $or: [
          {
            userA: mongo.ObjectID(req.query.userId),
            userB: mongo.ObjectID(req.query.receiverId),
            requestId: req.query.requestId,
          },
          {
            userB: mongo.ObjectID(req.query.userId),
            userA: mongo.ObjectID(req.query.receiverId),
            requestId: req.query.requestId,
          },
        ],
      })
      .populate("userA")
      .populate("userB")
      .populate("chat.user")
      .then(async (data) => {
        if (!data || !data._id) {
          let userA = await users.findById({ _id: req.query.userId });
          let userB = await users.findById({ _id: req.query.receiverId });

          return res.status(200).json({
            chat: [],
            _id: "",
            initiated: false,
            userA,
            userB,
          });
        } else {
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        res.send(err);
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
async function getAllPrivateChat(req, res, next) {
  try {
    if (!req.userId)
      return res.status(500).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await chatroom
      .find({
        $or: [
          {
            userA: mongo.ObjectID(req.userId),
          },
          {
            userB: mongo.ObjectID(req.userId),
          },
        ],
        roomType: "private",
      })
      .populate("userA userB")
      .select("-chat")

      .then(async (data) => {
        const promises = data.map(async (element) => {
          if (element.userA._id == req.userId) {
            element.userA = element.userB;
            element.userB = null;
          }
          // Overwriting system name with contact's name
          ifContact = await contactsModel.findOne({
            userId: req.userId,
            phoneNo: element.userA.phoneNo,
          });
          if (ifContact) {
            element.userA.name = ifContact?.name;
          }
          return element;
        });

        // Wait for all promises to resolve
        const updatedData = await Promise.all(promises);

        // Now, `updatedData` contains the modified elements with user names

        console.log("sending response");
        return res.status(200).send({
          success: true,
          message: "Private chats found",
          privateChats: updatedData,
        });
      })
      .catch((err) => {
        res.send(err);
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
async function searchAllPrivateChat(req, res, next) {
  try {
    const { searchQuery } = req.params;
    if (!req.userId)
      return res.status(500).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });
    // const searchContacts = await contactsModel.find({
    //   userId: req.userId,
    //   $or: [
    //     {
    //       // Search the 'name' field with a case-insensitive regex
    //       name: { $regex: searchQuery, $options: "i" },
    //     },
    //   ],
    //   contactUserId: { $exists: true }
    // })
    //   .select('contactUserId')
    // console.log("searchContacts ", searchContacts)
    // const searchContactsIds = searchContacts.map(contact => contact.contactUserId);
    // console.log("searchContactsIds", searchContactsIds);
    await privateChatroom
      .find({
        $or: [
          {
            userA: mongo.ObjectID(req.userId),
            userB: { $in: searchContactsIds },
          },
          {
            userA: { $in: searchContactsIds },
            userB: mongo.ObjectID(req.userId),
          },
        ],
      })
      .populate("userA userB")
      .select("-chat")

      .then(async (data) => {
        const promises = data.map(async (element) => {
          if (element.userA._id == req.userId) {
            element.userA = element.userB;
            element.userB = null;
          }
          // Overwriting system name with contact's name
          // ifContact = await contactsModel.findOne({ userId: req.userId, phoneNo: element.userA.phoneNo });
          // if (ifContact) {
          //   element.userA.name = ifContact?.name
          // }
          return element;
        });

        // Wait for all promises to resolve
        const updatedData = await Promise.all(promises);

        // Now, `updatedData` contains the modified elements with user names

        console.log("sending response");
        return res.status(200).send({
          success: true,
          message: "Private chats found",
          privateChats: updatedData,
        });
      })
      .catch((err) => {
        res.send(err);
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
async function onReadChat(req, res, next) {
  try {
    const { requestId, userId } = req.body;
    const user = await users.findOne({ _id: ObjectId(userId) });
    console.log("user ", user);
    if (user.role) {
      await requestModel.updateOne(
        { _id: requestId },
        {
          $set: {
            isProviderRead: true,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: "Read Operation Performed",
      });
    } else {
      await requestModel.updateOne(
        { _id: requestId },
        {
          $set: {
            isCustomerRead: true,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: "Read Operation Performed",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function createSupportChat(req, res, next) {
  try {
    if (!req.body.userId || !req.body.supportId)
      return res.status(500).json({
        message: "you maybe missing email receiver  ",
        code: "1000",
        success: false,
      });
    let data = await supportChatroom
      .findOne({
        $or: [
          {
            user: mongo.ObjectID(req.body.userId),
            supportId: mongo.ObjectID(req.body.supportId),
          },
        ],
      })
      // .then((data) => {
      //   if (data) {
      //     return res.status(200).json({
      //       success: false,
      //       code: 1110,
      //       message: "already exists",
      //       data: data,
      //     });
      //   }
      // })
      .catch((err) => {
        res.send(err);
      });
    if (data)
      return res.status(200).json({
        success: false,
        code: 1110,
        message: "already exists",
        data: data,
      });
    const question = await customerSupportModel.findOne({
      _id: ObjectId(req.body.supportId),
    });
    const chatInitiated = await customerSupportModel.updateOne(
      { _id: req.body.supportId },
      {
        $set: {
          isChatInitiated: true,
        },
      }
    );
    var newMessage = new SupportMessage({
      user: question.customerSupportBy,
      message: question.customerSupportTitle,
    });
    var newMessage2 = new SupportMessage({
      user: question.customerSupportBy,
      message: question.customerSupportDescription,
    });
    let newRoom = new supportChatroom({
      user: req.body.userId,
      supportId: req.body.supportId,
      chat: [newMessage, newMessage2],
    });

    await newRoom.save();
    res.status(200).send({
      message: "supportChat created",
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
async function getSupportChat(req, res, next) {
  try {
    console.log("req.query", req.query);
    if (!req.query.userId || !req.query.supportId)
      return res.status(500).json({
        message: "you maybe missing userId or supportId ",
        code: "1000",
        success: false,
      });

    await supportChatroom
      .findOne({
        $or: [
          {
            user: mongo.ObjectID(req.query.userId),
            supportId: mongo.ObjectID(req.query.supportId),
          },
        ],
      })
      .populate("user")
      .populate("supportId")
      .populate("chat.user")
      .then(async (data) => {
        if (!data || !data._id) {
          let user = await users.findById({ _id: req.query.userId });
          let supportQuestion = await customerSupportModel.findById({
            _id: req.query.supportId,
          });

          return res.status(200).json({
            chat: [],
            _id: "",
            initiated: false,
            user,
            supportQuestion,
          });
        } else {
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        res.send(err);
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
async function readStatuses(req, res, next) {
  try {
    const { requestId } = req.params;
    const request = await requestModel
      .findOne({ _id: ObjectId(requestId) })
      .select("isProviderRead isCustomerRead");
    console.log("request ", request);
    if (request) {
      return res.status(200).send({
        success: true,
        request: request,
        message: "Request Chat Reads found",
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "Request Chat Reads Not found",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function createGroup(req, res, next) {
  try {
    if (!req.body.name || !req.body.involved_persons)
      return res.status(500).json({
        message: "you maybe missing groupName organization creator ",
        code: "1000",
        success: false,
      });
    req.body.involved_persons.push(req.userId);
    let newRoom = new chatroom({
      name: req.body.name,
      involved_persons: req.body.involved_persons,
      createdBy: req.userId,
      admins: [req.userId],
      chat: [],
    });
    if (req.body.involved_persons) {
      newRoom.involved_persons = req.body.involved_persons;
    }
    if (req.body.img_url) {
      newRoom.img_url = req.body.img_url;
    }

    await newRoom.save();
    res.send(newRoom._id);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function addUserToGroup(req, res, next) {
  try {
    if (!req.body.involved_persons)
      return res.status(422).json({
        message: "you maybe missing members ",
        code: "1000",
        success: false,
      });
    const chatRoomInfo = await chatroom.findOne({ _id: req.body.chatRoomId });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (chatRoomInfo?.roomType != "group") {
      return res.status(400).send({
        message: "User can be added to group chat only.",
        code: "1000",
        success: false,
      });
    }
    if (req.userId != chatRoomInfo?.createdBy) {
      return res.status(400).send({
        message: "You dont have right to add or remove participents.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        {
          $addToSet: { involved_persons: { $each: req.body.involved_persons } },
        }
      )
      .then((data) => {
        console.log("data ", data);
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
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
async function removeUserFromGroup(req, res, next) {
  try {
    if (!req.body.involved_person)
      return res.status(422).json({
        message: "you maybe missing organization or members ",
        code: "1000",
        success: false,
      });
    const chatRoomInfo = await chatroom.findOne({ _id: req.body.chatRoomId });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (chatRoomInfo?.roomType != "group") {
      return res.status(400).send({
        message: "User can be removed to group chat only.",
        code: "1000",
        success: false,
      });
    }
    if (!chatRoomInfo?.admins?.includes(req.userId)) {
      return res.status(400).send({
        message: "You dont have right to add or remove participents.",
        code: "1000",
        success: false,
      });
    }
    if (chatRoomInfo?.createdBy == req.body.involved_person) {
      return res.status(400).send({
        message: "Can't remove this user because they created this group.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        { $pull: { involved_persons: req.body.involved_person } }
      )
      .then((data) => {
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
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
async function addAdminToGroup(req, res, next) {
  try {
    const { newAdminUserId } = req.body;
    if (!req.body.newAdminUserId)
      return res.status(422).json({
        message: "userId of new admin needed ",
        code: "1000",
        success: false,
      });
    const chatRoomInfo = await chatroom.findOne({ _id: req.body.chatRoomId });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (chatRoomInfo?.roomType != "group") {
      return res.status(400).send({
        message: "Admin can be added to group chat only.",
        code: "1000",
        success: false,
      });
    }
    if (!chatRoomInfo?.admins?.includes(req.userId)) {
      return res.status(400).send({
        message: "You dont have right to add or remove admins.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        {
          $addToSet: { admins: newAdminUserId },
        }
      )
      .then((data) => {
        console.log("data ", data);
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
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
async function removeAdminToGroup(req, res, next) {
  try {
    const { removeAdminUserId } = req.body;
    if (!req.body.removeAdminUserId)
      return res.status(422).json({
        message: "userId of removing admin needed ",
        code: "1000",
        success: false,
      });
    const chatRoomInfo = await chatroom.findOne({ _id: req.body.chatRoomId });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (chatRoomInfo?.roomType != "group") {
      return res.status(400).send({
        message: "Admin can be added to group chat only.",
        code: "1000",
        success: false,
      });
    }
    if (!chatRoomInfo?.admins?.includes(req.userId)) {
      return res.status(400).send({
        message: "You dont have right to add or remove admins.",
        code: "1000",
        success: false,
      });
    }
    if (chatRoomInfo?.createdBy == removeAdminUserId) {
      return res.status(400).send({
        message: "Can't remove this user because they created this group.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        {
          $pull: { admins: removeAdminUserId },
        }
      )
      .then((data) => {
        console.log("data ", data);
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
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
async function updateGroup(req, res, next) {
  try {
    if (!req.body.chatRoomId || !req.body.name)
      return res.status(422).json({
        message: "you maybe missing room and name of the chat ",
        code: "1000",
        success: false,
      });
    console.log(
      "req.body.chatRoomId, req.body.name ",
      req.body.chatRoomId,
      req.body.name
    );
    const chatRoomInfo = await chatroom.findOne({
      _id: req.body.chatRoomId,
      roomType: "group",
    });
    console.log("chatRoomInfo ", chatRoomInfo);
    if (req.userId != chatRoomInfo?.createdBy) {
      return res.status(400).send({
        message: "You dont have right to change name of group.",
        code: "1000",
        success: false,
      });
    }
    chatroom
      .updateOne(
        { _id: req.body.chatRoomId },
        {
          $set: {
            //involved_persons: req.body.involved_persons,
            name: req.body.name ? req.body.name : chatRoomInfo?.name,
          },
        }
      )
      .then((data) => {
        return res.status(200).send({
          message: "success",
          code: "1000",
          success: true,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          message: "some error while adding",
          code: "1000",
          success: false,
        });
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
async function saveGroupChat(req, res, next) {
  try {
    if (
      !req.body.email ||
      !req.body.message ||
      !req.body.createdBy ||
      !req.body.roomId
    )
      return res.status(500).json({
        message:
          "you maybe missing groupName organization creator or involved_person",
        code: "1000",
        success: false,
      });

    let newMessage = new message({
      user: req.body.email,
      message: req.body.message,
    });

    await chatroom.update(
      { _id: req.body.roomId },
      {
        $push: {
          chat: newMessage,
        },
      }
    );
    res.send("added");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getGroup(req, res, next) {
  try {
    if (!req.query.chatRoomId)
      return res.status(500).json({
        message: "you maybe missing chatroom ",
        code: "1000",
        success: false,
      });
    const userPrivacySetting = await privacySetting.findOne({
      userId: req.userId,
    });
    console.log("userPrivacySetting ", userPrivacySetting);
    await chatroom
      .findOne({
        _id: mongo.ObjectID(req.query.chatRoomId),
        $or: [
          { involved_persons: { $in: req.userId } },
          {
            $or: [
              {
                userA: mongo.ObjectID(req.userId),
              },
              {
                userB: mongo.ObjectID(req.userId),
              },
            ],
          },
        ],
      })
      .populate("involved_persons userA userB")
      .populate("chat.user")
      .then(async (data) => {
        console.log(data);
        if (userPrivacySetting?.readReceipts) {
          //add logic for chatroom open means all messages read
          const updateMessages = await message.updateMany(
            {
              chatRoomId: req.query.chatRoomId,
              readReceipts: { $nin: req.userId },
              user: { $nin: req.userId },
            },
            {
              $push: {
                readReceipts: req.userId,
                readReceiptsWithTime: {
                  user: req.userId,
                },
              },
            }
          );
          console.log("updateMessages ", updateMessages);
        }

        return res.status(200).json({
          message: "groups found",
          code: 1000,
          success: true,
          data,
        });
      })
      .catch((err) => {
        res.send(err);
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
async function getGroupPrivateMessages(req, res, next) {
  try {
    let { chatRoomId, limit, pageNo } = req.query;
    if (!req.query.chatRoomId)
      return res.status(500).json({
        message: "you maybe missing chatroom ",
        code: "1000",
        success: false,
      });
    let messages;
    if (pageNo && limit) {
      console.log("pageNo,limit ", pageNo, limit);
      pageNo = parseInt(pageNo);
      limit = parseInt(limit);
      messages = await message
        .find({
          chatRoomId: mongo.ObjectID(req.query.chatRoomId),
        })
        .populate("User")
        .skip(pageNo > 0 ? (pageNo - 1) * limit : 0)
        .limit(limit)
        .sort({ createdAt: -1 });
    } else {
      messages = await message
        .find({
          chatRoomId: mongo.ObjectID(req.query.chatRoomId),
        })
        .populate("User")
        .sort({ createdAt: -1 });
    }

    if (messages) {
      return res.status(200).json({
        message: "chatroom messages found",
        code: 1000,
        success: true,
        messages: messages.reverse(),
      });
    } else {
      return res.status(200).json({
        message: "chatroom messages couldnt be found",
        code: 1000,
        success: false,
        messages: [],
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getGroupMessageReceipts(req, res, next) {
  try {
    let { chatRoomId, messageId } = req.query;
    if (!req.query.chatRoomId)
      return res.status(500).json({
        message: "you maybe missing chatroom ",
        code: "1000",
        success: false,
      });
    const chatRoom = await chatroom.findOne({ _id: chatRoomId });
    if (
      chatRoom.involved_persons.includes(req.userId) ||
      chatRoom?.userA == req.userId ||
      chatRoom?.userB == req.userId
    ) {
      const messageInfo = await message
        .findOne({ _id: messageId })
        .select("readReceiptsWithTime")
        .populate("readReceiptsWithTime.user");
      if (messageInfo) {
        return res.status(200).json({
          message: "chatroom messages found",
          code: 1000,
          success: true,
          readReceiptsWithTime: messageInfo.readReceiptsWithTime,
        });
      } else {
        return res.status(200).json({
          message: "message id not valid",
          code: 1000,
          success: false,
        });
      }
    } else {
      return res.status(400).json({
        message: "you are not allowed to see Receipts of this message",
        code: 1000,
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "oops something went wrong",
      code: "1002",
      success: false,
    });
  }
}
async function getAllGroupPrivateChats(req, res, next) {
  try {
    if (!req.userId)
      return res.status(400).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await chatroom
      .find({
        $or: [
          { involved_persons: { $in: req.userId } },
          {
            $or: [
              {
                userA: mongoose.Types.ObjectId(req.userId),
              },
              {
                userB: mongoose.Types.ObjectId(req.userId),
              },
            ],
          },
        ],
      })
      .populate("userA userB")
      .populate({
        path: "chat",
        options: { sort: { createdAt: -1 }, limit: 1 }, // Sort by createdAt in descending order and limit to 1 message
      })
      .sort({ updatedAt: -1 })
      .then((data) => {
        // Construct the response without the "chat" key
        const responseData = data.map((chatroom) => {
          const { chat, ...rest } = chatroom._doc;
          return {
            ...rest,
            lastMessage: chatroom.chat[0],
          };
        });

        return res.status(200).json({
          message: "All groups chats found",
          code: "1002",
          success: true,
          chats: responseData,
        });
      })
      .catch((err) => {
        res.send(err);
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
async function searchAllGroupPrivateChats(req, res, next) {
  try {
    const { searchQuery } = req.params;
    if (!req.userId)
      return res.status(400).json({
        message: "you maybe missing email or receiver ",
        code: "1000",
        success: false,
      });

    await chatroom
      .find({
        involved_persons: { $in: req.userId },
        name: { $regex: searchQuery, $options: "i" },
      })
      //.populate("involved_persons")
      .select("-chat")

      .then((data) => {
        return res.status(200).json({
          message: "All groups chats found",
          code: "1002",
          success: true,
          chats: data,
        });
      })
      .catch((err) => {
        res.send(err);
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
const runScript = async (req, res) => {
  try {
    // const updatedMessages=await message.updateMany({
    // },{
    //   $set:{
    //     readReceipts:[],
    //     readReceiptsWithTime:[]
    //   }
    // })
    // console.log("updatedMessages ",updatedMessages)
    const deletedMessages = await message.deleteMany({});
    console.log("deletedMessages ", deletedMessages);
    const updatedChatrooms = await chatroom.updateMany(
      {},
      {
        $set: {
          chat: [],
        },
      }
    );
    console.log("updatedChatrooms ", updatedChatrooms);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// async function onChatroomOpen(req, res, next) {
//   try {
//     const { requestId, userId } = req.body;
//     const user = await users.findOne({ "_id": ObjectId(userId) });
//     console.log("user ", user)
//     if (user.role) {
//       await requestModel.updateOne(
//         { _id: requestId },
//         {
//           $set: {
//             isProviderRead: true
//           }
//         }
//       )
//       return res.status(200).json({
//         success: true,
//         message: "Read Operation Performed"
//       })
//     } else {
//       await requestModel.updateOne(
//         { _id: requestId },
//         {
//           $set: {
//             isCustomerRead: true
//           }
//         }
//       )
//       return res.status(200).json({
//         success: true,
//         message: "Read Operation Performed"
//       })
//     }

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "oops something went wrong",
//       code: "1002",
//       success: false,
//     });
//   }
// }
module.exports.createPrivateChat = createPrivateChat;
module.exports.createRequestPrivateChat = createRequestPrivateChat;
module.exports.createSupportChat = createSupportChat;
module.exports.savePrivateChat = savePrivateChat;
module.exports.getPrivateChat = getPrivateChat;
module.exports.getSupportChat = getSupportChat;
module.exports.getRequestPrivateChat = getRequestPrivateChat;
module.exports.getAllPrivateChat = getAllPrivateChat;
module.exports.onReadChat = onReadChat;
module.exports.readStatuses = readStatuses;
module.exports.createGroup = createGroup;
module.exports.saveGroupChat = saveGroupChat;
module.exports.getGroup = getGroup;
module.exports.addUserToGroup = addUserToGroup;
module.exports.removeUserFromGroup = removeUserFromGroup;
module.exports.updateGroup = updateGroup;
module.exports.getAllGroupPrivateChats = getAllGroupPrivateChats;
module.exports.searchAllPrivateChat = searchAllPrivateChat;
module.exports.searchAllGroupPrivateChats = searchAllGroupPrivateChats;
module.exports.addAdminToGroup = addAdminToGroup;
module.exports.removeAdminToGroup = removeAdminToGroup;
module.exports.getGroupPrivateMessages = getGroupPrivateMessages;
module.exports.getGroupMessageReceipts = getGroupMessageReceipts;
module.exports.runScript = runScript;
//module.exports.onChatroomOpen = onChatroomOpen;
