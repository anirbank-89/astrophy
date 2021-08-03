var mongoose = require('mongoose')
var Shop = require('../../Models/shop')
var ShopService = require('../../Models/shop_service')
var Subcategory = require('../../Models/subcategory')
var Upload = require('../../service/upload')

const { Validator } = require('node-input-validator')

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

const update = async (req,res)=>{
    let id = req.params.id
    return ShopService.findOneAndUpdate(
        {_id: {$in: [mongoose.Types.ObjectId(id)]}}, 
        {
          name: req.body.name,
          price: req.body.price,
          details: req.body.details,
          personalization: req.body.personalization,
          hashtags: req.body.hashtags
        }, 
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
    let id = req.params.id
    Shop.find({_id: {$in: [mongoose.Types.ObjectId(id)]}})
        .then((data)=>{
            if(data==null || data==''){
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: error
                })
            }
            else{
                ShopService.find({shop_id: {$in: [mongoose.Types.ObjectId(id)]}})
                  .then((docs)=>{
                      res.status(200).json({
                          status: true,
                          message: "Shop services get sucessfully",
                          data: docs
                      })
                  })
                  .catch((err)=>{
                      res.status(500).json({
                          status: false,
                          message: "Server error2. Please try again.",
                          error: err
                      })
                  })
            }
        })
        .catch((fault)=>{
            res.status(200).json({
                status: false,
                message: "This user doesn't have an active shop.",
                error: fault
            })
        })
}

module.exports = {
    register,
    update,
    viewShopServicesPerSeller
}