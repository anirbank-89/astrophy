var mongoose = require("mongoose");
var Servicereview = require("../../Models/servicereview");

const create = async (req, res) => {
  let shopServiceData = {
    _id: mongoose.Types.ObjectId(),
    service_id: mongoose.Types.ObjectId(req.body.service_id),
    user_id: mongoose.Types.ObjectId(req.body.user_id),
    order_id: req.body.order_id,
  };
  if (typeof req.body.rating != "undefined" || req.body.rating != "") {
    shopServiceData.rating = req.body.rating;
  }
  if (typeof req.body.comment != "undefined" || req.body.comment != "") {
    shopServiceData.comment = req.body.comment;
  }
  let subData = await Servicereview.findOne({
    service_id: mongoose.Types.ObjectId(req.body.service_id),
    user_id: mongoose.Types.ObjectId(req.body.user_id),
  }).exec();
  if (subData == null || subData == "") {
    let review = new Servicereview(shopServiceData);
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
  } else {
    res.status(500).json({
      status: false,
      message: "Already reviewed",
      errors: null,
    });
  }
};

const getReviews = async (req, res) => {
  return Servicereview.aggregate([
    {
      $match: {
        service_id: mongoose.Types.ObjectId(req.params.serv_id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user_data",
      },
    },
    { $unwind : "$user_data" },
    {
      $project: {
        // _id: 0,

        __v: 0,
      },
    },
  ])
    .then((data) => {
      if (data.length > 0) {
        return res.status(200).json({
          status: true,
          message: "Reviews Get Successfully",
          data: data,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Empty List",
          data: data,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        status: false,
        message: "No Match",
        data: null,
      });
    });
};

module.exports = {
  create,
  getReviews,
};
