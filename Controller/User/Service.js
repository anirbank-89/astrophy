var mongoose = require('mongoose');
var Service = require('../../Models/service');
var Shop = require('../../Models/shop');
var Subcategory = require('../../Models/subcategory');
var ShopService = require('../../Models/shop_service');
var ServiceReview = require('../../Models/servicereview');


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
    let id = req.params.id       // _id of 'services' table in params
    const myCustomLabels = {
        totalDocs: 'itemCount',
        docs: 'itemsList',
        limit: 'perPage',
        page: 'currentPage',
        nextPage: 'next',
        prevPage: 'prev',
        totalPages: 'pageCount',
        hasPrevPage: 'hasPrev',
        hasNextPage: 'hasNext',
        pagingCounter: 'pageCounter',
        meta: 'paginator'
      };
      
      const options = {
          page: req.params.page,
          limit: 3,
          customLabels: myCustomLabels
      };
    let cat_data = await Service.find({_id: {$in: [mongoose.Types.ObjectId(id)]}}).exec();

            ShopService.aggregatePaginate(ShopService.aggregate(
                [
                    {
                        $match:{
                            category_id: {$in: [mongoose.Types.ObjectId(id)]},
                            chataddstatus : false
                        }
                    },
                    {
                        $lookup:{
                            from: "services",
                            localField: "category_id",
                            foreignField: "_id",
                            as: "category_details"
                        }
                    },
                    {
                        $unwind:"$category_details" 
                    },
                    {
                        $lookup:{
                            from: "shops",
                            localField: "shop_id",
                            foreignField: "_id",
                            as: "shop_details"
                        }
                    },

                    {
                        $lookup:{
                            from:"servicereviews",
                            localField:"_id",
                            foreignField: "service_id",
                            as:"rev_data",
                        }
                    },
                    {
                        $addFields: {
                            avgRating: {
                                $avg: {
                                    $map: {
                                        input: "$rev_data",
                                        in: "$$this.rating"
                                    }
                                }
                            }
                        }
                    },    
                    {
                        $project:{
                            _v:0
                        }
                    }
                ]
            ), options, function(err, result) {
                if(!err) {
                    return res.status(200).json({                    
                        status: true,
                        message: "All services for this category get successfully.",
                        data: result,
                        category_data:cat_data[0]
                        
                    })
                } else {
                    return res.status(500).json({
                                status: false,
                                message: "Server error. Please try again.",
                                error: err,
                              });
                }
            })
   
}
          
module.exports = {
    viewAllServices,
    viewService,
    viewServiceSubCategory,
    viewShopServicesPerService
}