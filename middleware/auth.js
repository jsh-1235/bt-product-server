const { User } = require("../models/User");

let auth = (req, res, next) => {
  const token = req.cookies.w_auth;

  // console.log("token", token);

  if (token) {
    User.findByToken(token, (err, user) => {
      if (err) next(err);

      if (!user) {
        console.log("The token does not exist.");

        return res.json({ isAuth: false, error: true });
      }

      // console.log("user", user);

      req.token = token;
      req.user = user;

      next();
    });
  } else {
    return res.json({ isAuth: false, error: true });
  }
};

module.exports = { auth };
