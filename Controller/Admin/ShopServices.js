var mongoose = require('mongoose');

var User = require('../../Models/user');
const SERVICE_CHECKOUTS = require('../../Models/servicecheckout');
const SUBCATEGORIES = require('../../Models/service');

const viewTopServiceProvider = async (req, res) => {
    User
        .aggregate(
            [
                {
                    $match: { type: { $in: ["Seller"] } },
                },
                {
                    $lookup: {
                        from: "shops",
                        localField: "_id",
                        foreignField: "userid",
                        as: "shop_data"
                    }
                },
                {
                    $unwind: "$shop_data"
                },
                {
                    $lookup: {
                        from: "shop_services",
                        localField: "shop_data._id",
                        foreignField: "shop_id",
                        as: "service_data"
                    }
                },
                // {
                //     $lookup: {
                //         from: "servicecarts",
                //         let: {serv_id: "$service_data._id"},
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $and: [{$eq: ["$serv_id", "$$serv_id"]}]
                //                     }
                //                 }
                //             },
                //             {
                //                 $count: "sales_yesterday"
                //             }
                //         ],
                //         as: "sales_data"
                //     }
                // },
                {
                    $lookup: {
                        from: "servicereviews",
                        localField: "service_data._id",
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

                { $sort: { priority: 1 } },
                {
                    $project: {
                        _v: 0
                    }
                }


            ]
        )
        .then((data) => {
            res.status(200).json({
                status: true,
                message: "Top Provider get successfully",
                data: data
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err
            });
        });
}

var lastDayMostSalesPerSeller = async (req, res) => {
    return SERVICE_CHECKOUTS.aggregate([
        {
            $match: {
                $and: [
                    { booking_date: { $gt: new Date(req.body.last_date) } },
                    { booking_date: { $lt: new Date(req.body.this_date) } }
                ]
            }
        },
        {
            $group: {
                _id: "$seller_id"
            }
        },
        {
            $lookup: {
                from: 'servicecarts',
                let: {
                    'seller_id': '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$seller_id", "$$seller_id"] },
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: "$serv_id", totalCount: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { totalCount: -1 }
                    },
                    { $limit: 1 }
                ],
                as: 'cart_data'
            }
        },
        // {
        //     $unwind:"$cart_data"
        // },
        {
            $lookup: {
                from: "shop_services",
                localField: "cart_data._id",
                foreignField: "_id",
                as: "service_data"
            }
        },
        // {
        //     $unwind:"$service_data"
        // },
        {
            $lookup: {
                from: "services",
                localField: "service_data.category_id",
                foreignField: "_id",
                as: "category_data"
            }
        },
        // {
        //     $unwind:"$category_data"
        // },
        {
            $lookup: {
                from: "shops",
                localField: "service_data.shop_id",
                foreignField: "_id",
                as: "shop_data"
            }
        },
        // {
        //     $unwind:"$shop_data"
        // },
        {
            $lookup: {
                from: "users",
                localField: "shop_data.userid",
                foreignField: "_id",
                as: "provider_data"
            }
        },
        // {
        //     $unwind:"$provider_data"
        // },
        {
            $project: {
                _v: 0
            }
        },
        // {
        //     $lookup:{
        //         from:"servicereviews",
        //         localField:"service_data._id",
        //         foreignField: "service_id",
        //         as:"rev_data",
        //     }
        // },
        // {
        //     $addFields: {
        //         avgRating: {
        //             $avg: {
        //                 $map: {
        //                     input: "$rev_data",
        //                     in: "$$this.rating"
        //                 }
        //             }
        //         }
        //     }
        // },
    ])
        .then(data => {
            res.status(200).json({
                status: true,
                message: "Data successfully get.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to get data. Server error.",
                error: err.message
            });
        })
}

var shopServicesByCat = async (req, res) => {
    return SUBCATEGORIES.aggregate([
        {
            $lookup: {
                from: "shop_services",
                localField: "_id",
                foreignField: "subcategory_id",
                as: "service_data"
            }
        },
        {
            $addFields: {
                no_of_services: {
                    $cond:
                    { if: { $isArray: "$service_data" }, then: { $size: "$service_data" }, else: 0 }
                }
            }
        }
        // {
        //     $group: {
        //         _id: "$name",
        //         numberOfServices: {}
        //     }
        // }
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

module.exports = {
    viewTopServiceProvider,
    lastDayMostSalesPerSeller,
    shopServicesByCat
}