const mongoose = require('mongoose')
const ServiceCart = require('../../Models/new_servicecart')
var Servicewish = require('../../Models/servicewishlist')

const { Validator } = require('node-input-validator');

const create = async (req, res) => {
    const v = new Validator(req.body, {
        user_id: "required",
        serv_id: "required",
        seller_id: "required",
        servicename: "required",
        price: "required",
        image: "required"
    })

    let matched = await v.check().then((val) => val)
    if (!matched) {
        return res.status(400).json({
            status: false,
            data: null,
            message: v.errors
        })
    }

    let subData = await Servicewish.findOne({
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        serv_id: mongoose.Types.ObjectId(req.body.serv_id)
    }).exec();
    if (subData == null || subData == "") {

        let dataSubmit = {
            _id: mongoose.Types.ObjectId(),
            user_id: mongoose.Types.ObjectId(req.body.user_id),
            serv_id: mongoose.Types.ObjectId(req.body.serv_id),
            seller_id: mongoose.Types.ObjectId(req.body.seller_id),
            servicename: req.body.servicename,
            price: req.body.price,
            image: req.body.image
        }

        const saveData = new Servicewish(dataSubmit);
        return saveData
            .save()
            .then((data) => {
                res.status(200).json({
                    status: true,
                    message: 'Item Added to Successfully',
                    data: data
                })
            })
            .catch((err) => {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err,
                });
            })
    }
    else {
        return res.status(400).json({
            status: false,
            data: null,
            message: "Item Already Added"
        })
    }

}

const getWish = async (req, res) => {

    return Servicewish.aggregate([
        {
            $match: {
                user_id: mongoose.Types.ObjectId(req.params.user_id),
            },
        },
        {
            $lookup: {
                from: "shop_services",
                localField: "serv_id",
                foreignField: "_id",
                as: "service_data"
            }
        },
        // {
        //     $unwind: "$service_data"
        // },
        {
            $project: {
                // _id: 0,

                __v: 0,
            }
        }
    ])
        .then((data) => {
            if (data.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: "Wistlist Get Successfully",
                    data: data,
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: "Empty List",
                    data: data,
                });
            }

        })
        .catch((err) => {
            return res.status(500).json({
                status: false,
                message: "No Match",
                data: null,
            });
        });
}

const Delete = async (req, res) => {
    return Servicewish.remove(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
        .then((data) => {
            return res.status(200).json({
                status: true,
                message: 'Wishlist Item delete successfully',
                data: data
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: 'Server error. Please try again.',
                error: error,
            });
        })
}

const saveForLater = async (req, res) => {
    const v = new Validator(req.body, {
        user_id: "required",
        serv_id: "required",
        seller_id: "required",
        servicename: "required",
        price: "required",
        image: "required"
    })

    let matched = await v.check().then((val) => val)
    if (!matched) {
        return res.status(400).json({
            status: false,
            data: null,
            message: v.errors
        })
    }

    let subData = await Servicewish.findOne({
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        serv_id: mongoose.Types.ObjectId(req.body.serv_id)
    }).exec();
    if (subData == null || subData == "") {

        let dataSubmit = {
            _id: mongoose.Types.ObjectId(),
            user_id: mongoose.Types.ObjectId(req.body.user_id),
            serv_id: mongoose.Types.ObjectId(req.body.serv_id),
            seller_id: mongoose.Types.ObjectId(req.body.seller_id),
            servicename: req.body.servicename,
            price: req.body.price,
            image: req.body.image
        }

        const saveData = new Servicewish(dataSubmit);
        return saveData
            .save()
            .then((data) => {
                ServiceCart.deleteOne(
                    {
                        user_id: mongoose.Types.ObjectId(req.body.user_id),
                        serv_id: mongoose.Types.ObjectId(req.body.serv_id),
                        status: true
                    },
                    (fault, result) => {
                        if (fault) {
                            console.log("Failed to remove from cart due to ", fault.message);
                        }
                    }
                );

                res.status(200).json({
                    status: true,
                    message: 'Item Added to Successfully',
                    data: data
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err,
                });
            })
    }
    else {
        return res.status(400).json({
            status: false,
            data: null,
            message: "Item Already Added"
        })
    }
}

module.exports = {
    create,
    getWish,
    Delete,
    saveForLater
}