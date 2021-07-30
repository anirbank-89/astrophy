var mongoose = require('mongoose')
var ShopService = require('../../Models/shop_service')
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
              message: "Server error. Service name already exists.",
              errors: err
          })
      })
}

module.exports = {
    register,
}