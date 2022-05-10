const mongoose = require("mongoose");
const { timeout } = require("nodemon/lib/config");

const appointmentSchema = new mongoose.Schema({
    docterName:{
        type:String
    },
    name:{
        type:String,
        required:true,
        minlength:3,
        maxlength:10
    },
    age:{
        type:Number
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        required:true,
    },
    image:{
        type:String
    },
    appointmentFor:{
        type:String
    },
    date:{
        type:Date,
        required:true
    },
    time:{
        type: String,
        required:true
    },
    bookingDate:{
        type:String,
        default:function(){
            let dt = new Date()
            return dt.getDate()+"/"+ dt.getMonth()+1+"/"+dt.getFullYear()+" "+dt.getHours()+":"+dt.getMinutes()
        }
    },
    payment:{
        amount:Number,
        orderId:String,
        paymentId:String,
        signature:String
    }
})

const Appointment = new mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;