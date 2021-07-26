'use strict'

/**
 * Module exports.
 * @public
 */
var user = {};
var AdminController = require('../Controller/Auth/Admin');
var UserController = require('../Controller/Auth/User');



//Middleware
const parmisoen = [
    {
        url: "/admin/login",
    },
    {
        url: "/admin/register",
    },
    {
        url: "/user/login",
    },
    {
        url: "/user/register",
    },
    {
        url: "/user/listProducts",
    }

]

user.middleware = async (req, res, next) => {
    if (parmisoen.filter(it => it.url == req.url).length > 0) {
        next();
    } 
    else {
        if (!req.headers.authorization) {
            return res.status(200).json({ error: "No credentials sent!", status: false, credentials: false });
        } else {
            let authorization = req.headers.authorization
            let userData = null;
            let userType = typeof(req.headers.usertype) != "undefined" ? req.headers.usertype : "User";
            console.log(userType);
            if (userType == "Admin") {
                userData = await AdminController.getTokenData(authorization);
            }
            if (userType == "User") {
                userData = await UserController.getTokenData(authorization);
            }

           
            if (userData && userData != null) {
                    userData.password = null;
                    userData.token = null;
                    req.user = userData;
                    req.userType= userType;
                    req.token = req.headers.authorization,
                    next();
            } else {
                res.status(200).json({ error: "credentials not match", status: false, credentials: false });
            }

        }
    }

}



module.exports = user;