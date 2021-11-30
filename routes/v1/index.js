var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({status: false})
});

const AdminController = require('../../Controller/Auth/Admin');
const UserController = require('../../Controller/Auth/User');
const UserProductController = require('../../Controller/User/Product');// added by anirbank-93
const ServiceController = require('../../Controller/User/Service');    // added by anirbank-93
const SeaarchController = require('../../Controller/User/Search')
const ShopServiceController = require("../../Controller/User/ShopServices");
const PaypalPaymentController = require("../../Controller/User/Paypalpayment");
const StripesubscriptionController = require("../../Controller/User/Stripesubscription");
const FeedbackController = require('../../Controller/User/Feedback');
const CmsController = require('../../Controller/User/Cms');

// new updates



const middleware  = require('../../service/middleware').middleware;

const AdminRoute = require('./admin');
const UserRoute = require('./user');

/** ================================= without login url ================================= */
router.post('/admin/register', AdminController.register);
router.post('/admin/login', AdminController.login);

router.post('/user/register', UserController.register);
router.post('/user/email-verification', UserController.sendVerifyLink);// added by anirbank-93
router.post('/user/verify-email', UserController.afterEmailVerify);    // added by anirbank-93
router.post('/user/login', UserController.login);

router.get('/user/listProducts/:page', UserController.viewProductList);
router.get('/user/spellCasting', UserController.viewAllServices);
router.get('/user/singlespellCasting/:id', UserController.viewSingleSpell);
router.get('/user/viewproduct/:id', UserProductController.viewSingleProduct);   // added by anirbank-93

router.get('/user/service', ServiceController.viewAllServices);// added by anirbank-93
router.get('/user/service/:id', ServiceController.viewService);// added by anirbank-93

router.get('/user/service/shop-services/:id/:page', ServiceController.viewShopServicesPerService);// added by anirbank-93

router.post('/user/searchauto', SeaarchController.autoSearch);

router.post('/user/searchAll', SeaarchController.searchAll);

router.post('/user/serachProviders', SeaarchController.serachProviders);

router.get('/user/shop/view-shopservice/:id', ShopServiceController.viewOneService);

router.get('/user/topProviders',ShopServiceController.viewTopServiceProvider);

router.get('/user/singleProviders/:id',ShopServiceController.viewSingleServiceProvider);


router.get('/user/shop/allprovidedServiceList/:id',ShopServiceController.viewAllshopservicelist);

router.post('/user/allrelatedServiceList',ShopServiceController.viewAllrelatedService);

router.post('/user/searchSevice', SeaarchController.serviceSearch);

router.post('/user/searchProduct', SeaarchController.productSearch);

router.get('/user/paypalpay/:amt', PaypalPaymentController.pay);

router.get('/user/paypalsuccess', PaypalPaymentController.success);

router.get('/user/paypalcancel', PaypalPaymentController.cancel);

router.post('/user/stripe/create-payment', StripesubscriptionController.create_payment);

router.post('/user/stripe/subs-new', StripesubscriptionController.subs_new);

router.post('/user/stripe/subs-retrive', StripesubscriptionController.subsretrive);

router.post('/user/stripe/subs-cancel', StripesubscriptionController.subcancel);

router.post('/user/contactus', UserController.contactus);

router.get('/user/cms/achievement', CmsController.viewAllAchievements)
router.get('/user/cms/achievement/:id', CmsController.viewAchievementById)

router.post('/user/feedback', FeedbackController.addFeedback);

router.get('/user/Blog',CmsController.viewAllBlog)
router.get('/user/singleBlog/:id',CmsController.viewSingleBlog)
router.get('/user/viewallcat',CmsController.viewAllfaqcat)
router.get('/user/viewallsubcat/:id',CmsController.viewAllfaqsubcat)
router.post('/user/allFaq',CmsController.viewAllfaq)
router.get('/user/aboutus',CmsController.getAbout)
router.get('/user/privacy',CmsController.getPrivacy)
router.get('/user/condition',CmsController.getCondition)
router.post('/user/createCservice',CmsController.createCservice);
router.post('/user/createSubscribe',CmsController.createSubscribe);













/** ================================= without login url section end ================================ */



router.use(middleware);




router.use('/admin', AdminRoute);
router.use('/user', UserRoute);

module.exports = router;