const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Setup Cross Origin 
app.use(require("cors")());

//Bring in the routes
//app.use("/chat/user", require("./routes/user"));
app.use("/chat/chatroom", require("./routes/chatroom"));

app.use("/chat/chat", require("./routes/chat")); 

//Setup Error Handlers
const errorHandlers = require("./handlers/errorHandlers");
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if (process.env.ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else { 
  app.use(errorHandlers.productionErrors);
}

module.exports = app; 
