var moment = require('moment');

const PRODUCT_CHECKOUTS = require('../../Models/checkout');
const SELLER = require('../../Models/seller');
const SERVICE_CHECKOUTS = require('../../Models/new_service_checkout');
const SERV_CATEGORY = require('../../Models/service');
const SHOP = require('../../Models/shop');
const SHOP_SERVICE = require('../../Models/shop_service');
const TOTAL_COMMISSION = require('../../Models/totalcomission');
const USER = require('../../Models/user');
const PRODUCT_REFUND = require('../../Models/product_refund');

var summaryStats = async (req, res) => {
    var today = new Date();
    var thirtyDaysAgo = today.setDate(today.getDate() - 30);
    var date30DaysBack = new Date(thirtyDaysAgo);
    var lastDay = today.setDate(today.getDate() - 1);
    var lastDate = new Date(lastDay);

    let users = await USER.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    start: {
                        $lt: new Date(req.body.datefrom),
                        $gt: moment.utc(req.body.dateto).toDate()     // endOf('day').toDate()
                    },
                    status: true
                },
            }
            : { $project: { __v: 0 } },
        /**  date filtering for last month */
        req.body.last_month == true
            ? {
                $match: {
                    start: {
                        $lte: moment.utc().toDate(),
                        $gt: date30DaysBack
                    },
                    status: true
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    start: {
                        $lte: moment.utc().toDate(),
                        $gt: lastDate
                    },
                    status: true
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    start: {
                        $gt: today
                    },
                    status: true
                }
            } : { $project: { __v: 0 } },
    ]).exec();
    
    let sellers = await USER.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    start: {
                        $lt: new Date(req.body.datefrom),
                        $gt: moment.utc(req.body.dateto).toDate()     // endOf('day').toDate()
                    },
                    status: true,
                    type: "Seller"
                },
            }
            : { $project: { __v: 0 } },
        /**  date filtering for last month */
        req.body.last_month == true
            ? {
                $match: {
                    start: {
                        $lte: moment.utc().toDate(),
                        $gt: date30DaysBack
                    },
                    status: true,
                    type: "Seller"
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    start: {
                        $lte: moment.utc().toDate(),
                        $gt: lastDate
                    },
                    status: true,
                    type: "Seller"
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    start: {
                        $gt: today
                    },
                    status: true,
                    type: "Seller"
                }
            } : { $project: { __v: 0 } },
    ]).exec();

    let serv_category = await SERV_CATEGORY.find({}).exec();
    
    let shops = await SHOP.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    start: {
                        $lt: new Date(req.body.datefrom),
                        $gt: moment.utc(req.body.dateto).toDate()     // endOf('day').toDate()
                    },
                    status: true
                },
            }
            : { $project: { __v: 0 } },
        /**  date filtering for last month */
        req.body.last_month == true
            ? {
                $match: {
                    start: {
                        $lte: moment.utc().toDate(),
                        $gt: date30DaysBack
                    },
                    status: true
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    start: {
                        $lte: moment.utc().toDate(),
                        $gt: lastDate
                    },
                    status: true
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    start: {
                        $gt: today
                    },
                    status: true
                }
            } : { $project: { __v: 0 } },
    ]).exec();
    
    let shop_service = await SHOP_SERVICE.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    created_on: {   
                        $lt: new Date(req.body.datefrom),
                        $gt: moment.utc(req.body.dateto).toDate()     // endOf('day').toDate()
                    },
                    status: true,
                    chataddstatus: false
                },
            }
            : { $project: { __v: 0 } },
        /**  date filtering for last month */
        req.body.last_month == true
            ? {
                $match: {
                    created_on: {
                        $lte: moment.utc().toDate(),
                        $gt: date30DaysBack
                    },
                    status: true,
                    chataddstatus: false
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    created_on: {
                        $lte: moment.utc().toDate(),
                        $gt: lastDate
                    },
                    status: true,
                    chataddstatus: false
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    created_on: {
                        $gt: today
                    },
                    status: true,
                    chataddstatus: false
                }
            } : { $project: { __v: 0 } },
    ]).exec();

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

// add a separate function for product refunds

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

// add a separate function for service refunds

var totalOrdersNRevenues = async (req, res) => {
    let totalProductRev = await PRODUCT_CHECKOUTS.aggregate([
        {
            $group: {
                _id: "$status",
                numberOfOrders: { $sum: 1 },
                totalRevenue: { $sum: "$total" }
            }
        }
    ]).exec();

    let totalServiceRev = await SERVICE_CHECKOUTS.aggregate([
        {
            $group: {
                _id: "$acceptstatus",
                numberOfOrders: { $sum: 1 },
                totalRevenue: { $sum: "$total" }
            }
        }
    ]).exec();

    return res.status(200).json({
        status: true,
        products: totalProductRev,
        services: totalServiceRev
    });
}

var ordersNRevenuesByDate = async (req, res) => {
    var today = new Date();
    var thirtyDaysAgo = today.setDate(today.getDate() - 30);
    var date30DaysBack = new Date(thirtyDaysAgo);
    var lastDay = today.setDate(today.getDate() - 1);
    var lastDate = new Date(lastDay);

    let totalProductRev = await PRODUCT_CHECKOUTS.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    booking_date: {
                        $lt: new Date(req.body.datefrom),
                        $gte: moment.utc(req.body.dateto).toDate()     // endOf('day').toDate()
                    }
                },
            }
            : { $project: { __v: 0 } },
        /**  date filtering for last month */
        req.body.last_month == true
            ? {
                $match: {
                    booking_date: {
                        $lte: moment.utc().toDate(),
                        $gt: date30DaysBack
                    }
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    booking_date: {
                        $lte: moment.utc().toDate(),
                        $gt: lastDate
                    }
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    booking_date: {
                        $gt: today
                    }
                }
            } : { $project: { __v: 0 } },
        {
            $group: {
                _id: "$status",
                numberOfOrders: { $sum: 1 },
                totalRevenue: { $sum: "$total" }
            }
        }
    ]).exec();

    let totalServiceRev = await SERVICE_CHECKOUTS.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    booking_date: {
                        $lt: new Date(req.body.datefrom),
                        $gte: moment.utc(req.body.dateto).toDate()     // endOf('day').toDate()
                    }
                },
            }
            : { $project: { __v: 0 } },
        /**  date filtering for last month */
        req.body.last_month == true
            ? {
                $match: {
                    booking_date: {
                        $lte: moment.utc().toDate(),
                        $gt: date30DaysBack
                    }
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    booking_date: {
                        $lte: moment.utc().toDate(),
                        $gt: lastDate
                    }
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    booking_date: {
                        $gt: today
                    }
                }
            } : { $project: { __v: 0 } },
        {
            $group: {
                _id: "$acceptstatus",
                numberOfOrders: { $sum: 1 },
                totalRevenue: { $sum: "$total" }
            }
        }
    ]).exec();

    return res.status(200).json({
        status: true,
        products: totalProductRev,
        services: totalServiceRev
    });
}

// add a separate function for total lost revenue to service and product refunds

var totalRevenueNProfit = async (req, res) => {
    let totalSoldProduct = await PRODUCT_CHECKOUTS.find({ status: "true" }).exec();
    // console.log(totalSoldProduct);
    let soldProductRev = 0;
    totalSoldProduct.forEach(element => {
        soldProductRev = soldProductRev + Number(element.total);
        // no action with 'subtotal'
    });
    let productRefund = await PRODUCT_REFUND.find({ request_status: "approved" }).exec();
    let refundValue = 0;
    productRefund.forEach(element => {
        refundValue = refundValue + Number(element.refund_amount);
    });
    var productRevenue = soldProductRev - refundValue;
    console.log("Product revenue", productRevenue);

    let totalServices = await SERVICE_CHECKOUTS.find({}).exec()

    var totalCompletedServices = totalServices.filter(item => item.completestatus == true);
    // console.log(totalCompletedServices);
    let completedServiceRev = 0;
    totalCompletedServices.forEach(element => {
        completedServiceRev = completedServiceRev + Number(element.total);
    });
    console.log("Service revenue", completedServiceRev);

    /**----------calculate service refund value----------*/
    /**--------------------------------------------------*/

    var totalPendingService = totalServices.filter(item => item.acceptstatus == "pending");
    // console.log(totalPendingService);
    let expectedServiceRevenue = 0;
    totalPendingService.forEach(element => {
        expectedServiceRevenue = expectedServiceRevenue + Number(element.total);
    });
    console.log("Expected service revenue", expectedServiceRevenue);

    let sellerTotalCommissions = await TOTAL_COMMISSION.find({}).exec();

    let paidTotalCommissions = 0;
    sellerTotalCommissions.forEach(element => {
        paidTotalCommissions = paidTotalCommissions + Number(element.comission_total);
    });
    console.log("Total commision paid ", paidTotalCommissions);

    var totalRevenue = productRevenue + completedServiceRev;
    console.log("Total revenue ", totalRevenue);

    var profit = totalRevenue - paidTotalCommissions;
    console.log("Profit ", profit);

    return res.status(200).json({
        status: true,
        today_date: Date().toString(),
        total_revenue: totalRevenue,
        total_seller_commission: paidTotalCommissions,
        website_profit: profit,
        expected_service_revenue: expectedServiceRevenue
    });
}

module.exports = {
    summaryStats,
    productSalesReport,
    serviceSalesReport,
    totalOrdersNRevenues,
    ordersNRevenuesByDate,
    totalRevenueNProfit
}