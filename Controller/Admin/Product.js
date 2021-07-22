var mongoose = require('mongoose');
var Product = require("../../Models/product");
var Upload = require("../../service/upload");
var passwordHash = require('password-hash')

var jwt = require('jsonwebtoken');

const { Validator } = require('node-input-validator');

var uuidv1 = require('uuid').v1;

const create = async( req , res ) =>
{
    const v = new Validator(req.body,{
        catID : "required",
        name : "required",
        description : "required",
        price : "required"
    })

    let matched = await v.check().then((val)=>val)
    if(!matched)
    {
        return res.status(200).send({
            status:false,
            error:v.errors
        })
    }
    if( typeof(req.file)=='undefined' || req.file ==null)
    {
        return res.status(200).send({
            status:true,
            error:{
                "image":{
                    "message": "The image field is mandatory.",
                    "rule": "required"
                }
            }

        })
    }
    let image_url = await Upload.uploadFile(req, "products");
    let prductData = {
        _id : mongoose.Types.ObjectId(),
        name : req.body.name,
        catID : mongoose.Types.ObjectId(req.body.catID),
        description : req.body.description,
        price : Number(req.body.price),
        image: image_url
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
    if (typeof (req.file) != "undefined" || req.file != null) {
        let image_url = await Upload.uploadFile(req, "products");
        req.body.image = image_url;
      }

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

module.exports = {
    create,
    viewAll,
    update,
    Delete
}
