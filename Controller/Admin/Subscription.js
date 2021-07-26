var mongoose = require('mongoose')
var passwordHash = require('password-hash')
var Subsciption = require('../../Models/subscription');

var jwt = require('jsonwebtoken');

const { Validator } = require('node-input-validator')

var uuidv1 = require('uuid').v1;

const create = async( req , res )=>
{
    let v = new Validator(req.body,{
        name:"required",
        seller_comission:"required",
        duration:"required",
        price:"required",
        type:"required"
    })

    let matched = await v.check().then((val)=>val)
    if(!matched)
    {
        return res.status(200).send({
            status:true,
            error:v.errors
        })
    }

    let subdata = {
        _id:mongoose.Types.ObjectId(),
        name:req.body.name,
        seller_comission:req.body.seller_comission,
        duration:req.body.duration,
        price:req.body.price,
        type:req.body.type
    }

    let subscriptionSchema = new Subsciption(subdata)

    return subscriptionSchema.save()
            .then((data)=>{
                res.status(200).send({
                    status:200,
                    message:"Subscription Added Successfully",
                    data:data
                })
            })
            .catch((err)=>{
                res.status(500).send({
                    status:500,
                    message:"Server error. Please try again.",
                    error:err
                })
            })
}

const viewAll = async( req , res)=>{
    return Subsciption.aggregate(
        [
            {
                $project:{
                    _v:0
                }
            }
        ]
    )
    .then((data)=>{
        res.status(200).json({
            status:true,
            message:'Subscription Data Get Successfully',
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
    Subsciption.findOneAndUpdate({ _id: { $in : [mongoose.Types.ObjectId(req.params.id) ] } }, req.body, {new: true}, (err, doc) => {
        if (err) {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err,
            });
        }
        else if (doc != null) {
            // data = { ...req.body, ...data._doc };
            res.status(200).json({
            status: true,
            message: "Product update successful",
            data: doc,
            });
        } else {
            res.status(500).json({
            status: false,
            message: "User not match",
            data: null,
            });
        }
    
        console.log(doc);
    });
    
}

const Delete = async(req ,res ) =>
{
    return Subsciption.remove({ _id : { "$in" : [ mongoose.Types.ObjectId(req.parms.id)]}})
            .then((data)=>{
                return res.status(200).json({
                    status: true,
                    message: 'Subscription delete successfully',
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

module.exports={
    create,
    viewAll,
    update,
    Delete
}