var mongoose = require("mongoose");
var Service = require("../../Models/service");
var Shop = require("../../Models/shop");
var Subcategory = require("../../Models/subcategory");
var ShopService = require("../../Models/shop_service");
var ServiceReview = require("../../Models/servicereview");

const serviceSearch = async (req, res) => {
  return ShopService.aggregate([
    req.body.servicename != "" && typeof req.body.servicename != "undefined"
      ? {
          $match: { name: { $in: [req.body.servicename.toString()] } },
        }
      : { $project: { __v: 0 } },
    req.body.category_id != "" && typeof req.body.category_id != "undefined"
      ? {
          $match: {
            category_id: {
              $in: [mongoose.Types.ObjectId(req.body.category_id)],
            },
          },
        }
      : { $project: { __v: 0 } },
    (req.body.min != "" && typeof req.body.min != "undefined") ||
    (req.body.max != "" && typeof req.body.max != "undefined")
      ? {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: ["$price", req.body.min],
                },
                {
                  $lte: ["$price", req.body.max],
                },
              ],
            },
          },
        }
      : { $project: { __v: 0 } },
    {
      $lookup: {
        from: "shops",
        localField: "shop_id",
        foreignField: "_id",
        as: "shop_details",
      },
    },
    {
      $lookup: {
        from: "servicecarts",
        localField: "_id",
        foreignField: "serv_id",
        as: "cart_items",
      },
    },
    {
      $addFields: {
        totalAdded: {
          $cond: {
            if: { $isArray: "$cart_items" },
            then: { $size: "$cart_items" },
            else: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "servicereviews",
        localField: "_id",
        foreignField: "service_id",
        as: "rev_data",
      },
    },
    {
      $addFields: {
        avgRating: {
          $avg: {
            $map: {
              input: "$rev_data",
              in: "$$this.rating",
            },
          },
        },
      },
    },
    req.body.newarrivals != "" && typeof req.body.newarrivals != "undefined"
      ? { $sort: { _id: -1 } }
      : { $project: { __v: 0 } },
    req.body.highlow != "" && typeof req.body.highlow != "undefined"
      ? { $sort: { price: -1 } }
      : { $project: { __v: 0 } },
    req.body.lowhigh != "" && typeof req.body.lowhigh != "undefined"
      ? { $sort: { price: 1 } }
      : { $project: { __v: 0 } },
    req.body.lowhighrev != "" && typeof req.body.lowhighrev != "undefined"
      ? { $sort: { avgRating: 1 } }
      : { $project: { __v: 0 } },
    req.body.highlowrev != "" && typeof req.body.highlowrev != "undefined"
      ? { $sort: { avgRating: -1 } }
      : { $project: { __v: 0 } },
    req.body.bestselling != "" && typeof req.body.bestselling != "undefined"
      ? { $sort: { totalAdded: -1 } }
      : { $project: { __v: 0 } },
    req.body.lowhighsell != "" && typeof req.body.lowhighsell != "undefined"
      ? { $sort: { totalAdded: 1 } }
      : { $project: { __v: 0 } },
    req.body.highlowsell != "" && typeof req.body.highlowsell != "undefined"
      ? { $sort: { totalAdded: -1 } }
      : { $project: { __v: 0 } },
  ])
    .then((data) => {
      if (data.length > 0) {
        res.status(200).json({
          status: true,
          message: "Product Get",
          data: data,
        });
      } else {
        res.status(200).json({
          status: false,
          message: "No Data ",
          data: data,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Ambulance Booking not match",
        data: null,
        err,
      });
    });
};

module.exports = {
  serviceSearch,
};
