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
                  { $eq: ["$subscr_id", "$$subscr_id"] }
                ],
              },
            },
          },
        ],
        as: "speakers",
      },
    },
    {
        $unwind: "$speakers",
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
      // console.log(data);
      User.findOneAndUpdate(
        { _id: req.body.userid },
        {
          $set: { type: "Seller" },
        },
        {
          returnNewDocument: true,
        },
        function (error, result) {
          // data.user_data = result
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

  // User.findOneAndUpdate(
  //     { _id: { $in : [mongoose.Types.ObjectId(req.body.userid)] } },
  //     {type: "Seller"}, ()
  // );
  User.findOneAndUpdate(
    { _id: { $in: [mongoose.Types.ObjectId(req.body.userid)] } },
    { type: "Seller" },
    null,
    function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log("Original Doc : ", docs);
      }
    }
  );
};

module.exports = {
  viewAllsubscription,
  newSubscription,
};
