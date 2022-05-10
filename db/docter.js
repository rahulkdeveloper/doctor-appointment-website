const async = require("hbs/lib/async");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");
const dotenv = require("dotenv");
const { required } = require("nodemon/lib/config");

const DocterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength:3,
        maxlength:20
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    }, 
    password:{
        type:String, 
        required:true
    },
    services:{
        type:String,
        required:true
    },
    specialization:{
        type:String,
        required:true
    },
    age:{
        type:Number
    },
    gender:{
        type:String
    },
    bio:{
        type:String
    },
    clinicInfo:{
        clinicName: String,
        clinicAddress:String
    },
    contactDetails:{
        address1:String,
        address2:String,
        city:String,
        state:String,
        country:String,
        pincode:String
    },
    price:{
        type:String
    },
    education:{
        degree:String,
        collegeName:String,
        passingYear:String
    },
    Experiance:{
        hospitalName:String,
        from:Number,
        to:Number,
        designation:String
    },
    awards:{
        award:String,
        awardYear:Number
    },
    image:{
        type:String
    },
    tokens:[{
        token:{
            type:String 
        }
    }]
})

DocterSchema.methods.generateAuthToken = async function(){
    try {

        const token = await jwt.sign({id: this._id.toString()}, process.env.SECRET_KEY);
        // console.log(token)
        this.tokens = this.tokens.concat({token:token})
        return token
        await this.save()
        
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

// addInfo middleware (function)//
DocterSchema.methods.addInfo = async function(params, params2){
    try {
        console.log("middleware start")
        this.age = await params.age
        this.bio = await params.bio;
        this.clinicInfo.clinicName = await params.clinicName;
        this.clinicInfo.clinicAddress = await params.clinicAddress;
        this.contactDetails.address1 = await params.address1;
        this.contactDetails.address2 = await params.address2;
        this.contactDetails.city = await params.city;
        this.contactDetails.state = await params.state;
        this.contactDetails.country = await params.country;
        this.contactDetails.pincode = await params.pincode;
        this.education.degree = await params.degree;
        this.education.collegeName = await params.collegeName;
        this.education.passingYear = await params.passingYear;
        this.Experiance.hospitalName = await params.hospitalName;
        this.Experiance.from = await params.from;
        this.Experiance.to = await params.to;
        this.Experiance.designation = await params.designation;
        this.price = await params.rating_option;
        this.awards.award = await params.award;
        this.awards.awardYear = await params.awardYear
        if(params2 == undefined){
            console.log("image is null")
            this.image = await this.image
        }
        else{
            this.image = await params2.filename
        }
        await this.save()
        
    } catch (error) {
        res.send(error)
    }
}

// DocterSchema.pre("save", async function(next){
//     console.log("middleware start");
//     const randomPassword = ()=>{
//         return  Math.floor(Math.random()*10000)
//     }
//     console.log(randomPassword())
//     this.password = this.password+ randomPassword() 
//     next()
// })

DocterSchema.methods.addInfo2 = async function(params){
    try {

        console.log("middleware start")
        const randomPassword = ()=>{
            return Math.floor(Math.random()*10000)
        }
        console.log("hello")
        this.password = this.password + randomPassword()
        this.clinicInfo.clinicName = await params.clinicName;
        console.log("hello okk")
        this.clinicInfo.clinicAddress = await params.clinicAddress;
        this.contactDetails.address1 = await params.address1;
        this.contactDetails.address2 = await params.address2;
        this.contactDetails.city = await params.city;
        this.contactDetails.state = await params.state;
        this.contactDetails.country = await params.country;
        this.contactDetails.pincode = await params.pincode;
        this.education.degree = await params.degree;
        this.education.collegeName = await params.collegeName;
        this.education.passingYear = await params.passingYear;
        this.Experiance.hospitalName = await params.hospitalName;
        this.Experiance.from = await params.from;
        this.Experiance.to = await params.to;
        this.Experiance.designation = await params.designation;
        this.awards.award = await params.award;
        this.awards.awardYear = await params.awardYear
        await this.save()
        
    } catch (error) {
        res.send(error)
    }
}

DocterSchema.methods.addImage = async function(params, next){
    try {
        console.log("middleware start")
        console.log(this.image)
        console.log(params)
        if(params == undefined){
            console.log("params is undefined")
            this.image == await this.image 
        }
        else{

            this.image = await params.filename
        }
        await this.save()
        
    } catch (error) {
        res.send(error)
    }
}

const Docter = new mongoose.model("Docter", DocterSchema);

module.exports = Docter