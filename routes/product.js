var express = require("express");
var router = express.Router();

const { auth } = require("../middleware/auth");
const { Product } = require("../models/Product");

const ROLE = {
  USER: 0,
  ADMIN: 1,
};

/* GET product page. */
router.post("/create", auth, function (req, res, next) {
  if (req.user.role === ROLE.ADMIN) {
    Product.findOne({ title: req.body.title }, function (err, product) {
      if (err) return cb(err);

      if (product) {
        return res.json({ success: false, err: "The product is already registered." });
      } else {
        const product = new Product(req.body);

        product.save((err, doc) => {
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
  } else {
    return res.json({
      success: false,
      err: "Log in with administrator privileges.",
    });
  }
});

router.post("/update", auth, (req, res) => {
  if (req.user.role === ROLE.ADMIN) {
    Product.findOne({ _id: req.body._id }, (err, product) => {
      if (!product) {
        return res.json({
          success: false,
          err: "Authentication failed, Product not found.",
        });
      }

      product.title = req.body.title;
      product.description = req.body.description;

      product.save(function (err) {
        if (err) return res.json({ success: false, err: err.message });

        return res.status(200).json({
          success: true,
        });
      });
    });
  } else {
    return res.json({
      success: false,
      err: "Log in with administrator privileges.",
    });
  }
});

router.get("/", auth, function (req, res, next) {
  if (req.user.role >= ROLE.USER) {
    Product.find().exec((err, products) => {
      if (err) {
        return res.status(400).json({ success: false, err });
      } else {
        res.status(200).json({ success: true, products });
      }
    });
  } else {
    return res.json({
      success: false,
      err: "Log in with administrator privileges.",
    });
  }
});

router.get("/:id", auth, function (req, res, next) {
  // console.log(req.query.id, req.params.id);

  if (req.user.role >= ROLE.USER) {
    Product.find({ _id: req.params.id }).exec((err, products) => {
      if (err) {
        return res.status(400).json({ success: false, err });
      } else {
        res.status(200).json({ success: true, products });
      }
    });
  } else {
    return res.json({
      success: false,
      err: "Log in with administrator privileges.",
    });
  }
});

router.post("/delete", auth, (req, res, next) => {
  if (req.user.role === ROLE.ADMIN) {
    Product.deleteOne({ _id: req.body._id }, (err, result) => {
      if (err) next(err);

      if (result.deletedCount === 0) {
        return res.json({
          success: false,
          err: "Failed to delete product from db.",
        });
      } else {
        return res.status(200).json({
          success: true,
        });
      }
    });
  } else {
    return res.json({
      success: false,
      err: "Log in with administrator privileges.",
    });
  }
});

module.exports = router;
