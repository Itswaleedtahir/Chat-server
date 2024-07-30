const mongoose = require("mongoose");
const crypto = require("crypto");

let Schema = mongoose.Schema;

const messageSchema = new Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
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
  readReceipts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  readReceiptsWithTime: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    time: {
      type: Date,
      default: Date.now,
    }
  }]
});
// Pre-save middleware to encrypt the message before saving
messageSchema.pre('save', function (next) {
  // Check if the message field is modified and needs encryption
  if (this.isModified('message')) {
    console.log(process.env.CIPHERKEY)
    const encryptionKey = this.user + process.env.CIPHERKEY; // Replace with your actual encryption key
    console.log("encryptionKey ", encryptionKey)
    // Encrypt the message and update the field
    console.log("this.message ", this.message)
    this.message = encryptMessage(this.message, encryptionKey);
  }
  next();
});

// Post-find middleware to decrypt the message before returning it
messageSchema.post('find', function (messages) {
  messages.forEach(message => {
    if (message.message) {
      //console.log(process.env.CIPHERKEY)
      const decryptionKey = message.user._id + process.env.CIPHERKEY; // Replace with your actual decryption key
      console.log("decryptionKey ", decryptionKey)
      // Decrypt the message in the query result
      console.log("message.message ", message)
      message.message = decryptMessage(message.message, decryptionKey);
    }
  });
});

function encryptMessage(message, encryptionKey) {
  const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
  let encryptedMessage = cipher.update(message, 'utf8', 'hex');
  encryptedMessage += cipher.final('hex');
  return encryptedMessage;
}

function decryptMessage(encryptedMessage, decryptionKey) {
  const decipher = crypto.createDecipher('aes-256-cbc', decryptionKey);
  let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
  decryptedMessage += decipher.final('utf8');
  return decryptedMessage;
}

let message = mongoose.model("Message", messageSchema);
module.exports = message;
