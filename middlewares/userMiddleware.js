var jwt = require("jsonwebtoken");

function extractToken(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}
const verifyTokenUser = async (req, res, next) => {
  console.log("verifying jwt");
  const token2 = await extractToken(req);
  console.log("token2 ", token2);
  if (!token2) {
    return res.status(401).send("Yo, we need a token");
    next();
  } else {
    jwt.verify(token2, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("you failed authenticate", err);
        return res
          .status(401)
          .json({ auth: false, message: "you failed authenticate" });
        next();
      } else {
        console.log("decoded ", decoded);
        req.userId = decoded._id;
        console.log("you authenticated", decoded._id);
        next();
      }
    });
  }
};
module.exports = {
  verifyTokenUser,
};
