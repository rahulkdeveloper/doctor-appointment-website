const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const async = require("hbs/lib/async");
const User = require("../db/user")

const auth = async (req,res,next)=>{
    try {

        const token = req.cookies.jwt2;
        const userVerify = await jwt.verify(token, "mynameisrahulkumariamplayingcricket");

        const user = await User.findOne({_id:userVerify._id})
        req.user = user
        req.token = token
        next()
        
    } catch (error) {
        res.redirect("/login") 
    }
}

module.exports = auth;