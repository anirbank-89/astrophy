var mongoose = require('mongoose');

const CATEGORY = require('../../Models/category');
var Service = require('../../Models/service');
// var Subcategory = require('../../Models/subcategory');
var User = require('../../Models/user');
var ShopService = require('../../Models/shop_service');


const viewAllServices = async (req, res) => {
    return CATEGORY.aggregate([
        {
            $lookup: {
                from: "services",
                localField: "_id",
                foreignField: "cat_id",
                as: "service_data"
            }
        },
        {
            $project: {
                __v: 0
            }
        }
    ])
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data successfully get.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to get data. Server error.",
                error: err.message
            });
        });
}

const viewService = async (req, res) => {
    let id = req.params.id;
    return Service.findOne(
        { _id: { $in: [mongoose.Types.ObjectId(id)] } },
        (err, docs) => {
            if (err) {
                res.status(400).json({
                    status: false,
                    message: "Server error. Data not available",
                    error: err
                });
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "Service get successfully",
                    data: docs
                });
            }
        });
}

const viewServicePerCategory = async (req, res) => {
    Service.find({ cat_id: mongoose.Types.ObjectId(req.params.id) })
        .then((data) => {
            res.status(200).json({
                status: true,
                message: "Services for category get successfully.",
                data: data
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err.message
            })
        })
}

const viewShopServicesPerService = async (req, res) => {
    let id = req.params.id       // _id of 'services' table in params

    let shopId = [];
    if (req.body.providername != "" && typeof req.body.providername != "undefined") {
        let providerMatch = await User.aggregate([
            {
                $match: {
                    firstName: { $regex: ".*" + req.body.providername + ".*", $options: "i" },
                    type: "Seller",
                },
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "_id",
                    foreignField: "userid",
                    as: "shop_details",
                },
            },
        ]).exec();
        console.log("Probable providers", providerMatch);
        providerMatch.forEach((item) => {
            item.shop_details.forEach((ele) => {
                shopId.push(ele._id);
            });
        });
        shopId = shopId.map(function (el) { return mongoose.Types.ObjectId(el) })
    }
    console.log(shopId)

    const myCustomLabels = {
        totalDocs: 'itemCount',
        docs: 'itemsList',
        limit: 'perPage',
        page: 'currentPage',
        nextPage: 'next',
        prevPage: 'prev',
        totalPages: 'pageCount',
        hasPrevPage: 'hasPrev',
        hasNextPage: 'hasNext',
        pagingCounter: 'pageCounter',
        meta: 'paginator'
    };

    const options = {
        page: req.params.page,
        limit: 8,
        customLabels: myCustomLabels
    };
    let cat_data = await Service.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();
    console.log("Category: ", cat_data);

    ShopService.aggregatePaginate(ShopService.aggregate(
        [
            (req.query.currency != '' && typeof req.query.currency != 'undefined') ?
                {
                    $match: {
                        currency: req.query.currency
                    }
                } : { $project: { __v: 0 } },
            (req.query.servicename != "" && typeof req.query.servicename != "undefined") ?
                {
                    $match: {
                        name: { $regex: ".*" + req.query.servicename + ".*", $options: "i" },
                        status: true
                    }
                }
                : { $project: { __v: 0 } },
            (req.query.serv_cat_name != "" && typeof req.query.serv_cat_name != "undefined") ?
                {
                    $match: {
                        subcat_name: { $regex: ".*" + req.query.serv_cat_name + ".*", $options: "i" },
                        status: true
                    },
                }
                : { $project: { __v: 0 } },
            shopId.length > 0 ?
                {
                    $match: {
                        shop_id: { $in: shopId },
                        status: true
                    }
                }
                : { $project: { __v: 0 } },
            (req.query.min != "" && typeof req.query.min != "undefined") ||
                (req.query.max != "" && typeof req.query.max != "undefined") ?
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $gte: ["$price", Number(req.query.min)] },
                                { $lte: ["$price", Number(req.query.max)] },
                                { status: true }
                            ]
                        }
                    }
                }
                : { $project: { __v: 0 } },
            {
                $match: {
                    subcategory_id: { $in: [mongoose.Types.ObjectId(id)] },
                    status: true,
                    chataddstatus: false
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "subcategory_id",
                    foreignField: "_id",
                    as: "category_details"
                }
            },
            {
                $unwind: "$category_details"
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "shop_id",
                    foreignField: "_id",
                    as: "shop_details"
                }
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
                    from: "servicewishes",
                    localField: "_id",
                    foreignField: "serv_id",
                    as: "wishlist_data"
                }
            },
            {
                $addFields: {
                    totalWishlistAdded: {
                        $cond: {
                            if: { $isArray: "$wishlist_data" },
                            then: { $size: "$wishlist_data" },
                            else: null
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "servicereviews",
                    localField: "_id",
                    foreignField: "service_id",
                    as: "rev_data",
                }
            },
            {
                $addFields: {
                    avgRating: {
                        $avg: {
                            $map: {
                                input: "$rev_data",
                                in: "$$this.rating"
                            }
                        }
                    }
                }
            },
            typeof req.query.shortby != "undefined" && req.query.shortby == "newarrivals"
                ? { $sort: { _id: -1 } }
                : { $project: { __v: 0 } },

            typeof req.query.shortby != "undefined" && req.query.shortby == "highlow"
                ? { $sort: { price: -1 } }
                : { $project: { __v: 0 } },

            typeof req.query.shortby != "undefined" && req.query.shortby == "lowhigh"
                ? { $sort: { price: 1 } }
                : { $project: { __v: 0 } },

            typeof req.query.shortby != "undefined" && req.query.shortby == "lowhighrev"
                ? { $sort: { avgRating: 1 } }
                : { $project: { __v: 0 } },

            typeof req.query.shortby != "undefined" && req.query.shortby == "highlowrev"
                ? { $sort: { avgRating: -1 } }
                : { $project: { __v: 0 } },

            typeof req.query.shortby != "undefined" && req.query.shortby == "bestselling"
                ? { $sort: { totalAdded: -1 } }
                : { $project: { __v: 0 } },

            typeof req.query.shortby != "undefined" && req.query.shortby == "lowhighsell"
                ? { $sort: { totalAdded: 1 } }
                : { $project: { __v: 0 } },

            typeof req.query.shortby != "undefined" && req.query.shortby == "highlowsell"
                ? { $sort: { totalAdded: -1 } }
                : { $project: { __v: 0 } },
            {
                $project: {
                    __v: 0
                }
            }
        ]
    ), options, function (err, result) {
        console.log(result);
        if (!err) {
            return res.status(200).json({
                status: true,
                message: "All services for this category get successfully.",
                data: result,
                category_data: cat_data

            })
        }
        else {
            return res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err.message
            })
        }
    })

}

module.exports = {
    viewAllServices,
    viewService,
    viewServicePerCategory,
    viewShopServicesPerService
}