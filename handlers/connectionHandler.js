let mongoose = require("mongoose");
require("dotenv").config();
let fs = require("fs");
// Use ES6 Promises for mongoose
mongoose.Promise = global.Promise;
mongoose.set("useNewUrlParser", true);
// Set environment variables
// let env = process.env.NODE_ENV;
let env = "development";

if (env === "development") {
  // Using mongoose to connect to MLAB database (Create new database single node free and create new user and set name and password)
  // const username = process.env.MONGO_USER;
  // const password = process.env.MONGO_PW;
  // const url = process.env.URL;

  try {
    // console.log(`mongodb+srv://${username}:${password}@${url}`);
    // console.log("process.env.DB_NAME ", process.env.DB_NAME);
    console.log(process.env.URL);
    mongoose.connect(process.env.URL, {
      dbName: process.env.DB_NAME,
      // user: username,
      // pass: password,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.log(username, password, url);
    console.log(err);
  }
}

// Signal connection
mongoose.connection
  .once("open", function () {
    console.log("Connection has been made");
  })
  .on("error", function (error) {
    console.log("Connect error", error);
  })
  .on("disconnected", function () {
    console.log("Connection disconnected");
  });

module.exports = mongoose;
