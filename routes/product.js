var express = require("express");
var router = express.Router();

const { Product } = require("../models/Product");

/* GET home page. */
router.get("/", function (req, res, next) {
  Product.find().exec((err, products) => {
    if (err) {
      return res.status(400).json({ success: false, err });
    } else {
      res.status(200).json({ success: true, products });
    }
  });
});

router.get("/:id", function (req, res, next) {
  console.log(req.query.id, req.params.id);

  Product.find({ _id: req.params.id }).exec((err, products) => {
    if (err) {
      return res.status(400).json({ success: false, err });
    } else {
      res.status(200).json({ success: true, products });
    }
  });
});

router.post("/create", function (req, res, next) {
  const product = new Product(req.body);

  product.save((err) => {
    if (err) {
      return res.status(400).json({ success: false, err });
    } else {
      return res.status(200).json({ success: true });
    }
  });
});

module.exports = router;
