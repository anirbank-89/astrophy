var mongoose = require("mongoose");

const SERVICE_COUPON = require("../../Models/servicecoupon");
const SERVICE_CART = require("../../Models/new_servicecart");

var checkCoupon = async (req, res) => {
    let coupData = await SERVICE_COUPON.findOne({
        name: req.body.name,
        status: true,
    }).exec();
    // console.log(coupData)
    if (coupData != '' && coupData != null) {
        return res.status(200).json({
            status: true,
            data: coupData,
            message: "Coupon get successfully"
        })
    }
    else {
        return res.status(400).json({
            status: false,
            data: null,
            message: "No Data"
        })
    }
}

var applyCoupon = async (req, res) => {
    var user_id = req.body.user_id;
    var coup_name = req.body.coup_name;

    let cartItems = await SERVICE_CART.updateMany(
        {
            user_id: mongoose.Types.ObjectId(user_id),
            status: true
        },
        { $set: { coupon: coup_name } },
        { multi: true },
        (err, docs) => {
            if (err) {
                console.log("Failed to update in cart due to ", err.message);
            }
        }
    ).exec();

    let coupData = await SERVICE_COUPON.findOne({
        name: req.body.coup_name,
        status: true,
    }).exec();

    return res.status(200).json({
        status: true,
        message: "Applied coupon info.",
        data: coupData
    });
}

module.exports = {
    checkCoupon,
    applyCoupon
}