var mongoose = require('mongoose');
var About = require("../../Models/about");
var Blog = require("../../Models/blog");
var Upload = require("../../service/upload");

const { Validator } = require('node-input-validator');

const createNUpdatecms = async (req,res)=>{
    const v = new Validator(req.body,{
        content1: 'required',
        content2: 'required'
    });
    let matched = await v.check().then((val)=>val)
    if(!matched){
        res.status(200).send({ status: false, error: v.errors });
    }
    
    console.log(req.body);
    // return false;
    let cmsData = await About.find().exec();
    console.log(cmsData.length)
    // return false;
    //   .then((data)=>{
          if (cmsData.length==0) {
            

            let cms = {
                _id: mongoose.Types.ObjectId(),
                content1: req.body.content1,
                content2: req.body.content2
            }
            if (req.file != null &&
                req.file != "" &&
                typeof req.file != "undefined") {
                let image_url = await Upload.uploadFile(req, "blog");
                cms.image = image_url;
              }
            const cmsdt = new About(cms)
            
            cmsdt.save().then((docs)=>{
                res.status(200).json({
                    status: true,
                    success: true,
                    message: "Abount Us successfully created",
                    data: docs
                });
            })
            .catch((err)=>{
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again",
                    error: err
                });
            });
          }
          else {
              //b
            //   console.log(req.files)
            //   if(Object.keys(req.files).length === 0 )
            //   {
            //     console.log("ok")
            //   }
            //   else
            //   {
            //     console.log("notok")
            //   }
            //   return false;
            let updateObj = {
                content1: req.body.content1,
                content2: req.body.content2
            }
            if (req.file != null &&
                req.file != "" &&
                typeof req.file != "undefined") {
                let image_url = await Upload.uploadFile(req, "blog");
                updateObj.image = image_url;
              }
            About.findOneAndUpdate(
                {_id: { $in : [mongoose.Types.ObjectId(req.body.id)] } }, 
                updateObj,
                { new: true },
                // req.body,
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
                            message: "About Us updated successfully!",
                            data: await docs
                        });
                    }
                }
            )
          }
}

const getAbout = async (req, res) => {
    return About.aggregate(
        [
            {
                $project: {
                    _v: 0
                }
            }
        ]
    )
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "About get successfully",
                data: docs
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err
            })
        })
}

const createNUpdateblog = async (req,res)=>{
    const v = new Validator(req.body,{
        heading:"required",
        content1: 'required'
    });
    let matched = await v.check().then((val)=>val)
    if(!matched){
        res.status(200).send({ status: false, error: v.errors });
    }
    

        let cms = {
            _id: mongoose.Types.ObjectId(),
            heading:req.body.heading,
            content1: req.body.content1
        }
        if (req.file != null &&
            req.file != "" &&
            typeof req.file != "undefined") {
            let image_url = await Upload.uploadFile(req, "blog");
            cms.image = image_url;
          }
        const cmsdt = new Blog(cms)
        
        cmsdt.save().then((docs)=>{
            res.status(200).json({
                status: true,
                success: true,
                message: "Blog successfully created",
                data: docs
            });
        })
        .catch((err)=>{
            res.status(500).json({
                status: false,
                message: "Server error. Please try again",
                error: err
            });
        });
          
        
}

const viewAllBlog = async (req, res) => {
    return Blog.aggregate(
        [
            { $sort: { _id: -1 } },
            {
                $project: {
                    _v: 0
                }
            }
        ]
    )
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "Blog get successfully",
                data: docs
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err
            })
        })
}

module.exports = {
    createNUpdatecms,
    createNUpdateblog,
    viewAllBlog,
    getAbout
}
