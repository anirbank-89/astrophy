var mongoose = require('mongoose')
var Shop = require('../../Models/shop')
var ShopService = require('../../Models/shop_service')
var Subcategory = require('../../Models/subcategory')
var Upload = require('../../service/upload')
var ServiceReview = require('../../Models/servicereview');

const { Validator } = require('node-input-validator')
const service = require('../../Models/service')

const register = async (req,res)=>{
    const v = new Validator(req.body,{
        name: "required",
        price: "required",
        details: "required"
    })
    let matched = v.check().then((val)=>val)
    if(!matched){
        res.status(200).send({status: false, errors: v.errors})
    }
    console.log(req.file)
    let image_url = await Upload.uploadFile(req, "shop_services")
    let shopServiceData = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        details: req.body.details,
        category_id: mongoose.Types.ObjectId(req.body.category_id),
        subcategory_id: mongoose.Types.ObjectId(req.body.subcategory_id),
        shop_id: mongoose.Types.ObjectId(req.body.shop_id)
    }
    if(typeof(req.body.personalization)!='undefined' || req.body.personalization!=''){
        shopServiceData.personalization = req.body.personalization
    }
    if(typeof(req.body.hashtags)!='undefined' || req.body.hashtags!=''){
        shopServiceData.hashtags = req.body.hashtags
    }
    if(typeof(req.file)!='undefined' || req.file!='' || req.file!=null){
        shopServiceData.image = image_url
    }

    let shop_service = new ShopService(shopServiceData)
    shop_service.save()
      .then((docs)=>{
          res.status(200).json({
              status: true,
              message: "Shop's service created sucessfully!",
              data: docs
          })
      })
      .catch((err)=>{
          res.status(500).json({
              status: false,
              message: "Server error. Please try again",
              errors: err
          })
      })

    // ShopService.find({subcategory_id: {$in: [mongoose.Types.ObjectId(req.body.subcategory_id)]}})
    //   .then(async (data)=>{
    //       if(data==null || data==''){}
    //       else{
    //           ShopService.findOneAndUpdate(
    //             {subcategory_id: {$in: [mongoose.Types.ObjectId(req.body.subcategory_id)]}}, 
    //             // {
    //             //   name: req.body.name,
    //             //   price: req.body.price,
    //             //   details: req.body.details,
    //             //   personalization: req.body.personalization,
    //             //   hashtags: req.body.hashtags
    //             // },
    //             req.body, 
    //             async (err,docs)=>{
    //                 if(err){
    //                     res.status(500).json({
    //                         status: false,
    //                         message: "Server error. Please try again.",
    //                         error: err
    //                     });
    //                 }
    //                 else{
    //                     res.status(200).json({
    //                         status: true,
    //                         message: "Shop service updated successfully!",
    //                         data: docs
    //                     });
    //                 }
    //             }
    //           )
    //       }
    // })
}


const chatServiceregister = async (req,res)=>{
    const v = new Validator(req.body,{
        name: "required",
        price: "required",
        details: "required"
    })
    let matched = v.check().then((val)=>val)
    if(!matched){
        res.status(200).send({status: false, errors: v.errors})
    }
    console.log(req.file)
    let image_url = await Upload.uploadFile(req, "shop_services")
    let shopServiceData = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        details: req.body.details,
        category_id: mongoose.Types.ObjectId(req.body.category_id),
        subcategory_id: mongoose.Types.ObjectId(req.body.subcategory_id),
        shop_id: mongoose.Types.ObjectId(req.body.shop_id),
        chataddstatus : true
    }
    if(typeof(req.body.personalization)!='undefined' || req.body.personalization!=''){
        shopServiceData.personalization = req.body.personalization
    }
    if(typeof(req.body.hashtags)!='undefined' || req.body.hashtags!=''){
        shopServiceData.hashtags = req.body.hashtags
    }
    if(typeof(req.file)!='undefined' || req.file!='' || req.file!=null){
        shopServiceData.image = image_url
    }

    let shop_service = new ShopService(shopServiceData)
    shop_service.save()
      .then((docs)=>{
          res.status(200).json({
              status: true,
              message: "Shop's service created sucessfully!",
              data: docs
          })
      })
      .catch((err)=>{
          res.status(500).json({
              status: false,
              message: "Server error. Please try again",
              errors: err
          })
      })

}

const update = async (req,res)=>{
    const v = new Validator(req.body,{
        name: "required",
        price: "required",
        details: "required"
    })
    
    let matched = await v.check().then((val)=>val);
    if(!matched){
        return res.status(200).send({
            status: false,
            error: v.errors
        });
    }
    console.log(req.file)
    if (typeof (req.file) != "undefined" || req.file != null) {
        let image_url = await Upload.uploadFile(req, "shop_services");
        req.body.image = image_url;
    }

    let id = req.params.id
    return ShopService.findOneAndUpdate(
        {_id: {$in: [mongoose.Types.ObjectId(id)]}}, 
        req.body, 
        async (err,docs)=>{
            if(err){
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err
                });
            }
            else{
                res.status(200).json({
                    status: true,
                    message: "Shop service updated successfully!",
                    data: docs
                });
            }
        }
      )
}

const viewShopServicesPerSeller = async (req,res)=>{
    let id = req.params.id          // shop_id of shop_services
    ShopService.find({shop_id: {$in: [mongoose.Types.ObjectId(id)]}})
      .then((data)=>{
        if(data==null || data==''){
            res.status(200).json({
                status: true,
                message: "This seller doesn't have any services currently.",
                data: data
            })
        }
        else {
            ShopService.aggregate(
                [
                    {
                        $match:{
                            shop_id: {$in: [mongoose.Types.ObjectId(id)]},
                            chataddstatus : false
                            
                        }
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
                                        input: "$review_data",
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
            )
            .then((docs)=>{
                res.status(200).json({
                    status: true,
                    message: "All services of this shop get successfully.",
                    data: docs
                })
            })
            .catch((fault)=>{
                res.status(400).json({
                    status: false,
                    message: "Service error2. Please try again",
                    error: fault
                })
            })
        }
      })
      .catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err
        })
    })
}

const viewOneService = async (req,res)=>{
    let id = req.params.id          // _id of shop_services
    ShopService.findOne({_id: {$in: [mongoose.Types.ObjectId(id)]}})
        .then((data)=>{
            if(data==null || data==''){
                res.status(200).json({
                    status: true,
                    message: "Invalid id",
                    data: []
                })
            }
            else{
                ShopService.aggregate(
                    [
                        {
                            $match:{
                                _id: {$in: [mongoose.Types.ObjectId(id)]}
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
                            $lookup:{
                                from: "shops",
                                localField: "shop_id",
                                foreignField: "_id",
                                as: "shop_details"
                            }
                        },
                        {
                            $unwind: {
                                path: "$shop_details",
                                preserveNullAndEmptyArrays: true                        
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "shop_details.userid",
                                foreignField: "_id",
                                as: 'shop_details.user_data'
                            }
                        },
                        {
                            $unwind: {
                                path: "$shop_details.user_data",
                                preserveNullAndEmptyArrays: true                        
                            }
                        },  
                        {
                            $project:{
                                _v:0
                            }
                        }
                    ]
                  )
                  .then((docs)=>{
                      res.status(200).json({
                          status: true,
                          message: "This shop service get successfully",
                          data: docs
                      })
                  })
                  .catch((fault)=>{
                      res.status(500).json({
                          status: false,
                          message: "Server error2. Please try again.",
                          error: fault
                      })
                  })
                //   ShopService.aggregate(
                //       [
                //           {
                //               $addFields:{
                //                   shop_details:{
                //                     $match: {
                //                         _id: {$in: [mongoose.Types.ObjectId(id)]}
                //                     },
                //                     $lookup:{
                //                         from: "shops",
                //                         localField: "shop_id",
                //                         foreignField: "_id"
                //                     },
                //                     $project:{
                //                             _v: 0
                //                         }
                //                   }
                //               }
                //           }
                //       ]
                //   )//
                //   .then((docs)=>{
                //       res.status(200).json()
                //   })
            }
        })
        .catch((err)=>{
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err
            })
        })
}

const imageurlApi = async(req,res)=>{
    let imagUrl = '';
    let image_url = await Upload.uploadFile(req, "chat")
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
    register,
    update,
    viewShopServicesPerSeller,
    viewOneService,
    imageurlApi,
    chatServiceregister
}