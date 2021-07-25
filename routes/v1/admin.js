var express = require('express');
var router = express.Router();

const ProductController = require('../../Controller/Admin/Product');
const CategoryController = require('../../Controller/Admin/Category');



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

router.post('/product/Product',upload.single("image"),ProductController.create)
router.get('/product/Product',ProductController.viewAll)
router.get('/product/Allproducts',ProductController.viewPerCategory)
router.put('/product/Product/:id',upload.single("image"),ProductController.update)
router.delete('/product/Product/:id',ProductController.Delete)

router.post('/category/Category',CategoryController.create)
router.get('/category/Category',CategoryController.viewAll)
router.put('/category/Category/:id',CategoryController.update)
router.delete('/category/Category/:id',CategoryController.Delete)


module.exports = router;