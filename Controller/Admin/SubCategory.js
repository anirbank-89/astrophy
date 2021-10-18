var mongoose = require('mongoose')
var SubCategory = require('../../Models/subcategory')

const { Validator } = require('node-input-validator')

const create = async (req,res)=>{
    const v = new Validator(req.body,{
        name: "required",
        description: "required"
    })
    let matched = await v.check().then((val)=>val)
    if(!matched){
        return res.status(200).send({status: false, error: v.errors})
    }

    let subCategoryData = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        serviceid: mongoose.Types.ObjectId(req.body.serviceid),
        categoryid: mongoose.Types.ObjectId(req.body.categoryid)//
    }

    const subcategory = new SubCategory(subCategoryData)
    SubCategory.findOne({name: req.body.name})
      .then((data)=>{
          if(data!=null && data!=''){
              res.status(200).json({
                  status: false,
                  message: "This sub-category name already exists.",
                  data: data
              })
          }
          else{
              subcategory.save()
                .then((docs)=>{
                    res.status(200).json({
                        status: true,
                        message: "Service sub-category added successfully",
                        data: docs
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

const viewAll = async (req,res)=>{
    return SubCategory.aggregate(
        [
            {
                $lookup:{
                    from:"categories",//
                    localField:"categoryid",//
                    foreignField:"_id",
                    as:"category_data"//
                }
            },
            { $sort: { _id: -1 } },
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
            message: "Sub-categories get successfully",
            data: docs
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

const update = async (req,res)=>{
    const v = new Validator(req.body,{
        name: "required",
        description: "required"
    })
    let matched = await v.check().then((val)=>val)
    if(!matched){
        return res.status(200).send({status: false, error: v.errors})
    }

    return SubCategory.findOneAndUpdate(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
        req.body, 
        async (err,docs)=>{
            if(err){
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err
                })
            }
            else{
                res.status(200).json({
                    status: true,
                    message: "Service sub-category updated successfully!",
                    data: await docs
                })
            }
        }
    )
}

const Delete = async (req,res)=>{
    return SubCategory.remove(
        {_id: { $in : [mongoose.Types.ObjectId(req.params.id)]}}
    )
    .then((data)=>{
        res.status(200).json({
            status: true,
            message: "Service sub-category deleted successfully.",
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

module.exports = {
    create,
    viewAll,
    update,
    Delete
}