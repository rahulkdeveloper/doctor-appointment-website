const express = require("express");
const async = require("hbs/lib/async");
const Appointment = require("../db/appointments")
const User = require("../db/user");
const Docter = require("../db/docter");
const Admin = require("../db/admin");
const multer = require("multer")
const path = require("path")
const adminAuth = require("../middleware/adminAuth");

const adminRouter = new express.Router()
adminRouter.use(express.urlencoded({extended:false}));

const Storage = multer.diskStorage({
    destination: "public/assets/uploads",
    filename:(req, file, cb)=>{
        cb(null, file.fieldname+"_"+Date.now()+ path.extname(file.originalname))
    }
})

const upload = multer({
    storage:Storage
}).single("profileImage")



// Admin login page
adminRouter.get("/admin-login", (req,res)=>{
    res.render("admin/admin-login") 
})

adminRouter.post("/admin-login", async(req,res)=>{
    
    try {
        const email = req.body.email;
        const password = req.body.password;
        const result = await Admin.findOne({email:email});

       //middleware executed//
       const token = await result.generateAuthToken() 
       console.log(token)

       // set cookie value //
       res.cookie("admin2", token, {
           expires: new Date(Date.now()+ 3000000),
           httpOnly:true
       })

       if(password === result.password){
           console.log("login successfully")
           res.redirect("/admin-index")
       }
       else{
           res.send("please write correct login details")
       }

    } catch (error) {
        res.send("<h1> please write correct detail"); 
    }
})

//admin logout //
adminRouter.get("/admin-logout", adminAuth, async(req,res)=>{
    try {
        let currentAdmin = req.admin
        res.clearCookie("admin2")
        console.log("logout successfully")

        await currentAdmin.save()
        res.render("admin/admin-login")
        
    } catch (error) {
        res.send(error)
    }
})

// Admin Register Page//
adminRouter.get("/admin-register", (req,res)=>{
    res.render("admin/register") 
})
adminRouter.post("/admin-register", upload, async(req,res)=>{
    try {

        const newAdmin = new Admin({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            confirmPassword: req.body.confirmPassword,
            image:req.file.filename
        })

        // middleware executed //
        const token = await newAdmin.generateAuthToken();
        console.log(token)

        // set cookie value//
        res.cookie("admin", token, {
            expires: new Date(Date.now()+ 300000),
            httpOnly: true
        })

        if(req.body.password === req.body.confirmPassword){
            const result = await newAdmin.save();
            res.redirect("/admin-index") 
        }
        else{
            res.send("password doest not match with confirm password")
        }
        
    } catch (error) {
        console.log(error)
        res.send(error)
    }
    
})

// Forgot password //
adminRouter.get("/admin-forgot-password", (req,res)=>{
    res.render("admin/forgot-password") 
})

//change password //
adminRouter.post("/admin-change-password",adminAuth,  async(req,res)=>{
    try {

        let currentAdmin = req.admin;
        if(currentAdmin.password === req.body.oldPassword){
            if(req.body.newPassword === req.body.confirmPassword){
                let result = await Admin.findByIdAndUpdate({_id:currentAdmin._id}, {$set:{password:req.body.newPassword}}, {new:true})
                res.redirect("/admin-profile")
            }
            else{
                res.send("new password does not match with confirm password")
            }
        }
        else{
            res.send("please write correct old password")
        }
        
    } catch (error) {
        res.send(error)
    } 
})


//Admin index Page
adminRouter.get("/admin-index",adminAuth, async(req,res)=>{
    try {
        let currentAdmin = req.admin;
        const result = await Appointment.find() 
        let paymentSum=0;
        result.forEach(element => {
            paymentSum += element.payment.amount
        });
        const result2 = await User.find()
        const result3 = await Docter.find()  
        res.render("admin/admin-index", {data:result, data2:result2, data3:result3, data4:currentAdmin, revenue:paymentSum}) 

    } catch (error) {
        console.log(error)
        res.send(error) 
    }
     
})

// Profile page //
adminRouter.get("/admin-profile", adminAuth, async(req,res)=>{
    try {

        let currentAdmin = req.admin;
        res.render("admin/profile",{data4:currentAdmin})
        
    } catch (error) {
        res.send(error)
    }  
})

// Profile update //
adminRouter.post("/admin-profile-update", adminAuth, async(req,res)=>{
    try {

        let currentAdmin = req.admin;
        let result = await Admin.findByIdAndUpdate({_id:currentAdmin._id}, req.body, {new:true})
        
        //middleware excecuted//
        const add = await result.addInfo(req.body);

        console.log(result)
        res.redirect("/admin-profile")
        
    } catch (error) {
        res.send(error)
    }  
})

//Admin appointment List page
adminRouter.get("/appointment-list",adminAuth, async(req,res)=>{
    try {

        const result = await Appointment.find();
        const doctor = await Docter.findOne({name:result.doctoName})
        res.render("admin/appointment-list", {data:result, data2:doctor})

    } catch (error) {
        console.log(error)
        res.send(error)
    } 
})

// Dotor-list //
adminRouter.get("/doctor-list",adminAuth, async(req,res)=>{
    try {

        const result = await Docter.find()
        res.render("admin/doctor-list", {data:result})
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

//add doctor page //
adminRouter.get("/add-docter",adminAuth, (req,res)=>{
    res.render("admin/add-docter")
   
})

adminRouter.post("/add-docter",adminAuth,upload, async(req,res)=>{
    try {

        const newDoctor = await Docter({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            services: req.body.services,
            specialization: req.body.specialization,
            password: "doccure",
            age: req.body.age,
            gender: req.body.gender,
            bio: req.body.bio,
            image: req.file.filename,
            price: req.body.rating_option
        }) 

        //middlware executed //
        const add = await newDoctor.addInfo2(req.body);

        const result = await newDoctor.save();
        res.redirect("/doctor-list")
        
    } catch (error) {
        res.send(error)
    }
   
})

// edit doctor profile details //
adminRouter.get("/edit-doctor-details/:id",adminAuth, async(req,res)=>{
    try {
        const id = req.params.id;
        const result = await Docter.findOne({_id:id});
        res.render("admin/edit-doctor-details", {data:result})
        
    } catch (error) {
        res.send(error)
    }
   
})


adminRouter.post("/edit-doctor-details/:id",adminAuth,upload, async(req,res)=>{
    try {
        let id = req.params.id;
        console.log(id)

        //middleware start//
        const currentDoctor = await Docter.findOne({_id:id})

        const add = await currentDoctor.addImage(req.file);
        

        const result = await Docter.findByIdAndUpdate({_id:id}, req.body, {new:true})
        console.log(result);
        res.redirect("/doctor-list")
    } catch (error) {
        res.send(error)
    }

   
})

// remove doctor from database //
adminRouter.get("/remove-doctor/:id",adminAuth, async(req,res)=>{
    try {
        const id = req.params.id;
        console.log(id);
        const result = await Docter.deleteOne({_id:id});
        res.redirect("/doctor-list")
        
    } catch (error) {
        res.send(error)
    }
   
})

//Patient  List page
adminRouter.get("/patient-list",adminAuth, async(req,res)=>{
    try {

        const result = await User.find();
        res.render("admin/patient-list", {data:result})
        
    } catch (error) {
        console.log(error)
        res.send(error)
    }
    
})

// Speacialities //
adminRouter.get("/specialities",adminAuth, (req,res)=>{
    res.render("admin/specialities") 
})

// Reviews Page //
adminRouter.get("/reviews",adminAuth, (req,res)=>{
    res.render("admin/reviews") 
})

// Settings Page //
adminRouter.get("/settings",adminAuth, (req,res)=>{
    res.render("admin/settings") 
})



module.exports = adminRouter;