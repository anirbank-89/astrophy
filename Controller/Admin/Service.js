var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var uuidv1 = require('uuid').v1;
var Service = require('../../Models/service');
var Upload = require("../../service/upload");

const { Validator } = require('node-input-validator');

const create = async (req,res)=>{
    const v = new Validator(req.body,{
        name: "required",
        description: "required"
    });

    let matched = await v.check().then((val)=>val);
    if (!matched) {
        return res.status(200).send({
            status: false,
            error: v.errors
        });
    }
    if (typeof(req.file)=='undefined' || req.file == null) {
        return res.status(200).send({
            status:true,
            error:{
                "image":{
                    "message": "The image field is mandatory.",
                    "rule": "required"
                }
            }
        });
    }
    let image_url = await Upload.uploadFile(req, "services");
    let serviceData = {
        _id : mongoose.Types.ObjectId(),
        name : req.body.name,
        description : req.body.description,
        image: image_url
    }

    let service_category = await new Service(serviceData);

    return service_category.save()
      .then((data)=>{
          res.status(200).json({
              status: true,
              data: data,
              message: "Service category added successfully!"
          });
      })
      .catch((err)=>{
          res.status(500).json({
              status: false,
              message: "Server error. Please try again.",
              error: err
          });
      });
}

const viewAll = async (req,res)=>{
    return Service.find()
      .then((docs)=>{
          res.status(200).json({
              status: true,
              message: "All services get successfully.",
              data: docs
          });
      })
      .catch((err)=>{
          res.status(500).json({
              status: false,
              message: "Server error. Please try again.",
              errors: err
          });
      });
}

const update = async (req,res)=>{
    const v = new Validator({
        name: "required",
        description: "required",
    });

    let matched = await v.check().then((val)=>val);
    if(!matched){
        return res.status(200).send({
            status: false,
            error: v.errors
        });
    }
    console.log(req.file)
    if (typeof (req.file) != "undefined" || req.file != null) {
        let image_url = await Upload.uploadFile(req, "services");
        req.body.image = image_url;
    }

    return Service.findOneAndUpdate(
        { _id: { $in : [mongoose.Types.ObjectId(req.params.id) ] } }, 
        req.body, 
        async (err, docs)=>{
            if (err) {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err
                });
            }
            else if(docs != null){
                res.status(200).json({
                    status: true,
                    message: "Service category updated successfully!",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "User do not match",
                    data: null
                });
            }
        }
    );
}

const Delete = async (req,res)=>{
    return Service.remove({_id: { $in : [mongoose.Types.ObjectId(req.params.id)]}})
      .then((docs)=>{
          res.status(200).json({
              status: true,
              message: "Service category deleted successfully!",
              data: docs
          });
      })
      .catch((err)=>{
          res.status(500).json({
              status: false,
              message: "Server error. Please try again.",
              error: err
          });
      });
}

module.exports = {
    create,
    viewAll,
    update,
    Delete,
}