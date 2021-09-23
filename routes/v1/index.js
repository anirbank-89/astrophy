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
const middleware  = require('../../service/middleware').middleware;

const AdminRoute = require('./admin');
const UserRoute = require('./user');

/** ================================= without login url ================================= */
router.post('/admin/register', AdminController.register);
router.post('/admin/login', AdminController.login);

router.post('/user/register', UserController.register);
router.post('/user/email-verification', UserController.sendVerifyLink);
router.post('/user/login', UserController.login);

router.get('/user/listProducts', UserController.viewProductList);
router.get('/user/viewproduct/:id', UserProductController.viewSingleProduct);   // added by anirbank-93

router.get('/user/service', ServiceController.viewAllServices);// added by anirbank-93
router.get('/user/service/:id', ServiceController.viewService);// added by anirbank-93

router.get('/user/service/shop-services/:id', ServiceController.viewShopServicesPerService);// added by anirbank-93

router.post('/user/searchauto', SeaarchController.autoSearch);

router.post('/user/searchAll', SeaarchController.searchAll);

router.get('/user/shop/view-shopservice/:id', ShopServiceController.viewOneService);



/** ================================= without login url section end ================================ */



router.use(middleware);




router.use('/admin', AdminRoute);
router.use('/user', UserRoute);

module.exports = router;