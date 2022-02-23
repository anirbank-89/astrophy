var mongoose = require('mongoose');

const SHOP = require('../../Models/shop');
const SHOP_SERVICES = require('../../Models/shop_service');

var getAllShops = async (req, res) => {
    return SHOP.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "userid",
                foreignField: "_id",
                as: "user_data"
            }
        },
        {
            $unwind: {
                path: "$user_data",
                preserveNullAndEmptyArrays: true
            }
        }
    ])
        .then(data => {
            res.status(200).json({
                status: true,
                message: "Shops get successfully.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to get data. Server error.",
                error: err
            });
        });
}

var deactivateShop = async (req, res) => {
    var id = req.params.id;

    return SHOP.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { status: false } },
        { new: true }
    )
        .then(data => {
            SHOP_SERVICES.updateMany(
                { shop_id: data._id },
                { $set: { status: false } },
                { multi: true },
                (fault, result) => {
                    if (fault) {
                        console.log(fault.message);
                    }
                }
            );

            res.status(200).json({
                status: true,
                message: "Shop and its services have been deactivated.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err
            });
        });
}

var deleteShop = async (req,res) => {
    var id = req.params.id;

    return SHOP.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) })
        .then(data => {
            SHOP_SERVICES.deleteMany(
                { shop_id: data._id }, 
                { multi: true }, 
                (fault, result) => {
                    if (fault) {
                        console.log(fault.message);
                    }
                }
            );

            res.status(200).json({
                status: true,
                message: "Shop and its services have been deleted.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err
            });
        });
}

module.exports = {
    getAllShops,
    deactivateShop,
    deleteShop
}