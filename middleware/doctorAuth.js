const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const async = require("hbs/lib/async");
const dotenv = require("dotenv")
const Docter = require("../db/docter")

const doctorAuth = async function(req,res, next){
    try {
        const token = req.cookies.doctor2
        const doctorVerify = await jwt.verify(token, process.env.SECRET_KEY)
        const doctor = await Docter.findOne({_id:doctorVerify.id})
        req.doctor = doctor;
        next()
        
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

module.exports = doctorAuth;