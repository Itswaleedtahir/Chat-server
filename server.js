if (process.env.NODE_ENV === "dev") {
  require("dotenv").config({ path: ".env.dev" });
} else {
  require("dotenv").config();
}
console.log("process.env.PORT ", process.env.PORT);
const mongoose = require("mongoose");
const jwtDecode = require("jwt-decode");

const connection = require("./handlers/connectionHandler");
require("./models/User");
require("./models/Chatroom");
require("./models/Message");
require("./models/privateChatroom");
require("./models/organization");
const Message = mongoose.model("Message");
const SupportMessage = require("./models/SupportMessage");
const User = mongoose.model("User");
const { createNotification } = require("./handlers/pushNotification");
const chatHandler = require("./handlers/chatroomHandler");
//Bring in the models

const app = require("./app");

const server = app.listen(process.env.PORT || 5007, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

const io = require("socket.io")(server, {
  upgradeTimeout: 30002,
  cors: {
    origin: "*",
  },
});
const jwt = require("jwt-then");
const privateChatroom = require("./models/privateChatroom");
const requestModel = require("./models/requestModel");
const adminModel = require("./models/adminModel");
let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId && user.socketId == socketId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.filter((user) => user.userId === userId);
};
io.use(async (socket, next) => {
  try {
    console.log("socket.handshake.query.userId", socket.handshake.query.userId);
    socket.userId = socket.handshake.query.userId;
    socket.id = socket.handshake.query.userId;
    next();
  } catch (err) {}
});

io.on("connection", async (socket) => {
  addUser(socket.userId, socket.id);
  console.log("Connected: " + socket.userId, " socket.id ", socket.id);

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId, " ", socket.id);
    removeUser(socket.id);
  });

  // socket.on("initiate", ({ userA, userB }) => {
  //   const newChat = new privateChatroom({});
  //   console.log("A user joined chatroom: " + chatroomId);
  // });
  socket.on("joinRoom", ({ chatroomId }) => {
    socket.join(chatroomId);
    console.log("A user joined chatroom: " + chatroomId);
  });
  socket.on("joinPrivate", ({ userId }) => {
    socket.join(userId);
    console.log("A user joined group: " + userId);
  });

  socket.on("leaveRoom", ({ chatroomId }) => {
    socket.leave(chatroomId);
    console.log("A user left chatroom: " + chatroomId);
  });

  socket.on("leavePrivate", ({ userId }) => {
    socket.leave(userId);
    console.log("A user left chatroom: " + userId);
  });

  socket.on("chatroomMessage", async ({ chatroomId, message }) => {
    try {
      //  add authentication
      console.log("chatttt rooom message ", message);
      if (message.trim().length > 0) {
        console.log(socket.userId);

        const user = await User.findOne({ _id: socket.userId });

        const newMessage = await new Message({
          chatRoomId: chatroomId,
          user: user?._id,
          message,
          //createdAt
        }).save();
        console.log("newMessage ", newMessage);
        console.log(`newMessage/${chatroomId}`);
        io.emit(`newMessage/${chatroomId}`, {
          chatroom: chatroomId,
          name: user.name,
          user: user,
          message: message,
          type: newMessage.type,
          createdAt: newMessage.createdAt,
        });
        await chatHandler.saveGroupChat(chatroomId, newMessage, user);
      }
    } catch (err) {
      console.log("err ", err);
    }
  });
  socket.on("privateMessage", async ({ receiver, message }) => {
    try {
      console.log(receiver, message);
      //  add authentication
      if (message?.trim().length > 0) {
        const user = await User.findOne({ _id: socket.userId });
        console.log(socket.userId);
        console.log("user._id", user._id);
        console.log("receiver", receiver);
        var newMessage = await new Message({
          user: user._id,
          message,
        }).save();
        console.log("newMessage ", newMessage);
        newMessage.user = user;
        console.log("newMessage2 ", newMessage);
        console.log(`io.to(${receiver}).emit(newMessage/${user._id}, {`);
        io.to(receiver).emit(`newMessage/${user._id}`, {
          message: newMessage,
          name: user.name,
          user: user._id,
        });
        console.log(`io.to(${user._id}).emit(newMessage/${receiver}, {`);
        io.to(user._id).emit(`newMessage/${receiver}`, {
          message: newMessage,
          name: user.name,
          user: user._id,
        });
        console.log("sent");
        const recieverInfo = await User.findOne({ _id: receiver });
        console.log("reciever ", recieverInfo);
        // var notificationMessage = `${user.firstname + " " + user.lastname} has messaged you`
        // console.log("user._id receiver",user._id, receiver)
        // if (recieverInfo.role) {
        //   var playerID = recieverInfo.playerID ? recieverInfo.playerID : "a811c3dd-be0f-4f3b-87c1-676bf931a64d"
        //   const response = await createNotification(notificationMessage, user._id, `userMessaged`, playerID, "Provider", recieverInfo._id,"Chat",requestId,receiver)
        // } else {
        //   var playerID = recieverInfo.playerID ? recieverInfo.playerID : "a811c3dd-be0f-4f3b-87c1-676bf931a64d"
        //   const response = await createNotification(notificationMessage, user._id, `userMessaged`, playerID, "Customer", recieverInfo._id,"Chat",requestId,receiver)
        // }

        await chatHandler.savePrivateChat(user._id, receiver, newMessage);
      }
    } catch (err) {
      console.log(err);
      console.log("Socket  Down");
      // res.status(500).json({
      //   message: "oops something went wrong",
      //   code: "1002",
      //   success: false,
      // });
    }
  });
  socket.on(
    "supportMessage",
    async ({ receiver, isAdmin, message, createdAt, supportId }) => {
      try {
        console.log("support message: ", receiver, message, createdAt);
        //  add authentication
        if (message.trim().length > 0) {
          var newMessage;
          var user;
          if (!isAdmin) {
            user = await User.findOne({ _id: socket.userId });
            console.log(socket.userId);
            console.log("user._id", user._id);
            //console.log("receiver", receiver);
            newMessage = new SupportMessage({
              user: user._id,
              message,
            });
            console.log("newMessage ", newMessage);
            newMessage.user = user;
            console.log("newMessage2 ", newMessage);

            console.log(`io.emit(newMessage/${user._id}, {`);
            io.emit(`newMessage/${supportId}`, {
              message: newMessage,
              name: user.name,
              user: user._id,
            });
            // console.log(`io.to(${user._id}).emit(newMessage/${receiver}, {`)
            // io.to(user._id).emit(`newMessage/${supportId}`, {
            //   message: newMessage,
            //   name: user.name,
            //   user: user._id
            // });
            console.log("sent");
          } else {
            user = await User.findOne({ _id: receiver });
            console.log("socket.userId ", socket.userId);
            const admin = await adminModel.findOne({ _id: socket.userId });
            console.log(socket.userId);
            console.log("user._id", user._id);
            console.log("receiver", receiver);
            newMessage = new SupportMessage({
              admin: admin._id,
              message,
            });
            console.log("newMessage ", newMessage);
            newMessage.admin = admin;
            console.log("newMessage2 ", newMessage);

            console.log(`io.to(${receiver}).emit(newMessage/${supportId}, {`);
            io.to(receiver).emit(`newMessage/${supportId}`, {
              message: newMessage,
              name: "Admin",
              admin: admin._id,
            });
            console.log(`io.to(${user._id}).emit(newMessage/${supportId}, {`);
            io.to(user._id).emit(`newMessage/${supportId}`, {
              message: newMessage,
              name: "Admin",
              admin: admin._id,
            });
            console.log("sent");
          }

          // const recieverInfo = await User.findOne({ "_id": receiver });
          // console.log("reciever ",recieverInfo)
          // var notificationMessage=`${user.firstname+" "+user.lastname} has messaged you`
          // if(recieverInfo.role){
          //   var playerID=recieverInfo.playerID?recieverInfo.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
          //   const response = await createNotification(notificationMessage,user._id,`userMessaged`,playerID,"Provider",recieverInfo._id)
          // }else{
          //   var playerID=recieverInfo.playerID?recieverInfo.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
          //   const response = await createNotification(notificationMessage,user._id,`userMessaged`,playerID,"Customer",recieverInfo._id)
          // }

          await chatHandler.saveSupportChat(user._id, supportId, newMessage);
        }
      } catch (err) {
        console.log(err);
      }
    }
  );
  //webRTC socket one to one audio video events
  socket.on("call", (data) => {
    let calleeId = data.calleeId;
    let rtcMessage = data.rtcMessage;

    socket.to(calleeId).emit("newCall", {
      callerId: socket.user,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("answerCall", (data) => {
    let callerId = data.callerId;
    const rtcMessage = data.rtcMessage;

    socket.to(callerId).emit("callAnswered", {
      callee: socket.user,
      rtcMessage: rtcMessage,
    });
  });
  socket.on("rejectCall", (data) => {
    let callerId = data.callerId;
    const rtcMessage = data.rtcMessage;

    socket.to(callerId).emit("callRejected", {
      callee: socket.user,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("ICEcandidate", (data) => {
    console.log("ICEcandidate data.calleeId", data.calleeId);
    let calleeId = data.calleeId;
    let rtcMessage = data.rtcMessage;

    socket.to(calleeId).emit("ICEcandidate", {
      sender: socket.user,
      rtcMessage: rtcMessage,
    });
  });
  //webRTC socket group audio video events
  socket.on("groupCall", (data) => {
    let calleeIds = data.calleeIds; // List of participants
    let rtcMessage = data.rtcMessage;

    // Emit the "newGroupCall" event to all participants
    calleeIds.forEach((calleeId) => {
      socket.to(calleeId).emit("newGroupCall", {
        callerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });
  });

  socket.on("answerGroupCall", (data) => {
    let callerId = data.callerId;
    const rtcMessage = data.rtcMessage;

    socket.to(callerId).emit("groupCallAnswered", {
      callee: socket.user,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("rejectGroupCall", (data) => {
    let callerId = data.callerId;
    const rtcMessage = data.rtcMessage;

    socket.to(callerId).emit("groupCallRejected", {
      callee: socket.user,
      rtcMessage: rtcMessage,
    });
  });
});
