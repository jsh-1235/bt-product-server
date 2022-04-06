const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const moment = require("moment");

require("dotenv").config();

const schema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    maxLength: 50,
  },
  email: {
    type: String,
    unique: true, // email must be unique
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

schema.pre("save", function (next) {
  const user = this;

  if (user.isModified("password")) {
    console.log("Your password has been changed.");

    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);

        user.password = hash;

        next();
      });
    });
  } else {
    next();
  }
});

schema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);

    cb(null, isMatch);
  });
};

schema.methods.generateToken = function (cb) {
  const user = this;

  const token = jwt.sign({ id: user._id.toHexString() }, process.env.JWT_SECRET, {
    // expiresIn: "1m",
    issuer: "jsh",
  });

  const oneHour = moment().add(1, "minutes").valueOf();

  user.token = token;
  user.tokenExp = oneHour;

  user.save(function (err, user) {
    if (err) return cb(err);

    cb(null, user);
  });
};

schema.statics.findByToken = function (token, cb) {
  const user = this;

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) return cb(err);

    console.log("decoded", decoded);

    user.findOne({ _id: decoded.id, token: token }, function (err, user) {
      if (err) return cb(err);

      cb(null, user);
    });
  });
};

const User = mongoose.model("User", schema);

module.exports = { User };
