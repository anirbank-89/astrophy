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

var websiteRevenues = async (req,res) => {
    let totalProductRev = await PRODUCT_CHECKOUTS.aggregate([
        {
            $group: {
                _id: "$status",
                total: { $sum: "$total" }
            }
        }
    ]).exec();
    
    let totalServiceRev = await SERVICE_CHECKOUTS.aggregate([
        {
            $group: {
                _id: "$acceptstatus",
                total: { $sum: "$total" }
            }
        }
    ]).exec();

    return res.status(200).json({
        status: true,
        product_revenue: totalProductRev,
        service_revenue: totalServiceRev
    });
}

module.exports = {
    totalOrders,
    websiteRevenues
}