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
                console.log(docs);
            }
        }
    ).exec();

    let updatedCartItems = await SERVICE_CART.find({
        user_id: mongoose.Types.ObjectId(user_id),
        status: true
    }).exec();

    res.status(200).json({
        status: true,
        message: "Coupon applied.",
        data: updatedCartItems
    });
}

module.exports = {
    checkCoupon,
    applyCoupon
}