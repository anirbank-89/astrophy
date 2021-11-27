var mongoose = require('mongoose');
var Product = require("../../Models/faq");
var Upload = require("../../service/upload");
var passwordHash = require('password-hash')

var jwt = require('jsonwebtoken');

const { Validator } = require('node-input-validator');

var uuidv1 = require('uuid').v1;

const create = async( req , res ) =>
{
    const v = new Validator(req.body,{
        qstn : "required",
        ans : "required"

    })

    let matched = await v.check().then((val)=>val)
    if(!matched)
    {
        return res.status(200).send({
            status:false,
            error:v.errors
        })
    }

    let prductData = {
        _id : mongoose.Types.ObjectId(),
        qstn : req.body.qstn,
        ans : req.body.ans,
        category_id : mongoose.Types.ObjectId(req.body.category_id),
        subcategory_id : mongoose.Types.ObjectId(req.body.subcategory_id),
        
    }

    const productSave = await new Product(prductData)

    return productSave
           .save()
           .then((data) => {
               res.status(200).json({
                   status:true,
                   data:data,
                   message:"Faq added successfully"
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

const viewAll = async( req ,res )=>
{
    return Product.aggregate(
        [
            {
                $lookup:{
                    from:"faqcats",
                    localField:"category_id",
                    foreignField: "_id",
                    as:"category_data"
                }
            },
            {
                $lookup:{
                    from:"faqsubcats",
                    localField:"subcategory_id",
                    foreignField: "_id",
                    as:"subcategory_data"
                }
            },
            { $sort: { _id: -1 } },
            {
                $project:{
                    _v:0
                }
            }
        ]
    ).then((data)=>{
        res.status(200).json({
            status:true,
            message:'Faq Data Get Successfully',
            data:data
        })
    })
    .catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: error,
          });
    })
}

const update = async( req , res)=>
{
    console.log(req.file)
    // if (typeof (req.file) != "undefined" || req.file != null) {
    //     let image_url = await Upload.uploadFile(req, "products");
    //     req.body.image = image_url;
    //   }

    return Product.findOneAndUpdate(
        { _id: { $in : [mongoose.Types.ObjectId(req.params.id) ] } },
        req.body,
        async( err , data)=>
        {
            console.log(data);
            if(err)
            {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err,
                });
            }
            else if (data != null) {
                data = { ...req.body, ...data._doc };
                res.status(200).json({
                status: true,
                message: "Product update successful",
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
    )
    
}
const Delete = async(req,res)=>{
    return Product.remove(
        {_id: { $in : [mongoose.Types.ObjectId(req.params.id)]}})
        .then((data)=>{
            return res.status(200).json({
                status: true,
                message: 'Product delete successfully',
                data: data
            });
        })
        .catch((err)=>{
            res.status(500).json({
                status: false,
                message: 'Server error. Please try again.',
                error: error,
            });
        })
    
}

const setStatus = async (req, res) => {
    var id = req.params.id;

    var current_status = await Product.findById({ _id: id }).exec();

    console.log("Category data", current_status);

    if (current_status.adminStatus === true) {
        console.log(true);
        return Product.findByIdAndUpdate(
            { _id: id },
            { $set: { adminStatus: false } },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.status(200).json({
                        status: true,
                        message: "Product has been made inactive.",
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
        return Product.findByIdAndUpdate(
            { _id: id },
            { $set: { adminStatus: true } },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.status(200).json({
                        status: true,
                        message: "Product has been activated.",
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

const productImageUrl = async(req,res)=>{
    let imagUrl = '';
    let image_url = await Upload.uploadFile(req, "products")
    if(typeof(req.file)!='undefined' || req.file!='' || req.file!=null){
        imagUrl = image_url
    }

    return res.status(200).send({
        status : true,
        data : imagUrl,
        error : null
    })
}

module.exports = {
    create,
    viewAll,
    update,
    Delete,
    setStatus,
    productImageUrl
}
