const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const async = require("hbs/lib/async");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:2,
        maxlength:20
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true,
        validate:function(value){
            if(!validator.isEmail(value)){
                throw new Error("enter valid email")
            }
        }
    },
    phone:{
        type:Number,
        required:true,
        unique: true, 
    },
    password:{
        type:String,
        required:true,
        minlength:5,
        maxlength:8
    },
    image:{
        type:String
    },
    bloodGroup:{
        type:String
    },
   Address:{
       address:String,
       city:String,
       state:String,
       pincode:String,
       country:String 
   },
    Tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

userSchema.methods.generateAuthToken = async function(next){
    try {
        const token = await jwt.sign({_id:this._id.toString()}, "mynameisrahulkumariamplayingcricket")
        this.Tokens = this.Tokens.concat({token:token})
        return token;
        await this.save()
        
    } catch (error) {
        console.log(error)
    }
}

userSchema.methods.addInfo = async function(params, params2){
    try {

        console.log("middleware start")
        this.Address.address= await params.address
        this.Address.city = await params.city
        this.Address.state = await params.state
        this.Address.pincode = await params.pincode
        this.Address.country = await params.country 
        this.image = await params2.filename
        await this.save()
        
    } catch (error) {
        console.log(error)
    }
}

const User = new mongoose.model("User", userSchema);

module.exports = User;