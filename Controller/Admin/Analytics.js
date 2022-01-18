const PRODUCT_CHECKOUTS = require('../../Models/checkout');
const SERVICE_CHECKOUTS = require('../../Models/servicecheckout');

var totalOrders = async (req,res) => {
    let completedProductOrders = await PRODUCT_CHECKOUTS.find({ status: "true" }).exec();
    let completedServiceOrders = await SERVICE_CHECKOUTS.find({ acceptstatus: "accept" }).exec();

    res.status(200).json({
        status: true,
        complete_product_deliveries: completedProductOrders.length,
        complete_service_deliveries: completedServiceOrders.length
    });
}

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

module.exports = {
    totalOrdersNRevenues
}