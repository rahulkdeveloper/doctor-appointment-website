const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")
const async = require("hbs/lib/async");
const Admin = require("../db/admin");

const adminAuth = async function(req,res,next){
    try {

        const token = await req.cookies.admin2;
        const adminVerify = await jwt.verify(token, "thisisadmintokenforauthenticationforadmin");
        // console.log(adminVerify)

        const user = await Admin.findOne({_id:adminVerify._id})
        req.admin = user;
        req.token = token;
        next()
        
    } catch (error) {
        res.redirect("/admin-login")
    }
}

module.exports = adminAuth;