var express = require("express");
var router = express.Router();

const { User } = require("../models/User");
const { auth } = require("../middleware/auth");

/* GET users listing. */
router.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    role: req.user.role,
    image: req.user.image,
  });
});

router.get("/", auth, function (req, res, next) {
  console.log(req.cookies);

  User.find().exec((err, users) => {
    if (err) {
      return res.status(400).json({ success: false, err });
    } else {
      res.status(200).json({ success: true, users });
    }
  });
});

router.post("/register", (req, res) => {
  // console.log(req.body);

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return cb(err);

    if (user) {
      return res.json({ success: false, err: "You are already a registered user." });
    } else {
      const user = new User(req.body);

      user.save((err, doc) => {
        if (err) {
          console.log(err.message);

          return res.json({ success: false, err: err.message });
        }

        return res.status(200).json({
          success: true,
        });
      });
    }
  });
});

router.post("/update", (req, res) => {
  console.log(req.body);

  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        success: false,
        err: "Authentication failed, Email not found.",
      });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ success: false, err: "Authentication failed, Wrong password." });

      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;

      user.save(function (err) {
        if (err) return res.json({ success: false, err: err.message });

        return res.status(200).json({
          success: true,
        });
      });
    });
  });
});

// router.post("/delete", auth, (req, res, next) => {
//   console.log(req.cookies.w_auth);

//   User.deleteOne({ token: req.cookies.w_auth }, (err, user) => {
//     if (err) next(err);

//     if (!user) {
//       return res.json({
//         success: false,
//         err: "Failed to delete user from db.",
//       });
//     }

//     res.clearCookie("w_authExp");
//     res.clearCookie("w_auth");

//     return res.status(200).json({
//       success: true,
//     });
//   });
// });

router.post("/delete", (req, res, next) => {
  console.log(req.method, req.url, req.body._id);

  User.deleteOne({ _id: req.body._id }, (err, user) => {
    if (err) next(err);

    if (!user) {
      return res.json({
        success: false,
        err: "Failed to delete user from db.",
      });
    }

    res.clearCookie("w_authExp");
    res.clearCookie("w_auth");

    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  console.log(req.body);

  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        success: false,
        err: "Authentication failed, Email not found.",
      });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ success: false, err: "Authentication failed, Wrong password." });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // res.cookie("w_authExp", user.tokenExp, { httpOnly: true, maxAge: 60 * 1000 });

        res.cookie("w_authExp", user.tokenExp, { httpOnly: true, sameSite: "None", secure: true });

        res.cookie("w_auth", user.token, { httpOnly: true, sameSite: "None", secure: true }).status(200).json({
          success: true,
          userId: user._id,
        });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
  console.log("logout");

  User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
    if (err) return res.json({ success: false, err: "Logout failed." });

    res.clearCookie("w_authExp");
    res.clearCookie("w_auth");

    return res.status(200).send({
      success: true,
    });
  });
});

module.exports = router;
