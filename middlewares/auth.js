const jwt = require("jwt-then");
const jwtDecode = require("jwt-decode");

module.exports = async (req, res, next) => {
  try {

    if (!req.headers.authorization) throw "Forbidden!!";

    const token = req.headers.authorization.split(" ")[1];

    const decoded = await jwtDecode(token);
    // const payload = await jwt.verify(token, process.env.SECRET);
    req.payload = await { email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({
      message: "Forbidden 🚫🚫🚫",
    });
  }
};
