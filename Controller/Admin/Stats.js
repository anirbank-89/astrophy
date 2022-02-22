var moment = require('moment');

const USER = require('../../Models/user');
const SHOP = require('../../Models/shop');
const SHOP_SERVICE = require('../../Models/shop_service');
const SERV_CATEGORY = require('../../Models/service');
const PRODUCT_CHECKOUTS = require('../../Models/checkout');
const SERVICE_CHECKOUTS = require('../../Models/new_service_checkout');
const SERVICE_CART = require('../../Models/new_servicecart');
const SERVICE_COMMISSIONS = require('../../Models/servicecommission');
// PRODUCT_REFUND
// SERVICE_REFUND

var summaryStats = async (req, res) => {
    var today =  new Date(); // moment.utc().toDate();
    var thirtyDaysAgo = new Date().setDate(today.getDate() - 30);
    var date30DaysBack = new Date(thirtyDaysAgo);
    var lastDay = new Date().setDate(today.getDate() - 1);
    var lastDate = new Date(lastDay);

    console.log("Today ", today);
    console.log("Yesterday ", lastDate);
    console.log("30 days back ", date30DaysBack);

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
                        $lt: today,
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
                        $lt: today,
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
                        $lt: today,
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
                        $lt: today,
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
                        $lt: today,
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
                        $lt: today,
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
                        $lt: today,
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
                        $lt: today,
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
    var today =  new Date(); // moment.utc().toDate();
    var thirtyDaysAgo = new Date().setDate(today.getDate() - 30);
    var date30DaysBack = new Date(thirtyDaysAgo);
    var lastDay = new Date().setDate(today.getDate() - 1);
    var lastDate = new Date(lastDay);

    console.log("Today ", today);
    console.log("Yesterday ", lastDate);
    console.log("30 days back ", date30DaysBack);

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
    var today =  new Date(); // moment.utc().toDate();
    var thirtyDaysAgo = new Date().setDate(today.getDate() - 30);
    var date30DaysBack = new Date(thirtyDaysAgo);
    var lastDay = new Date().setDate(today.getDate() - 1);
    var lastDate = new Date(lastDay);

    console.log("Today ", today);
    console.log("Yesterday ", lastDate);
    console.log("30 days back ", date30DaysBack);

    let productSales = await PRODUCT_CHECKOUTS.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    booking_date: {
                        $lt: new Date(req.body.datefrom),
                        $gt: moment.utc(req.body.dateto).toDate()     // endOf('day').toDate()
                    },
                    status: "true"
                },
            }
            : { $project: { __v: 0 } },
        /**  date filtering for last month */
        req.body.last_month == true
            ? {
                $match: {
                    booking_date: {
                        $lt: today,
                        $gt: date30DaysBack
                    },
                    status: "true"
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    booking_date: {
                        $lt: today,
                        $gt: lastDate
                    },
                    status: "true"
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    booking_date: {
                        $gt: lastDate,
                        $lte: moment.utc().endOf('day').toDate()
                    },
                    status: "true"
                }
            } : { $project: { __v: 0 } }
    ]).exec();

    let productRev = 0;
    productSales.forEach(element => {
        productRev = productRev + element.total;
    });

    let serviceSales = await SERVICE_CART.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    booking_date: {
                        $lt: new Date(req.body.datefrom),
                        $gt: moment.utc(req.body.dateto).toDate()     // endOf('day').toDate()
                    },
                    status: false,
                    refund_request: ""
                },
            }
            : { $project: { __v: 0 } },
        /**  date filtering for last month */
        req.body.last_month == true
            ? {
                $match: {
                    booking_date: {
                        $lt: today,
                        $gt: date30DaysBack
                    },
                    status: false,
                    refund_request: ""
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    booking_date: {
                        $lt: today,
                        $gt: lastDate
                    },
                    status: false,
                    refund_request: ""
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    booking_date: {
                        $gt: lastDate,
                        $lte: moment.utc().endOf('day').toDate()
                    },
                    status: false,
                    refund_request: ""
                }
            } : { $project: { __v: 0 } }
    ]).exec();

    let serviceRev = 0;
    serviceSales.forEach(element => {
        totalPrice = element.price - ((element.price*element.discount_percent)/100);
        serviceRev = productRev + totalPrice;
    });

    var totalRev = productRev + serviceRev;

    let sellerCommissions = await SERVICE_COMMISSIONS.aggregate([
        /** date filtering for custom period selection */
        (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    created_on: {
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
                    created_on: {
                        $lt: today,
                        $gt: date30DaysBack
                    },
                    status: true
                }
            } : { $project: { __v: 0 } },
        /** date filtering for yesterday */
        req.body.yesterday == true
            ? {
                $match: {
                    created_on: {
                        $lt: today,
                        $gt: lastDate
                    },
                    status: true
                }
            } : { $project: { __v: 0 } },
        /** date filtering for today */
        req.body.today == true
            ? {
                $match: {
                    created_on: {
                        $gt: lastDate,
                        $lte: moment.utc().endOf('day').toDate()
                    },
                    status: true
                }
            } : { $project: { __v: 0 } }
    ]).exec();

    let comValue = 0;
    sellerCommissions.forEach(item => {
        comValue = comValue + item.seller_commission;
    });

    // product, service refunds calcution

    var profit = totalRev - comValue;

    return res.status(200).json({
        status: true,
        today_date: Date().toString(),
        total_revenue: totalRev,
        total_seller_commission: comValue,
        website_profit: profit
        // expected_service_revenue: expectedServiceRevenue
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