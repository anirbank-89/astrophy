var express = require('express');
var router = express.Router();

const ProductController = require('../../Controller/Admin/Product');



const multer = require('multer');
 
var storage = multer.memoryStorage()
var upload = multer({storage: storage});


router.get('/',function(req,res,next)
{
    return res.send({
        status:false
    })
})

router.use((req,res,next)=>{
    if (req.userType == "Admin") {
        next();
    } else {
        res.send({status: false, msg: "parmison not found" });
    }
})

// router.post('/product/addPrpduct',ProductController.create)
module.exports = router;