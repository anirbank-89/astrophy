var mongoose = require('mongoose');
var Service = require('../../Models/service');
var Subcategory = require('../../Models/subcategory');
var ShopServices = require('../../Models/shop_service');

const viewAllServices = async (req,res)=>{
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

const viewService = async (req,res)=>{
    let id=req.params.id;
    return Service.findOne(
        {_id: { $in : [mongoose.Types.ObjectId(id)] } },
        (err,docs)=>{
        if(err){
            res.status(400).json({
                status: false,
                message: "Server error. Data not available",
                error: err
            });
        }
        else {
            res.status(200).json({
                status: true,
                message: "Service get successfully",
                data: docs
            });
        }
    });
}

const viewServiceSubCategory = async (req,res)=>{
    Subcategory.find({serviceid: {$in: [mongoose.Types.ObjectId(req.params.id)]}})
      .then((data)=>{
          res.status(200).json({
              status: true,
              message: "Service sub-categries get successfully.",
              data: data
          })
      })
      .catch((err)=>{
          res.status(500).json({
              status: false,
              message: "Server error. Please try again.",
              error: err
          })
      })
}

const viewShopServicesPerService = async (req,res)=>{
    let id = req.params.id
    Service.find({_id: {$in: [mongoose.Types.ObjectId(id)]}})
      .then((data)=>{
          if (data==null || data=='' ) {
              res.status(500).json({
                  status: false,
                  message: "Invalid id",
                  error: error
              })
          }
          else {
              ShopServices.find({category_id: {$in: [mongoose.Types.ObjectId(id)]}})
                .then((docs)=>{
                    if(docs==null || docs=='') {
                        res.status(200).json({
                            status: false,
                            message: "Currently no services are available for this category.",
                            error: error
                        })
                    }
                    else {
                        res.status(200).json({
                            status: true,
                            message: "Shop services get successfully",
                            data: docs
                        })
                    }
                })
          }
      }).
      catch((err)=>{
          res.status(500).json({
              status: false,
              message: "Server error. Please try again.",
              error: err
          })
      })
}

module.exports = {
    viewAllServices,
    viewService,
    viewServiceSubCategory,
    viewShopServicesPerService
}