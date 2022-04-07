const mongoose = require("mongoose");

const schema = mongoose.Schema({
  title: {
    type: String,
    unique: true, // title must be unique
    required: true,
    maxLength: 50,
  },
  description: {
    required: true,
    type: String,
  },
});

const Product = mongoose.model("Product", schema);

module.exports = { Product };
