var mongoose = require("mongoose");
var Service = require("../../Models/service");
var Shop = require("../../Models/shop");
var Subcategory = require("../../Models/subcategory");
var ShopService = require("../../Models/shop_service");
var ServiceReview = require("../../Models/servicereview");
var Product = require("../../Models/product");
var User = require("../../Models/user");

const autoSearch = async (req, res) => {
  let proDarr = [];
  let prod = await Product.aggregate([
    {
      $match: {
        name: { $regex: ".*" + req.body.searchname + ".*", $options: "i" },
      },
    },
  ]).exec();
  prod.forEach(element => {
    proDarr.push({ item: element, type: "product" });
  });

  let Service = await ShopService.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              { name: { $regex: ".*" + req.body.searchname + ".*", $options: "i" } },
              { cat_name: { $regex: ".*" + req.body.searchname + ".*", $options: "i" } },
              { subcat_name: { $regex: ".*" + req.body.searchname + ".*", $options: "i" } }
            ]
          },
          { status: true }
        ]
      },
    },
  ]).exec();
  Service.forEach(element => {
    proDarr.push({ item: element, type: "service" });
  });

  console.log("Search results", proDarr);

  if (proDarr.length > 0) {
    return res.status(200).json({
      status: true,
      message: "Data successfully get",
      data: proDarr
    });
  }
  else {
    return res.status(200).json({
      status: true,
      message: "No match.",
      data: proDarr
    });
  }
};

const searchAll = async (req, res) => {
  if (req.body.type == "product") {
    return Product.aggregate([
      {
        $match: {
          name: { $regex: ".*" + req.body.searchname + ".*", $options: "i" },
        },
      },
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
  } else {
    return ShopService.aggregate([
      {
        $match: {
          name: { $regex: ".*" + req.body.searchname + ".*", $options: "i" }, 
          status: true
        },
      },
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
          from: "new_servicecarts",
          localField: "_id",
          foreignField: "serv_id",
          as: "cart_items",
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
  }
};

const serachProviders = async (req, res) => {
  // if(req.body.providername != "" && typeof req.body.providername != "undefined")
  // {
  let providerMatch = await User.aggregate([
    {
      $match: {
        firstName: { $regex: ".*" + req.body.searchname + ".*", $options: "i" },
        type: "Seller",
      },
    },
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
        from: "shops",
        let: {
          user_id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$userid", "$$user_id"] }],
              },
            },
          },
        ],
        as: "shop_details",
      },
    },
  ]).exec();
  // }

  let shopId = [];
  providerMatch.forEach((item) => {
    item.shop_details.forEach((ele) => {
      shopId.push(ele._id);
    });
  });

  return res.status(200).send({
    data: providerMatch,
    shopid: shopId,
  });
};

module.exports = {
  autoSearch,
  searchAll,
  serachProviders,
};
