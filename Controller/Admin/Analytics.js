const PRODUCT_CHECKOUTS = require('../../Models/checkout');
const SERVICE_CHECKOUTS = require('../../Models/servicecheckout');
const TOTAL_COMMISSION = require('../../Models/totalcomission');

var totalOrdersNRevenues = async (req,res) => {
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

var totalRevenueNProfit = async (req,res) => {
    let totalSoldProduct = await PRODUCT_CHECKOUTS.find({ status: "true" }).exec();
    // console.log(totalSoldProduct);
    let soldProductRev = 0;
    totalSoldProduct.forEach(element => {
        soldProductRev = soldProductRev + Number(element.total);
        // no action with 'subtotal'
    });
    console.log("Product revenue", soldProductRev);
    
    let totalServices = await SERVICE_CHECKOUTS.find({}).exec()
    
    var totalCompletedServices = totalServices.filter(item => item.acceptstatus == "accept");
    // console.log(totalCompletedServices);
    let completedServiceRev = 0;
    totalCompletedServices.forEach(element => {
        completedServiceRev = completedServiceRev + Number(element.total);
    });
    console.log("Service revenue", completedServiceRev);

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

    var totalRevenue = soldProductRev + completedServiceRev;
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

var productSalesReport = async (req,res) => {
    return PRODUCT_CHECKOUTS.aggregate([
        (req.body.start_date != "" || typeof req.body.start_date != "undefined") && 
        (req.body.end_date != "" || typeof req.body.end_date != "undefined")
        ? {
            $match: {
                $and: [
                    {booking_date: { $gt: new Date(req.body.start_date) }},
                    {booking_date: { $lt: new Date(req.body.end_date) }},
                ]
            }
        }
        : {$project: {_v: 0}},
        {
            $group: {
                _id: {
                    date: { $dateToString: {date: "$booking_date", format: "%Y-%m-%d"}},
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
    totalOrdersNRevenues,
    totalRevenueNProfit,
    productSalesReport
}