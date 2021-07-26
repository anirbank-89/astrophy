var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({status: false})
});

const AdminController = require('../../Controller/Auth/Admin');
const UserController = require('../../Controller/Auth/User');
const middleware  = require('../../service/middleware').middleware;

const AdminRoute = require('./admin');
const UserRoute = require('./user');

/** ================================= without login url ================================= */

router.post('/admin/register', AdminController.register);
router.post('/admin/login', AdminController.login);
router.post('/user/register', UserController.register);
router.post('/user/login', UserController.login);
router.get('/user/listProducts', UserController.viewProductList);





/** ================================= without login url section end ================================ */



router.use(middleware);




router.use('/admin', AdminRoute);
router.use('/user', UserRoute);

module.exports = router;