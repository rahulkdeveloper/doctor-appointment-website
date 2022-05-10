const express = require("express");
const Docter = require("../db/docter");
const multer = require("multer")
const path = require("path")
const doctorAuth = require("../middleware/doctorAuth");
const async = require("hbs/lib/async");
const Appointment = require("../db/appointments");
const User = require("../db/user");

const docterRouter = new express.Router();

const Storage = multer.diskStorage({
    destination: "public/assets/uploads",
    filename:(req,file, cb)=>{
        cb(null, file.fieldname+"_"+ Date.now()+ path.extname(file.originalname))
    }
})

const upload = multer({
    storage: Storage
}).single("profileImage")

//docter register page
docterRouter.get("/doctor-register", (req,res)=>{
    res.render("doctor-register")
})

docterRouter.post("/doctor-register", upload,  async(req,res)=>{
    try {
        
        const docterRegister = new Docter({
            name : req.body.name,
            email : req.body.email,
            phone: req.body.phone,
            password : req.body.password,
            services:req.body.services,
            specialization:req.body.specialization,
            image: req.file.filename
        })

        //middleware excecute//
        const token = await docterRegister.generateAuthToken()

        //set cookie value//
        res.cookie("doctor", token, {
            expires: new Date(Date.now()+ 300000),
            httpOnly:true
        })

        const result = await docterRegister.save()
        res.render("doctor-dashboard", {data:result})
    
    } catch(err){
        console.log(err)
        res.send("please try again")
    }
})

// Docter login //
docterRouter.get("/doctor-login", (req,res)=>{
    res.render("doctor-login")
})

docterRouter.post("/doctor-login", async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const result = await Docter.findOne({email: email});

        //middleware excecute//
        const token = await result.generateAuthToken()
        console.log(token)

        //set cookie value//
        res.cookie("doctor2", token, {
            expires: new Date(Date.now()+ 3000000),
            httpOnly:true
        })

        if(password === result.password){
            const appointmentList = await Appointment.find({docterName:result.name})
            res.render("doctor-dashboard", {data:result, apt:appointmentList})
        }
        else{
            res.send("please write correct login details")
        }
        
    } catch (error) {
        console.log(error)
        res.send("please write correct login details")
    }
})

// logout //
docterRouter.get("/doctor-logout", doctorAuth, async(req,res)=>{
    try {
        const currentDoctor = req.doctor
        res.clearCookie("doctor2");

        console.log("logout successfully")
        await currentDoctor.save()
        res.render("doctor-login")
        
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})


// Forgot password//
docterRouter.get("/doctor-forgot-password", async(req,res)=>{
   res.render("doctor-forgot-password")
})

docterRouter.post("/doctor-forgot-password", async(req,res)=>{
    try {
        const email = req.body.email;
        const result = await Docter.findOne({email:email});
        console.log(result)
        res.render("doctor-change-password", {data:result});
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})


// Change password//
docterRouter.get("/doctor-change-password",doctorAuth, (req,res)=>{
    try {
        let currentDoctor = req.doctor;

        res.render("doctor-change-password", {data:currentDoctor})
        
    } catch (error) {
        res.send(error)
    }
})

docterRouter.post("/doctor-change-password",doctorAuth, async(req,res)=>{
    try {
        
        const currentDoctor = req.doctor
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        if(newPassword === confirmPassword){

            const result = await Docter.findByIdAndUpdate({_id:currentDoctor._id}, {$set:{password:newPassword}}, {new:true});
            console.log(result)
            res.redirect("/doctor-dashboard")
        }
        else{
            res.send("new password does not matched with confirm password")
        }

    } catch (error) {
        console.log(error)
        res.send(error)
    }
})



// Docter dashboard//
docterRouter.get("/doctor-dashboard",doctorAuth, async(req,res)=>{
    try {

        const currentDoctor = req.doctor;
        // console.log(currentDoctor.name)
        const appointmentList = await Appointment.find({docterName:currentDoctor.name})
        // console.log(appointmentList)
        res.render("doctor-dashboard", {data:currentDoctor, apt:appointmentList}) 
        
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

//Appointments page //
docterRouter.get("/appointments", doctorAuth,async(req,res)=>{
    try {
        let currentDoctor = req.doctor
        const appointmentList = await Appointment.find({docterName:currentDoctor.name})
        const user = await User.findOne({email:"ramesh@gmail.com"})
        console.log(user)
        res.render("appointments", {data:currentDoctor, apt:appointmentList, user:user})
        
    } catch (error) {
        res.send(error)
    }
})

docterRouter.post("/appointments", doctorAuth,async(req,res)=>{
    try {
        let param = req.body;
        const result = await Appointment.findOne({_id:param.data})
        res.send(result)
        
    } catch (error) {
        res.send(error)
    }
})

// My patients page //
docterRouter.get("/my-patients", doctorAuth,async(req,res)=>{
    try {
        let currentDoctor = req.doctor
        const appointmentList = await Appointment.find({docterName:currentDoctor.name})
        res.render("my-patients", {data:currentDoctor, pt:appointmentList})
        
    } catch (error) {
        res.send(error)
    }
})

// Schedule timings page //
docterRouter.get("/schedule-timings", doctorAuth,(req,res)=>{
    try {
        let currentDoctor = req.doctor
        res.render("schedule-timings", {data:currentDoctor}) 
        
    } catch (error) {
        res.send(error) 
    }
})

// Invoices page //
docterRouter.get("/invoices", doctorAuth,async(req,res)=>{
    try {
        let currentDoctor = req.doctor
        const appointmentList = await Appointment.find({docterName:currentDoctor.name})
        res.render("invoices", {data:currentDoctor, apt:appointmentList})
        
    } catch (error) {
        res.send(error)
    }
})

// Invoices page //
docterRouter.get("/doctor-reviews", doctorAuth,(req,res)=>{
    try {
        let currentDoctor = req.doctor
        res.render("doctor-reviews", {data:currentDoctor})
        
    } catch (error) {
        res.send(error)
    }
})

// Doctor profile setting //
docterRouter.get("/doctor-profile-settings",doctorAuth, (req,res)=>{
    try {
        let currentDoctor = req.doctor
        res.render("doctor-profile-settings", {data:currentDoctor})
        
    } catch (error) {
        res.send(error) 
    }
})

docterRouter.post("/doctor-profile-settings",doctorAuth,upload, async(req,res)=>{
    try {
        let currentDoctor = req.doctor
        
        //middleware executed//
        let add = await currentDoctor.addInfo(req.body, req.file)

        let result = await Docter.findByIdAndUpdate({_id:currentDoctor._id}, req.body, {new:true})
        console.log(result)
        res.redirect("/doctor-profile-settings") 
        
    } catch (error) {
        res.send(error)  
    }
})

// Doctor profile  //
docterRouter.get("/doctor-profile/:id", async(req,res)=>{
    try {

        const id = req.params.id
        const result = await Docter.findOne({_id:id});
        console.log(result)
        res.render("doctor-profile", {data:result})
        
    } catch (error) {
        res.send(error)
    }  
})




module.exports = docterRouter;