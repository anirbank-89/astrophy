var express = require('express');
var router = express.Router();

const ProductController = require('../../Controller/Admin/Product');
const CategoryController = require('../../Controller/Admin/Category');
const SubscriptionController = require('../../Controller/Admin/Subscription');
const UserSellersController = require('../../Controller/Admin/UserSellers'); // added by anirbank-93
const ServiceController = require('../../Controller/Admin/Service');         // added by anirbank-93
const ServiceSubCategoryController = require('../../Controller/Admin/SubCategory');// added by anirbank-93
const CouponController = require('../../Controller/Admin/Coupon');
const OrderhistoryController = require('../../Controller/Admin/Orderhistory');
const ServicehistoryController = require('../../Controller/Admin/Servicehistory');
const UserController = require('../../Controller/Auth/User');
const MyaccountController = require('../../Controller/Admin/Myaccount');



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
router.put('/product/Product/:id',upload.single("image"),ProductController.update)
router.delete('/product/Product/:id',ProductController.Delete)

router.post('/subscription',SubscriptionController.create)
router.get('/subscription',SubscriptionController.viewAll)
router.put('/subscription/:id',SubscriptionController.update)
router.delete('/subscription/:id',SubscriptionController.Delete)

router.get('/subscription/purchasehistory',SubscriptionController.subscriptionHistory)

router.post('/subscription/purchasehistoryRepo',SubscriptionController.subscriptionHistoryRepo)






router.post('/category/Category',CategoryController.create)
router.get('/category/Category',CategoryController.viewAll)
router.put('/category/Category/:id',CategoryController.update)
router.delete('/category/Category/:id',CategoryController.Delete)

router.get('/userlist', UserSellersController.viewUserList)     // added by anirbank-93
router.get('/viewuser/:id', UserSellersController.viewUser)     // added by anirbank-93
router.get('/sellerlist', UserSellersController.viewSellerList) // added by anirbank-93
router.get('/viewseller/:id', UserSellersController.viewSeller)  // added by anirbank-93

router.post('/service',upload.single("image"),ServiceController.create)// added by anirbank-93
router.get('/service', ServiceController.viewAllServices)              // added by anirbank-93
router.put('/service/:id',upload.single("image"),ServiceController.update)// added by anirbank-93
router.delete('/service/:id', ServiceController.Delete)                   // added by anirbank-93

router.post('/service/subcategory',ServiceSubCategoryController.create)    // added by anirbank-93
router.get('/service/subcategory', ServiceSubCategoryController.viewAll)   // added by anirbank-93
router.put('/service/subcategory/:id', ServiceSubCategoryController.update)// added by anirbank-93
router.delete('/service/subcategory/:id', ServiceSubCategoryController.Delete)// added by anirbank-93

router.post('/coupon',CouponController.create)   
router.get('/coupon', CouponController.viewAll)  
router.put('/coupon/:id', CouponController.update)
router.delete('/coupon/:id', CouponController.Delete)

router.get('/orderHistory', OrderhistoryController.viewAll)  
router.post('/orderHistoryrepo', OrderhistoryController.productViewAllrepo)  


router.get('/servicedetails', ServicehistoryController.viewAll);

router.post('/servicedetailsrepo', ServicehistoryController.reportViewAll);

router.get('/contactlist', UserController.ViewAllcontact);

router.put('/update-profile/:id', upload.single("image"), MyaccountController.updateProfile);
router.put('/update-password/:id', MyaccountController.updatePassword);



module.exports = router;