var express = require('express');
var router = express.Router();

const ProductController = require('../../Controller/Admin/Product');
const CategoryController = require('../../Controller/Admin/Category');
const SubscriptionController = require('../../Controller/Admin/Subscription');
const UserSellersController = require('../../Controller/Admin/UserSellers'); // added by anirbank-93
const ServiceController = require('../../Controller/Admin/Service');         // added by anirbank-93
const ShopServiceController = require('../../Controller/Admin/ShopServices');// added by anirbank-93
const ServiceSubCategoryController = require('../../Controller/Admin/SubCategory');// added by anirbank-93
const CouponController = require('../../Controller/Admin/Coupon');
const OrderhistoryController = require('../../Controller/Admin/Orderhistory');
const ServicehistoryController = require('../../Controller/Admin/Servicehistory');
const UserController = require('../../Controller/Auth/User');
const MyaccountController = require('../../Controller/Admin/Myaccount');
const CmsController = require('../../Controller/Admin/Cms');
const FaqcatController = require('../../Controller/Admin/Faqcategory');
const FaqsubcatController = require('../../Controller/Admin/Faqsubcategory');
const FaqController = require('../../Controller/Admin/Faq');
const FeedbackController= require('../../Controller/Admin/Feedback');
const StatsController = require('../../Controller/Admin/Stats');
const UserQueries = require('../../Controller/Admin/UserQueries');




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

// router.post('/product/Product',upload.single("image"),ProductController.create)
router.post('/product/Product',ProductController.create)

router.get('/product/Product',ProductController.viewAll)
// router.put('/product/Product/:id',upload.single("image"),ProductController.update)
router.put('/product/Product/:id',ProductController.update)

router.delete('/product/Product/:id',ProductController.Delete)
router.put('/product/set-status/:id',ProductController.setStatus)
router.post('/product-uploadurl', upload.single("image"), ProductController.productImageUrl);

router.post('/subscription',SubscriptionController.create)
router.get('/subscription',SubscriptionController.viewAll)
router.put('/subscription/:id',SubscriptionController.update)
router.delete('/subscription/:id',SubscriptionController.Delete)
router.put('/subscription/set-status/:id',SubscriptionController.setStatus)

router.get('/subscription/purchasehistory',SubscriptionController.subscriptionHistory)

router.post('/subscription/purchasehistoryRepo',SubscriptionController.subscriptionHistoryRepo)

router.post('/category/Category',CategoryController.create)
router.get('/category/Category',CategoryController.viewAll)
router.put('/category/Category/:id',CategoryController.update)
router.delete('/category/Category/:id',CategoryController.Delete)
router.put('/category/set-status/:id', CategoryController.setStatus)

router.post('/faq/Category',FaqcatController.create)
router.get('/faq/Category',FaqcatController.viewAll)
router.put('/faq/Category/:id',FaqcatController.update)
router.delete('/faq/Category/:id',FaqcatController.Delete)
router.put('/faq/set-status/:id', FaqcatController.setStatus)

router.post('/faq/Faq',FaqController.create)
router.get('/faq/Faq',FaqController.viewAll)
router.put('/faq/Faq/:id',FaqController.update)
router.delete('/faq/Faq/:id',FaqController.Delete)
router.put('/faq/Faq/:id',FaqController.setStatus)

router.post('/faq/subcategory',FaqsubcatController.create)    // added by anirbank-93
router.get('/faq/subcategory', FaqsubcatController.viewAll)   // added by anirbank-93
router.put('/faq/subcategory/:id', FaqsubcatController.update)// added by anirbank-93
router.delete('/faq/subcategory/:id', FaqsubcatController.Delete)// added by anirbank-93
router.put('/faq/subcategory/set-status/:id', FaqsubcatController.setStatus)// added by anirbank-93
router.get('/faq/catsubcategory/:id', FaqsubcatController.viewsubcatOncat)

router.get('/userlist', UserSellersController.viewUserList)     // added by anirbank-93
router.get('/viewuser/:id', UserSellersController.viewUser)     // added by anirbank-93
router.get('/sellerlist', UserSellersController.viewSellerList) // added by anirbank-93
router.get('/viewseller/:id', UserSellersController.viewSeller)  // added by anirbank-93
router.put('/user/set-status/:id', UserSellersController.setStatus)// added by anirbank-93
router.put('/user/set-block/:id', UserSellersController.setBlock)// added by anirbank-93



router.post('/service',upload.single("image"),ServiceController.create)// added by anirbank-93
router.get('/service', ServiceController.viewAllServices)              // added by anirbank-93
router.put('/service/:id',upload.single("image"),ServiceController.update)// added by anirbank-93
router.delete('/service/:id', ServiceController.Delete)                   // added by anirbank-93
router.put('/service/set-status/:id',ServiceController.setStatus)// added by anirbank-93
router.post('/sellerComission-history',ServiceController.sellercomHistory)
router.put('/adminAccept/:id',ServiceController.updateAdminaccept)

router.get('/topProviders', ShopServiceController.viewTopServiceProvider); // added by anirbank-93
router.post('/most-sales-last-day-per-seller', ShopServiceController.lastDayMostSalesPerSeller);// added by anirbank-93

router.post('/service/subcategory',ServiceSubCategoryController.create)    // added by anirbank-93
router.get('/service/subcategory', ServiceSubCategoryController.viewAll)   // added by anirbank-93
router.put('/service/subcategory/:id', ServiceSubCategoryController.update)// added by anirbank-93
router.delete('/service/subcategory/:id', ServiceSubCategoryController.Delete)// added by anirbank-93
router.put('/service/subcategory/set-status/:id', ServiceSubCategoryController.setStatus)// added by anirbank-93

router.post('/coupon',CouponController.create)   
router.get('/coupon', CouponController.viewAll)  
router.put('/coupon/:id', CouponController.update)
router.delete('/coupon/:id', CouponController.Delete)
router.put('/coupon/set-status/:id', CouponController.setStatus)

router.get('/orderHistory', OrderhistoryController.viewAll)  
router.post('/orderHistoryrepo', OrderhistoryController.productViewAllrepo)  


router.get('/servicedetails', ServicehistoryController.viewAll);

router.post('/servicedetailsrepo', ServicehistoryController.reportViewAll);

router.get('/contactlist', UserController.ViewAllcontact);

router.put('/update-profile/:id', upload.single("image"), MyaccountController.updateProfile);
router.put('/update-password/:id', MyaccountController.updatePassword);
router.get('/get-profile/:id', MyaccountController.getProfile);

router.get('/feedback', FeedbackController.viewAllFeedback);
router.get('/feedback/:id', FeedbackController.viewFeedbackById);

router.post('/cms/About',upload.single("image"),CmsController.createNUpdatecms)
router.post('/cms/Blog',upload.single("image"),CmsController.createNUpdateblog)
router.get('/cms/Blog',CmsController.viewAllBlog)
router.get('/cms/About',CmsController.getAbout)
router.post('/cms/Privacy',CmsController.createNUpdateprivacy)
router.get('/cms/Privacy',CmsController.getPrivacy)
router.post('/cms/Cookie',CmsController.cookie)
router.get('/cms/Cookie',CmsController.getCookie)
router.post('/cms/Return',CmsController.returnpolicy)
router.get('/cms/Return',CmsController.getReturn)
router.post('/cms/Condition',CmsController.conditionpolicy)
router.get('/cms/Condition',CmsController.getCondition)
router.post('/cms/safetyguide',CmsController.saftyguide)
router.get('/cms/safetyguide',CmsController.getsaftyguide)
router.post('/cms/Associates',upload.single("image"),CmsController.createassociate)
router.get('/cms/Associates',CmsController.viewAllAsso)
router.put('/cms/Associates/:id',upload.single("image"),CmsController.updateassociate)
router.delete('/cms/Associates/:id',CmsController.Deleteassociate)
router.get('/sellercomission/:id',UserSellersController.sellercomHistory)
router.post('/paycomission',upload.single("image"),UserSellersController.paycomsion)
router.post('/cms/Banner',upload.single("image"),CmsController.createBanner)
router.get('/cms/Banner',CmsController.viewAllBanner)
router.put('/cms/Banner/:id',upload.single("image"),CmsController.updateBanner)
router.delete('/cms/Banner/:id',CmsController.Deletebanner)
router.put('/cms/Banner/setStatus/:id',CmsController.setBannerStatus)
router.post('/cms/achievement', upload.single("image"), CmsController.addAchievement)
router.get('/cms/achievement', CmsController.viewAllAchievements)
router.get('/cms/achievement/:id', CmsController.viewAchievementById)
router.put('/cms/achievement/:id', upload.single("image"), CmsController.editAchievement)
router.delete('/cms/achievement/:id', CmsController.deleteAchievement)
router.get('/cms/customerService', CmsController.viewCustomerservice)
router.get('/cms/customerService', CmsController.viewCustomerservice)
router.get('/cms/viewSubscribe', CmsController.viewSubscribe)
router.get('/cms/ContactusInfo', CmsController.getContactusInfo)

router.get('/withdraw-history/:id',UserSellersController.withdrawHistory);
router.get('/Kyc/:id',UserSellersController.getKyc);
router.post('/Priority',UserSellersController.setPriority);

router.get('/seller-requests', UserSellersController.getSellerRequest);
router.put('/approve-seller-requests/:id', UserSellersController.approveSellerRequest);
router.put('/reject-seller-requests/:id', UserSellersController.rejectSellerRequest);

router.get('/summary-stats', StatsController.summaryStats);

router.get('/user_queries', UserQueries.getUserQueries);








module.exports = router;