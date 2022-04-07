var express = require("express");
var router = express.Router();

const { auth } = require("../middleware/auth");
const { User } = require("../models/User");

const ROLE = {
  USER: 0,
  ADMIN: 1,
};

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

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return cb(err);

    if (user) {
      return res.json({ success: false, err: "The user is already registered." });
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

router.post("/update", auth, (req, res) => {
  if (req.user.role === ROLE.ADMIN) {
    User.findOne({ _id: req.body._id }, (err, user) => {
      if (!user) {
        return res.json({
          success: false,
          err: "Authentication failed, user not found.",
        });
      }

      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch) return res.json({ success: false, err: "Authentication failed, Wrong password." });

        user.email = req.body.email;
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
  } else {
    const err = new Error("You do not have access rights.");
    err.status = 403;
    return next(err);
  }
});

router.get("/", auth, function (req, res, next) {
  // console.log(req.cookies, req.user.role);

  if (req.user.role === ROLE.ADMIN) {
    User.find().exec((err, users) => {
      if (err) {
        return res.status(400).json({ success: false, err });
      } else {
        res.status(200).json({ success: true, users });
      }
    });
  } else {
    const err = new Error("You do not have access rights.");
    err.status = 403;
    return next(err);
  }
});

router.post("/delete", auth, (req, res, next) => {
  if (req.user.role === ROLE.ADMIN) {
    User.deleteOne({ _id: req.body._id }, (err, result) => {
      if (err) next(err);

      if (result.deletedCount === 0) {
        return res.json({
          success: false,
          err: "Failed to delete user from db.",
        });
      } else {
        return res.status(200).json({
          success: true,
        });
      }
    });
  } else {
    const err = new Error("You do not have access rights.");
    err.status = 403;
    return next(err);
  }
});

router.post("/login", (req, res) => {
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

        // res.cookie("w_authExp", user.tokenExp, { httpOnly: true });

        // res.cookie("w_auth", user.token, { httpOnly: true }).status(200).json({
        //   success: true,
        //   userId: user._id,
        // });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
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
