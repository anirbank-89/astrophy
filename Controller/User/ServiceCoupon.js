var mongoose = require("mongoose");

const SERVICE_COUPON = require("../../Models/servicecoupon");
const SERVICE_CART = require("../../Models/new_servicecart");
const SERVICE_CHECKOUT = require("../../Models/new_service_checkout");

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

    let coupData = await SERVICE_COUPON.findOne({
        name: coup_name,
        status: true,
    }).exec();

    if (coupData.times == 0) {
        return res.status(500).json({
            status: false,
            error: "This coupon is not available anymore.",
            data: null
        });
    }
    else {
        let couponUsedOrNot = await SERVICE_CHECKOUT.findOne({
            user_id: mongoose.Types.ObjectId(user_id),
            "coupon.name": coupData.name
        }).exec();

        if (couponUsedOrNot != null) {
            return res.status(500).json({
                status: false,
                error: "This coupon has already been used",
                data: null
            });
        }
        else {
            SERVICE_CART.updateMany(
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

            // coupData.times -= 1;
            // let availableCoupNum = await coupData.save();

            return res.status(200).json({
                status: true,
                message: "Applied coupon info.",
                data: coupData
            });
        }
    }
}

module.exports = {
    checkCoupon,
    applyCoupon
}