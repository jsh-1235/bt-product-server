const mongoose = require("mongoose");

const schema = mongoose.Schema({
  title: {
    type: String,
    maxLength: 50,
  },
  description: {
    type: String,
  },
});

const Product = mongoose.model("Product", schema);

module.exports = { Product };
