const res = require("express/lib/response");
const async = require("hbs/lib/async");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")

const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        maxlength:20
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:[4, "minimum password length must be 5"],
        maxlength:[8, "password length should exceed 8"]
    },
    confirmPassword:{
        type:String,
        required:true
    },
    phone:{
        type:Number
    },
    image:{
        type:String 
    },
    Token:[{
        token:{
            type:String
        }
    }]
})

adminSchema.methods.generateAuthToken = async function(){
    try {

        const token = await jwt.sign({_id:this._id.toString()}, "thisisadmintokenforauthenticationforadmin")
        this.Token = await this.Token.concat({token:token})
        return token
        await this.save()
        
    } catch (error) {
        res.send(error)
    }
}

adminSchema.methods.addInfo = async function(params){
    try {
        this.phone = await params.phone;
        await this.save()
        
    } catch (error) {
        res.send(error)
    }
}

const Admin = new mongoose.model("Admin", adminSchema);

module.exports = Admin;