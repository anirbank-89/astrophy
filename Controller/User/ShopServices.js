var mongoose = require('mongoose')
const { Validator } = require('node-input-validator')

var ShopService = require('../../Models/shop_service')
var serviceCart = require('../../Models/servicecart')
var User = require("../../Models/user")
var Upload = require('../../service/upload')

const register = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        details: "required",
        cat_name: "required",
        subcat_name: "required",
        currency: "required",
        price: "required"
    })
    let matched = v.check().then((val) => val)
    if (!matched) {
        res.status(400).send({ status: false, errors: v.errors })
    }

    // var taxRate = req.body.tax_rate + "%"
    // var totalPrice = req.body.price + ((req.body.price * req.body.tax_rate)/100)
    console.log(req.file)
    // let image_url = await Upload.uploadFile(req, "shop_services")
    let shopServiceData = {
        _id: mongoose.Types.ObjectId(),
        shop_id: mongoose.Types.ObjectId(req.body.shop_id),
        seller_id: mongoose.Types.ObjectId(req.body.seller_id),
        category_id: mongoose.Types.ObjectId(req.body.category_id),
        subcategory_id: mongoose.Types.ObjectId(req.body.subcategory_id),
        name: req.body.name,
        details: req.body.details,
        cat_name: req.body.cat_name,
        subcat_name: req.body.subcat_name,
        currency: req.body.currency,
        price: req.body.price
    }
    // tax: taxRate,
    if (typeof (req.body.personalization) != 'undefined' || req.body.personalization != '') {
        shopServiceData.personalization = req.body.personalization
    }
    if (typeof (req.body.hashtags) != 'undefined' || req.body.hashtags != '') {
        shopServiceData.hashtags = req.body.hashtags
    }
    if (typeof (req.body.image) == 'undefined' || req.body.image == '' || req.body.image == null) {
        shopServiceData.image = null
    } else {
        shopServiceData.image = JSON.parse(req.body.image)
    }

    let shop_service = new ShopService(shopServiceData)
    shop_service.save()
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "Shop's service created sucessfully!",
                data: docs
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again",
                errors: err.message
            })
        })
}

const shopserviceImageUrl = async (req, res) => {
    let imagUrl = '';
    let image_url = await Upload.uploadFile(req, "shop_services")
    if (typeof (req.file) != 'undefined' || req.file != '' || req.file != null) {
        imagUrl = image_url
    }

    return res.status(200).send({
        status: true,
        data: imagUrl,
        error: null
    })
}

const viewAllShopServices = async (req, res) => {
    // var all_services = await ShopService.find({status: true}).exec();

    // return res.send(all_services)
    ShopService
        .aggregate(
            [
                {
                    $match: {
                        status: true
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category_id",
                        foreignField: "_id",
                        as: "category_data"
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
                message: "Shops get successfully",
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

const viewShopServicesPerSeller = async (req, res) => {
    var id = req.params.id          // shop_id of shop_services

    ShopService.find(
        {
            shop_id: { $in: [mongoose.Types.ObjectId(id)] }, 
            status: true
        }
    )
        .then((data) => {
            if (data == null || data == '') {
                res.status(200).json({
                    status: true,
                    message: "This seller doesn't have any services currently.",
                    data: data
                })
            }
            else {
                ShopService.aggregate(
                    [
                        {
                            $match: {
                                shop_id: { $in: [mongoose.Types.ObjectId(id)] },
                                chataddstatus: false

                            }
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
                                            input: "$review_data",
                                            in: "$$this.rating"
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _v: 0
                            }
                        }
                    ]
                )
                    .then((docs) => {
                        res.status(200).json({
                            status: true,
                            message: "All services of this shop get successfully.",
                            data: docs
                        })
                    })
                    .catch((fault) => {
                        res.status(400).json({
                            status: false,
                            message: "Service error2. Please try again",
                            error: fault
                        })
                    })
            }
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err
            })
        })
}

const viewOneService = async (req, res) => {
    var id = req.params.id          // _id of shop_services

    let shopServiceData = await ShopService.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();

    if (shopServiceData == null || shopServiceData == '') {
        return res.status(500).json({
            status: false,
            message: "Invalid id. Server error.",
            data: null
        })
    }
    else {
        // Incrementing the count of page view by 1
        if (shopServiceData.pageViews == null ||
            shopServiceData.pageViews == "" ||
            typeof shopServiceData.pageViews == "undefined"
        ) {
            shopServiceData.pageViews = 1;
        }
        else {
            shopServiceData.pageViews += 1;
        }

        // Saving to the database
        let newPageView = await shopServiceData.save();

        let docs = await ShopService.aggregate(
            [
                {
                    $match: {
                        _id: { $in: [mongoose.Types.ObjectId(id)] }
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
                // {
                //     $addFields:{
                //         total_sales:{
                //             $size:{
                //                 $filter:{
                //                     input: "$servicecarts",
                //                     as: "shop_service_sales",
                //                     cond:{
                //                         serv_id: {$in: [mongoose.Types.ObjectId(id)]}
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // },
                {
                    $lookup: {
                        from: 'servicecarts',
                        localField: "_id",
                        foreignField: "serv_id",
                        as: 'cart_data'
                    }
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
                    $unwind: {
                        path: "$shop_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "shop_details.userid",
                        foreignField: "_id",
                        as: 'shop_details.user_data'
                    }
                },
                {
                    $unwind: {
                        path: "$shop_details.user_data",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _v: 0
                    }
                }
            ]
        ).exec();

        return res.status(200).json({
            status: true,
            message: "Data get successfully.",
            data: docs
        });
    }
}

const update = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        details: "required",
        cat_name: "required",
        subcat_name: "required",
        currency: "required",
        price: "required"
    })

    let matched = await v.check().then((val) => val);
    if (!matched) {
        return res.status(200).send({
            status: false,
            error: v.errors
        });
    }
    console.log(req.file)
    // if(typeof(req.body.image)!='undefined' || req.body.image!='' || req.body.image!=null){
    //     req.body.image = JSON.parse(req.body.image)
    // }
    if (typeof (req.body.personalization) != 'undefined' || req.body.personalization != '') {
        req.body.personalization = req.body.personalization
    }
    if (typeof (req.body.hashtags) != 'undefined' || req.body.hashtags != '') {
        req.body.hashtags = req.body.hashtags
    }
    if (typeof (req.body.image) == 'undefined' || req.body.image == '' || req.body.image == null) {
        req.body.image = null
    } else {
        req.body.image = JSON.parse(req.body.image)
    }

    let id = req.params.id
    return ShopService.findOneAndUpdate(
        { _id: { $in: [mongoose.Types.ObjectId(id)] } },
        req.body,
        async (err, docs) => {
            if (err) {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err
                });
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "Shop service updated successfully!",
                    data: docs
                });
            }
        }
    )
}

const deactivateService = async (req, res) => {
    var id = req.params.id;

    return ShopService.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { status: false } },
        { new: true }
    )
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data successfully edited.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err.message
            });
        });
}

const deleteService = async (req, res) => {
    var id = req.params.id;

    return ShopService.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) })
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data successfully deleted.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err.message
            });
        });
}

const chatServiceregister = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        details: "required",
        currency: "required",
        price: "required"
    })
    let matched = v.check().then((val) => val)
    if (!matched) {
        res.status(400).json({ status: false, errors: v.errors })
    }
    console.log(req.file)
    let image_url = await Upload.uploadFile(req, "shop_services")
    let shopServiceData = {
        _id: mongoose.Types.ObjectId(),
        shop_id: mongoose.Types.ObjectId(req.body.shop_id),
        seller_id: mongoose.Types.ObjectId(req.body.seller_id),
        name: req.body.name,
        price: req.body.price,
        details: req.body.details,
        currency: req.body.currency,
        price: req.body.price,
        chataddstatus: true
    }
    if (typeof (req.body.personalization) != 'undefined' || req.body.personalization != '') {
        shopServiceData.personalization = req.body.personalization
    }
    if (typeof (req.body.hashtags) != 'undefined' || req.body.hashtags != '') {
        shopServiceData.hashtags = req.body.hashtags
    }
    if (typeof (req.file) != 'undefined' || req.file != '' || req.file != null) {
        shopServiceData.image = image_url
    }

    let shop_service = new ShopService(shopServiceData)
    shop_service.save()
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "Shop's service created sucessfully!",
                data: docs
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again",
                errors: err
            })
        })

}

const chatImageUrl = async (req, res) => {
    let imagUrl = '';
    let image_url = await Upload.uploadFile(req, "chat")
    if (typeof (req.file) != 'undefined' || req.file != '' || req.file != null) {
        imagUrl = image_url
    }

    return res.status(200).send({
        status: true,
        data: imagUrl,
        error: null
    })
}

const salesCount = async (req, res) => {
    var id = req.params.id
    var in_cart = await serviceCart.find(
        { serv_id: mongoose.Types.ObjectId(id) }
    ).exec()

    console.log(in_cart)

    var sales_count = in_cart.length;
    console.log("sales count", sales_count);

    if (in_cart != null || in_cart != "") {
        if (sales_count > 1) {
            return res.status(200).json({
                status: true,
                message: "Get number of sales",
                number: sales_count
            });
        }
        else {
            return res.status(200).json({
                status: true,
                message: "This shop service hasn't made any sale.",
                number: 0
            });
        }
    }
    else {
        return res.status(500).json({
            status: false,
            message: "Invalid id. Server error.",
            data: in_cart
        })
    }
}

const viewTopServiceProvider = async (req, res) => {
    // var all_services = await ShopService.find({status: true}).exec();

    // return res.send(all_services)
    // ServiceCheckout
    // .aggregate(
    //     [
    //         {
    //             $group : {
    //                 _id:"$seller_id"
    //             }
    //         },
    //         {
    //             $lookup:{
    //                 from:'servicecarts',
    //                 let:{
    //                     'seller_id':'$_id'
    //                 },
    //                 pipeline: [
    //                     {
    //                       $match: {
    //                         $expr: {
    //                           $and: [
    //                             { $eq: ["$seller_id", "$$seller_id"] },
    //                           ],
    //                         },
    //                       },
    //                     },
    //                     {
    //                         $group : {
    //                             _id:"$serv_id",totalCount :{$sum:1}
    //                         }
    //                     },
    //                     {
    //                         $sort:{totalCount:-1}
    //                     },
    //                     {$limit: 1}
    //                   ],
    //                 as:'cart_data'
    //             }
    //         },
    //         {
    //             $unwind:"$cart_data"
    //         },
    //         {
    //             $lookup:{
    //                 from:"servicereviews",
    //                 localField:"service_data._id",
    //                 foreignField: "service_id",
    //                 as:"rev_data",
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 avgRating: {
    //                     $avg: {
    //                         $map: {
    //                             input: "$rev_data",
    //                             in: "$$this.rating"
    //                         }
    //                     }
    //                 }
    //             }
    //         },


    //     ]
    // ).exec()

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
                {
                    $project: {
                        _v: 0
                    }
                },
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

const viewSingleServiceProvider = async (req, res) => {

    User
        .aggregate(
            [
                {
                    $match: { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
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
                {
                    $project: {
                        _v: 0
                    }
                },
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


            ]
        )
        .then((data) => {
            res.status(200).json({
                status: true,
                message: "Single Provider get successfully",
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

const viewAllshopservicelist = async (req, res) => {
    let id = req.params.id
    ShopService.aggregate(
        [
            {
                $match: {
                    shop_id: { $in: [mongoose.Types.ObjectId(id)] }
                }
            },
            {
                $project: {
                    _v: 0
                }
            }
        ]
    )
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "This shop service get successfully",
                data: docs
            })
        })
        .catch((fault) => {
            res.status(500).json({

                status: false,
                message: "Server error2. Please try again.",
                error: fault
            })
        })

}

const viewAllrelatedService = async (req, res) => {
    let id = req.body.cat_id
    ShopService.aggregate(
        [
            {
                $match: {
                    category_id: { $in: [mongoose.Types.ObjectId(id)] },
                    _id: { $nin: [mongoose.Types.ObjectId(req.body.service_id)] }
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_data",
                }
            },
            {
                $unwind: "$category_data"
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
            {
                $lookup: {
                    from: 'servicecarts',
                    localField: "_id",
                    foreignField: "serv_id",
                    as: 'cart_data'
                }
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
                $unwind: {
                    path: "$shop_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "shop_details.userid",
                    foreignField: "_id",
                    as: 'shop_details.user_data'
                }
            },
            {
                $unwind: {
                    path: "$shop_details.user_data",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _v: 0
                }
            }
        ]
    )
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "This shop service get successfully",
                data: docs
            })
        })
        .catch((fault) => {
            res.status(500).json({

                status: false,
                message: "Server error2. Please try again.",
                error: fault
            })
        })

}

module.exports = {
    register,
    shopserviceImageUrl,
    viewAllShopServices,
    viewShopServicesPerSeller,
    viewOneService,
    update,
    deactivateService,
    deleteService,
    chatServiceregister,
    chatImageUrl,
    salesCount,
    viewTopServiceProvider,
    viewAllshopservicelist,
    viewAllrelatedService,
    viewSingleServiceProvider
}