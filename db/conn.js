const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://rahul:rahul@cluster0.of9as.mongodb.net/doccure").then(()=>{
    console.log("connection successfull...")
}).catch((err)=>{
    console.log(err);
})

module.exports = mongoose;