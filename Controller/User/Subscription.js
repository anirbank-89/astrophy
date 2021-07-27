var mongoose = require("mongoose");
var moment = require("moment-timezone");
var jwt = require("jsonwebtoken");
var uuidv1 = require("uuid").v1;

var Subsciption = require("../../Models/subscription");
var SubscribedBy = require("../../Models/subscr_purchase");
var User = require("../../Models/user");

const viewAllsubscription = async (req, res) => {
  return Subsciption.aggregate([
    {
      $lookup: {
        from: "usersubscriptions",
        let: {
          subscr_id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userid", mongoose.Types.ObjectId(req.params.id)] },
                  { $eq: ["$subscr_id", "$$subscr_id"] },
                ],
              },
            },
          },
        ],
        as: "speakers",
      },
    },
    {
      $project: {
        _v: 0,
      },
    },
  ])
    .then((data) => {
      res.status(200).json({
        status: true,
        message: "Subscription Data Get Successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again.",
        error: err,
      });
    });
};

const newSubscription = async (req, res) => {
  let subData = await SubscribedBy.findOne({
    userid: mongoose.Types.ObjectId(req.body.userid),
    subscr_id: mongoose.Types.ObjectId(req.body.subscr_id),
    status: true,
  }).exec();
  if (subData == null || subData == "") {
    let userData = {
      _id: mongoose.Types.ObjectId(),
      userid: mongoose.Types.ObjectId(req.body.userid),
      subscr_id: mongoose.Types.ObjectId(req.body.subscr_id),
      seller_comission: req.body.seller_comission,
      price: req.body.price,
      subscribed_on: moment.tz(Date.now(), "Asia/Kolkata"),
    };
    let new_subscription = new SubscribedBy(userData);

    return new_subscription
      .save()
      .then((data) => {
        User.findOneAndUpdate(
          { _id: req.body.userid },
          {
            $set: { type: "Seller" },
          },
          {
            returnNewDocument: true,
          },
          function (error, result) {
            res.status(200).json({
              status: true,
              success: true,
              message: "New subscription applied successfully.",
              data: data,
            });
          }
        );
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          success: false,
          message: "Server error. Please try again.",
          error: err,
        });
      });
  } else {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Subscription Exists",
    });
  }
};

module.exports = {
  viewAllsubscription,
  newSubscription,
};
