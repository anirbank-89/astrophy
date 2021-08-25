var mongoose = require("mongoose");
var Service = require("../../Models/service");
var Shop = require("../../Models/shop");
var Subcategory = require("../../Models/subcategory");
var ShopService = require("../../Models/shop_service");
var ServiceReview = require("../../Models/servicereview");
var Product = require("../../Models/product");

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

    typeof req.body.shortby != "undefined" && req.body.shortby == "newarrivals"
      ? { $sort: { _id: -1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "highlow"
      ? { $sort: { price: -1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "lowhigh"
      ? { $sort: { price: 1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "lowhighrev"
      ? { $sort: { avgRating: 1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "highlowrev"
      ? { $sort: { avgRating: -1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "bestselling"
      ? { $sort: { totalAdded: -1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "lowhighsell"
      ? { $sort: { totalAdded: 1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "highlowsell"
      ? { $sort: { totalAdded: -1 } }
      : { $project: { __v: 0 } },
  ])
    .then((data) => {
      if (data.length > 0) {
        res.status(200).json({
          status: true,
          message: "Service Get Successfully",
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
        message: "No Match",
        data: null,
        err,
      });
    });
};

const productSearch = async (req, res) => {
  return Product.aggregate([
    req.body.delivery != "" && typeof req.body.delivery != "undefined"
      ? {
          $match: { delivery: { $in: [req.body.delivery.toString()] } },
        }
      : { $project: { __v: 0 } },
    (req.body.min != "" && typeof req.body.min != "undefined") ||
    (req.body.max != "" && typeof req.body.max != "undefined")
      ? {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: ["$selling_price", req.body.min],
                },
                {
                  $lte: ["$selling_price", req.body.max],
                },
              ],
            },
          },
        }
      : { $project: { __v: 0 } },
    {
      $lookup: {
        from: "categories",
        localField: "catID",
        foreignField: "_id",
        as: "category_data",
      },
    },
    {
      $lookup: {
        from: "carts",
        localField: "_id",
        foreignField: "prod_id",
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
        from: "reviews",
        localField: "_id",
        foreignField: "product_id",
        as: "review_data",
      },
    },
    {
      $addFields: {
        avgRating: {
          $avg: {
            $map: {
              input: "$review_data",
              in: "$$this.rating",
            },
          },
        },
      },
    },

    typeof req.body.shortby != "undefined" && req.body.shortby == "newarrivals"
      ? { $sort: { _id: -1 } }
      : { $project: { __v: 0 } },
    typeof req.body.shortby != "undefined" && req.body.shortby == "highlow"
      ? { $sort: { selling_price: -1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "lowhigh"
      ? { $sort: { selling_price: 1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "lowhighrev"
      ? { $sort: { avgRating: 1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "highlowrev"
      ? { $sort: { avgRating: -1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "bestselling"
      ? { $sort: { totalAdded: -1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "lowhighsell"
      ? { $sort: { totalAdded: 1 } }
      : { $project: { __v: 0 } },

    typeof req.body.shortby != "undefined" && req.body.shortby == "highlowsell"
      ? { $sort: { totalAdded: -1 } }
      : { $project: { __v: 0 } },
  ])
    .then((data) => {
      if (data.length > 0) {
        res.status(200).json({
          status: true,
          message: "Product Get Successfully",
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
        message: "No match",
        data: null,
        err,
      });
    });
};

module.exports = {
  serviceSearch,
  productSearch,
};
