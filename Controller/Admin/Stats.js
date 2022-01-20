const PRODUCT_CHECKOUTS = require('../../Models/checkout');
const SELLER = require('../../Models/seller');
const SERVICE_CHECKOUTS = require('../../Models/servicecheckout');
const SERV_CATEGORY = require('../../Models/service');
const SHOP = require('../../Models/shop');
const SHOP_SERVICE = require('../../Models/shop_service');
const TOTAL_COMMISSION = require('../../Models/totalcomission');
const USER = require('../../Models/user');

var summaryStats = async (req, res) => {
    let users = await USER.find({ status: true }).exec();
    let sellers = await SELLER.find({ seller_status: true }).exec(); //
    let serv_category = await SERV_CATEGORY.find({}).exec();
    let shops = await SHOP.find({ status: true }).exec();
    let shop_service = await SHOP_SERVICE.find({ status: true }).exec();

    return res.status(200).json({
        status: true,
        message: "Data successfully get.",
        active_users: users.length,
        approved_sellers: sellers.length,
        serv_category: serv_category.length,
        active_shops: shops.length,
        active_shop_services: shop_service.length
    });
}

var productSalesReport = async (req, res) => {
    return PRODUCT_CHECKOUTS.aggregate([
        (req.body.start_date != "" || typeof req.body.start_date != "undefined") &&
            (req.body.end_date != "" || typeof req.body.end_date != "undefined")
            ? {
                $match: {
                    $and: [
                        { booking_date: { $gt: new Date(req.body.start_date) } },
                        { booking_date: { $lt: new Date(req.body.end_date) } },
                    ]
                }
            }
            : {
                $group: {
                    _id: {
                        date: { $dateToString: { date: "$booking_date", format: "%Y-%m-%d" } },
                        country: "$country"
                    },
                    salesValue: { $sum: "$subtotal" },
                }
            },
        {
            $group: {
                _id: {
                    date: { $dateToString: { date: "$booking_date", format: "%Y-%m-%d" } },
                    country: "$country"
                },
                salesValue: { $sum: "$subtotal" },
            }
        },
        {
            $sort: {
                "_id.date": 1
            }
        }
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
                message: "Enter both start date and end date.",
                error: err
            });
        });
}

var serviceSalesReport = async (req, res) => {
    return SERVICE_CHECKOUTS.aggregate([
        (req.body.start_date != "" || typeof req.body.start_date != "undefined") &&
            (req.body.end_date != "" || typeof req.body.end_date != "undefined")
            ? {
                $match: {
                    $and: [
                        { booking_date: { $gt: new Date(req.body.start_date) } },
                        { booking_date: { $lt: new Date(req.body.end_date) } },
                    ]
                }
            }
            : {
                $group: {
                    _id: {
                        date: { $dateToString: { date: "$booking_date", format: "%Y-%m-%d" } },
                        country: "$country"
                    },
                    salesValue: { $sum: "$subtotal" },
                }
            },
        {
            $group: {
                _id: {
                    date: { $dateToString: { date: "$booking_date", format: "%Y-%m-%d" } },
                    country: "$country"
                },
                salesValue: { $sum: "$subtotal" },
            }
        },
        {
            $sort: {
                "_id.date": 1
            }
        }
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
                message: "Enter both start date and end date.",
                error: err
            });
        });
}

module.exports = {
    summaryStats,
    productSalesReport,
    serviceSalesReport
}