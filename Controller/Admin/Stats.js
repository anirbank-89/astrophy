const USER = require('../../Models/user');
const SELLER = require('../../Models/seller');
const SERV_CATEGORY = require('../../Models/service');
const SHOP = require('../../Models/shop');
const SHOP_SERVICE = require('../../Models/shop_service');

var summaryStats = async (req,res) => {
    let users = await USER.find({ status: true }).exec();
    let sellers = await SELLER.find({ approved: true }).exec();
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

module.exports = {
    summaryStats
}