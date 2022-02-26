var mongoose = require('mongoose');
var moment = require('moment');

var User = require('../../Models/user');
const SERVICE_CHECKOUTS = require('../../Models/new_service_checkout');
const SERVICE_CARTS = require('../../Models/new_servicecart');
const SHOP_SERVICES = require('../../Models/shop_service');

var getAllServices = async (req, res) => {
    return SHOP_SERVICES.aggregate([
        {
            $lookup: {
                from: "shops",
                localField: "shop_id",
                foreignField: "_id",
                as: "shop_data"
            }
        },
        {
            $unwind: {
                path: "$shop_data",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "seller_id",
                foreignField: "_id",
                as: "user_data"
            }
        },
        {
            $unwind: {
                path: "$user_data",
                preserveNullAndEmptyArrays: true
            }
        }
    ])
        .then(data => {
            res.status(200).json({
                status: true,
                message: "Shop services get successfully.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to get data. Server error.",
                error: err
            });
        });
}

var deactivateShopServ = async (req, res) => {
    var id = req.params.id;

    return SHOP_SERVICES.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { status: false } },
        { new: true }
    )
        .then(data => {
            res.status(200).json({
                status: true,
                message: "Shop service has been deactivated.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err
            });
        });
}

var activateShopServ = async (req, res) => {
    var id = req.params.id;

    return SHOP_SERVICES.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { status: true } },
        { new: true }
    )
        .then(data => {
            res.status(200).json({
                status: true,
                message: "Shop service has been activated.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err
            });
        });
}

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

                {
                    $sort: {
                        _id: -1,
                        priority: 1
                    }
                },
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
    console.log(moment.utc(req.body.last_date).startOf('day').toDate());
    console.log(moment.utc(req.body.last_date).endOf('day').toDate());

    return SERVICE_CARTS.aggregate([
        {
            $match: {
                // $and: [
                //     { booking_date: { $gt: new Date(req.body.last_date) } },
                //     { booking_date: { $lt: new Date(req.body.this_date) } }
                // ]
                booking_date: {
                    $gt: moment.utc(req.body.last_date).startOf('day').toDate(),
                    $lte: moment.utc(req.body.last_date).endOf('day').toDate()
                },
                status: false
            }
        },
        // {
        //     $lookup: {
                // from: 'new_servicecarts',
                // let: {
                //     'seller_id': '$_id'
                // },
                // pipeline: [
                //     {
                //         $match: {
                //             $expr: {
                //                 $and: [
                //                     { $eq: ["$seller_id", "$$seller_id"] },
                //                 ],
                //             },
                //         },
                //     },
                //     {
                //         $group: {
                //             _id: "$serv_id", totalCount: { $sum: 1 }
                //         }
                //     },
                //     {
                //         $sort: { totalCount: -1 }
                //     },
                //     { $limit: 1 }
                // ],
        //         as: 'commission_data'
        //     }
        // },
        // {
        //     $unwind:"$cart_data"
        // },
        {
            $lookup: {
                from: "shop_services",
                localField: "serv_id",
                foreignField: "_id",
                as: "service_data"
            }
        },
        {
            $unwind: {
                path: "$service_data",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "services",
                localField: "service_data.subcategory_id",
                foreignField: "_id",
                as: "service_data.category_data"
            }
        },
        {
            $unwind: {
                path: "$service_data.category_data",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "shops",
                localField: "service_data.shop_id",
                foreignField: "_id",
                as: "service_data.shop_data"
            }
        },
        {
            $unwind: {
                path: "$service_data.shop_data",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "service_data.seller_id",
                foreignField: "_id",
                as: "service_data.seller_data"
            }
        },
        {
            $unwind: {
                path: "$service_data.seller_data",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: "$serv_id",
                totalSalesValue: { $sum: "$price" },  // calculating discount amount and subtracting from 'price'
                providerData: { $push: "$service_data" }
            }
        },
        {
            $sort: { totalSalesValue: -1 }
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
    // return SUBCATEGORIES.aggregate([
    // {
    //     $lookup: {
    //         from: "shop_services",
    //         localField: "_id",
    //         foreignField: "subcategory_id",
    //         as: "service_data"
    //     }
    // },
    // {
    //     $addFields: {
    //         no_of_services: {
    //             $cond:
    //             { if: { $isArray: "$service_data" }, then: { $size: "$service_data" }, else: 0 }
    //         }
    //     }
    // }
    let shopServices = await SHOP_SERVICES.aggregate([
        {
            $match: {
                subcategory_id: mongoose.Types.ObjectId(req.body.subcat_id),
                // chataddstatus: false
            }
        },
        {
            $lookup: {
                from: "new_servicecarts",
                let: { serv_id: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$serv_id", "$$serv_id"]},
                                    { status: false }
                                ]
                            }
                        }
                    }
                ],
                as: "cart_data"
            }
        },
        {
            $addFields: {
                totalSalesValue: {
                    $sum: {
                        $map: {
                            input: "$cart_data",
                            in: "$$this.price"
                        }
                    }
                }
            }
        },
        {
            $sort: {
                pageViews: -1,
                totalSalesValue: -1
            }
        },
        {
            $project: { __v: 0 }
        }
    ]).exec();

    if (shopServices.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: shopServices
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No service available for this category.",
            data: []
        });
    }
}

module.exports = {
    getAllServices,
    deactivateShopServ,
    activateShopServ,
    viewTopServiceProvider,
    lastDayMostSalesPerSeller,
    shopServicesByCat
}