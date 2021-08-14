var mongoose = require("mongoose");
var Productreview = require("../../Models/productreview");

const create = async (req, res) => {
  let shopServiceData = {
    _id: mongoose.Types.ObjectId(),
    product_id: mongoose.Types.ObjectId(req.body.prod_id),
    user_id: mongoose.Types.ObjectId(req.body.user_id),
  };
  if (typeof req.body.rating != "undefined" || req.body.rating != "") {
    shopServiceData.rating = req.body.rating;
  }
  if (typeof req.body.comment != "undefined" || req.body.comment != "") {
    shopServiceData.comment = req.body.comment;
  }
  let subData = await Productreview.findOne({
    product_id: mongoose.Types.ObjectId(req.body.prod_id),
    user_id: mongoose.Types.ObjectId(req.body.user_id),
  }).exec();
  if (subData == null || subData == "") {
    let review = new Productreview(shopServiceData);
    review
      .save()
      .then((docs) => {
        res.status(200).json({
          status: true,
          message: "Review Saved sucessfully!",
          data: docs,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again",
          errors: err,
        });
      });
  }
  else
  {
    res.status(500).json({
        status: false,
        message: "Already reviewed",
        errors: null,
      });
  }
};

module.exports = {
  create,
};
