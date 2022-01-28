var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

var Product = require("../../Models/product");
var Upload = require("../../service/upload");

const create = async( req , res ) =>
{
    const v = new Validator(req.body,{
        catID : "required",
        name : "required",
        description : "required",
        currency: "required",
        mrp : "required",
        selling_price : "required",
        delivery :"required",
        delivery_time:"required"

    })

    let matched = await v.check().then((val)=>val)
    if(!matched)
    {
        return res.status(200).send({
            status:false,
            error:v.errors
        })
    }
    // if( typeof(req.file)=='undefined' || req.file ==null)
    // {
    //     return res.status(200).send({
    //         status:true,
    //         error:{
    //             "image":{
    //                 "message": "The image field is mandatory.",
    //                 "rule": "required"
    //             }
    //         }

    //     })
    // }
    // let image_url = await Upload.uploadFile(req, "products");
    var taxValue = req.body.tax_rate + "%"
    var totalPrice = req.body.selling_price + ((req.body.selling_price * req.body.tax_rate)/100)

    let prductData = {
        _id : mongoose.Types.ObjectId(),
        name : req.body.name,
        catID : mongoose.Types.ObjectId(req.body.catID),
        description : req.body.description,
        currency: req.body.currency,
        mrp : Number(req.body.mrp),
        selling_price : Number(req.body.selling_price),
        tax: taxValue,
        total: totalPrice,
        image: req.body.image,
        delivery:req.body.delivery,
        delivery_time:req.body.delivery_time
    }

    const productSave = await new Product(prductData)

    return productSave
           .save()
           .then((data) => {
               res.status(200).json({
                   status:true,
                   data:data,
                   message:"Product added successfully"
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
                    from:"categories",
                    localField:"catID",
                    foreignField: "_id",
                    as:"category_data"
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
            message:'Product Data Get Successfully',
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
