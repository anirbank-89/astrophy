var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

var Category = require("../../Models/category");

const create = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        content:"required"
    });

    let matched = await v.check().then((val) => val)
    if (!matched) {
        return res.status(200).send({
            status: false,
            error: v.errors
        })
    }

    let categoryDate = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        content:req.body.content
    }

    const category = await new Category(categoryDate)
    return category
        .save()
        .then((data) => {
            res.status(200).json({
                status: true,
                message: "New Category created successfully",
                data: data,
            })
        })
        .catch((error) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: error,
            });
        })
}

const viewAll = async (req, res) => {
    return Category.aggregate(
        [
            { $sort: { _id: -1 } },
            {
                $project: {
                    _v: 0
                }
            }
        ]
    ).
        then((data) => {
            res.status(200).json({
                status: true,
                message: 'Category Data Get Successfully',
                data: data
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: error,
            });
        })
}

const update = async (req, res) => {
    return Category.findOneAndUpdate(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
        req.body,
        async (err, data) => {
            if (err) {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err,
                });
            } else if (data != null) {
                data = { ...req.body, ...data._doc };
                res.status(200).json({
                    status: true,
                    message: "Category update successful",
                    data: data,
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "User not match",
                    data: null,
                });
            }
        }
    );
};

const Delete = async (req, res) => {
    return Category.remove(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
        .then((data) => {
            return res.status(200).json({
                status: true,
                message: 'Category delete successfully',
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

const setStatus = async (req, res) => {
    var id = req.params.id;

    var current_status = await Category.findById({ _id: id }).exec();

    console.log("Category data", current_status);

    if (current_status.status === true) {
        return Category.findByIdAndUpdate(
            { _id: id },
            { $set: { status: false } },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.status(200).json({
                        status: true,
                        message: "Category has been made inactive.",
                        data: docs
                    });
                }
                else {
                    res.status(500).json({
                        status: false,
                        message: "Invalid id. Server error.",
                        error: err
                    });
                }
            }
        );
    }
    else {
        return Category.findByIdAndUpdate(
            { _id: id },
            { $set: { status: true } },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.status(200).json({
                        status: true,
                        message: "Category has been activated.",
                        data: docs
                    });
                }
                else {
                    res.status(500).json({
                        status: false,
                        message: "Invalid id. Server error.",
                        error: err
                    });
                }
            }
        );
    }
}

module.exports = {
    create,
    viewAll,
    update,
    Delete,
    setStatus
};