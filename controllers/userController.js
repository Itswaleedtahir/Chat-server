const mongoose = require("mongoose");
const User = require('../models/User')
const sha256 = require("js-sha256");
const jwt = require("jwt-then");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;

  if (!emailRegex.test(email)) throw "Email is not supported from your domain.";
  if (password.length < 6) throw "Password must be atleast 6 characters long.";

  const userExists = await User.findOne({
    email,
  });

  if (userExists) throw "User with same email already exits.";

  const user = new User({
    name,
    email,
    password: sha256(password + process.env.SALT),
  });

  await user.save();

  res.json({
    message: "User [" + name + "] registered successfully!",
  });
};

exports.login = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user) throw "Email  not found.";

  const token = await jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET
  );

  res.json({
    message: "User logged in successfully!",
    token,
  });
};
