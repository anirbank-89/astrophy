var mongoose = require('mongoose');

var Product = require('../../Models/product');

const viewProductList = async (req, res) => {
    var userid = req.params.userid;

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

    Product.aggregatePaginate(Product.aggregate(
        [
            (req.query.currency != '' && typeof req.query.currency != 'undefined') ?
                {
                    $match: {
                        currency: req.query.currency
                    }
                } : { $project: { __v: 0 } },
            req.query.delivery != "" && typeof req.query.delivery != "undefined"
                ? {
                    $match: { delivery: { $in: [req.query.delivery.toString()] } },
                }
                : { $project: { __v: 0 } },
            (req.query.min != "" && typeof req.query.min != "undefined") ||
                (req.query.max != "" && typeof req.query.max != "undefined")
                ? {
                    $match: {
                        $expr: {
                            $and: [
                                { $gte: ["$selling_price", Number(req.query.min)] },
                                { $lte: ["$selling_price", Number(req.query.max)] },
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
                    as: "category_data"
                }
            },
            // (req.params.userid != '' && typeof req.params.userid != 'undefined') ?
            {
                $lookup: {
                    from: "carts",
                    let: {
                        product_id: "$_id",
                        user_id: mongoose.Types.ObjectId(userid),
                        status: true
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$prod_id", "$$product_id"] },
                                        { $eq: ["$user_id", "$$user_id"] }, 
                                        { $eq: ["$status", "$$status"] }
                                    ],
                                },
                            },
                        },
                    ],
                    as: "cart_details",
                },
            },
            {
                $addFields: {
                    totalAdded: {
                        $cond: {
                            if: { $isArray: "$cart_details" },
                            then: { $size: "$cart_details" },
                            else: null,
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "wishlists",
                    let: {
                        prod_id: "$_id", 
                        user_id: mongoose.Types.ObjectId(userid), 
                        status: true
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$prod_id", "$$prod_id"] }, 
                                        { $eq: ["$user_id", "$$user_id"] }, 
                                        { $eq: ["$status", "$$status"]}
                                    ]
                                }
                            }
                        }
                    ],
                    as: "wishlist_data",
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
                    from: "reviews",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "review_data",
                }
            },
            {
                $addFields: {
                    avgRating: {
                        $avg: {
                            $map: {
                                input: "$review_data",
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
                ? { $sort: { selling_price: -1 } }
                : { $project: { __v: 0 } },

            typeof req.query.shortby != "undefined" && req.query.shortby == "lowhigh"
                ? { $sort: { selling_price: 1 } }
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
                    _v: 0,
                    //    avg : { $avg : '$review_data.rating' } 
                }
            }
        ]
    ), options, function (err, result) {
        if (!err) {
            console.log(result);
            return res.status(200).json({
                status: true,
                message: 'Product Data Get Successfully',
                data: result
            })
        } else {
            return res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err,
            });
        }
    })

}

const viewSingleProduct = async (req, res) => {
    let id = req.params.id;
    // return Product.findOne(
    //     {_id: { $in : [mongoose.Types.ObjectId(id)] } },
    //     (err,docs)=>{
    //     if(err){
    //         res.status(400).json({
    //             status: false,
    //             message: "Server error. Data not available",
    //             error: err
    //         });
    //     }
    //     else {
    //         res.status(200).json({
    //             status: true,
    //             message: "Product get successfully",
    //             data: docs
    //         });
    //     }
    // });
    return Product.aggregate(
        [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "catID",
                    foreignField: "_id",
                    as: "category_data"
                }
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "review_data",
                }
            },
            {
                $lookup: {
                    from: "wishlists",
                    localField: "_id",
                    foreignField: "prod_id",
                    as: "wishlist_data",
                }
            },
            {
                $addFields: {
                    avgRating: {
                        $avg: {
                            $map: {
                                input: "$review_data",
                                in: "$$this.rating"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _v: 0,
                    //    avg : { $avg : '$review_data.rating' } 
                }
            }
        ]
    ).then((data) => {
        res.status(200).json({
            status: true,
            message: 'Product Data Get Successfully',
            data: data
        })
    })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err,
            });
        })
}

module.exports = {
    viewProductList,
    viewSingleProduct,
}