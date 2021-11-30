var mongoose = require('mongoose');
var Product = require("../../Models/faq");
var ContactUs = require("../../Models/seller_contactus");
var Upload = require("../../service/upload");
var passwordHash = require('password-hash')

var jwt = require('jsonwebtoken');

const { Validator } = require('node-input-validator');

var uuidv1 = require('uuid').v1;

const create = async( req , res ) =>
{
    const v = new Validator(req.body,{
        name : "required",
        email : "required",
        cat_id : "required",
        message : "required"

    })

    let matched = await v.check().then((val)=>val)
    if(!matched)
    {
        return res.status(200).send({
            status:false,
            error:v.errors
        })
    }

    let contactus = {
        _id : mongoose.Types.ObjectId(),
        name : req.body.name,
        email : req.body.email,
        cat_id : req.body.cat_id,
        message : req.body.message
        
    }

    const contactSave = await new ContactUs(contactus)

    return contactSave
           .save()
           .then((data) => {
               res.status(200).json({
                   status:true,
                   data:data,
                   message:"Info saved successfully"
               })
           })
           .catch((err) => {
            res.status(500).json({
                status: false,
                message: "error. Please try again.",
                error: err,
                });
           })
}


module.exports = {
    create
}
