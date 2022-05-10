const express = require("express");
const validator = require("validator");
const User = require("../db/user");
const Appointment = require("../db/appointments");
const Docter = require("../db/docter")
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
const { append } = require("express/lib/response");
const async = require("hbs/lib/async");
const Doctor = require("../db/docter")
const bodyParser = require("body-parser");
const razorpay = require("razorpay");

const router = new express.Router();
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser())

const Storage = multer.diskStorage({
    destination: "public/assets/uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: Storage
}).single("profileImage")



// register page //
router.get("/register", (req, res) => {
    res.render("register")
})

router.post("/register", upload, async (req, res) => {
    try {
        // const success = req.file.filename+ "uploaded successfull"
        const userRegister = new User({
            name: req.body.name,
            age: req.body.age,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            image: req.file.filename
        })

        const token = await userRegister.generateAuthToken()
        console.log(`this is token ${token}`)

        // set cookie 
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 300000),
            httpOnly: true
        })

        // console.log(req.file.filename)
        const result = await userRegister.save();
        res.render("patient-dashboard", { data: result })

    } catch (error) {
        console.log(error)
    }
})

//Login option Page//
router.get("/login-option", (req, res) => {
    res.render("login-option")
})

// login page //
router.get("/login", (req, res) => {
    res.render("login")
})

router.post("/login", async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const result = await User.findOne({ email: email });

        const token = await result.generateAuthToken()
        console.log(token)

        //set cookie//
        res.cookie("jwt2", token, {
            expires: new Date(Date.now() + 3000000),
            httpOnly: true
        })

        if (password === result.password) {
            res.render("patient-dashboard", { data: result })
        }
        else {
            res.send("please write correct email and password")
        }

    } catch (error) {
        res.send("<h2>please fill correct login details </h2>")
    }
})

// patient  logout //
router.get("/logout", auth, async (req, res) => {
    try {
        let currentUser = req.user

        // res.user.Tokens = req.user.Tokens.filter(element=>{
        //     return element.token !== req.token
        // })

        res.clearCookie("jwt2")

        console.log("logout successfully")
        await currentUser.save()
        res.render("login")

    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

//search doctor page//
router.get("/search-docter", async (req, res) => {
    try {
        const result = await Docter.find();
        res.render("search", { data: result, css: "hide" })

    } catch (error) {
        res.send(error)
    }
})

router.post("/search-doctor", async (req, res) => {
    try {
        const genderType = req.body.gender_type;
        const specialistType = req.body.select_specialist;
        console.log(genderType, " ", specialistType)
        if (genderType !== undefined && specialistType !== undefined) {

            const result2 = await Docter.find({ $and: [{ gender: genderType }, { specialization: specialistType }] })
            res.render("search", { data: result2, css: "hide" })
        }
        else if (genderType === undefined && specialistType !== undefined) {
            const result2 = await Docter.find({ specialization: specialistType })
            res.render("search", { data: result2, css: "hide" })
        }
        else if (genderType !== undefined && specialistType === undefined) {
            const result2 = await Docter.find({ gender: genderType })
            res.render("search", { data: result2, css: "hide" })
        }
        else {
            const result2 = await Docter.find()
            res.render("search", { data: result2, css: "hide" })
        }


    } catch (error) {
        res.send(error)
    }
})

// Home page search for doctor
router.post("/home-search-doctor", async (req, res) => {
    try {
        const state = req.body.location;
        const specializationType = req.body.disease;
        console.log(state, " ", specializationType);

        const result2 = await Docter.find({ $and: [{ "contactDetails.state": state }, { specialization: specializationType }] })
        res.render("search", { data: result2, data2: result2.length, cityName: state, specialization: specializationType })


    } catch (error) {
        res.send(error)
    }
})


//forgot-password//
router.get("/forgot-password", (req, res) => {
    res.render("forgot-password")
})

router.post("/forgot-password", auth, async (req, res) => {
    try {

        const userEmail = req.body.email;
        const result = await User.find({ email: userEmail });
        console.log(result);
        res.render("change-password", { data: result[0] })

    } catch (error) {
        console.log(error);

    }
})

//change-password//
router.get("/change-password", auth, async (req, res) => {
    try {

        let currentUser = req.user;
        res.render("change-password", { data: currentUser })

    } catch (error) {
        res.send(error)
    }
})

router.post("/change-password", auth, async (req, res) => {
    try {

        const currentUser = req.user
        const newPassword = req.body.password
        const confirmPassword = req.body.confirmPassword
        if (newPassword === confirmPassword) {

            const result = await User.findByIdAndUpdate({ _id: currentUser._id }, req.body, { new: true });
            res.redirect("/patient-dashboard")
        }
        else {
            res.send("new passowrd does not match with confirm passord")
        }

    } catch (error) {
        console.log(error)
        res.send("try again")
    }

})


//patient dashboard //
router.get("/patient-dashboard", auth, async (req, res) => {
    try {
        let currentUser = req.user
        console.log(currentUser)
        res.render("patient-dashboard", { data: currentUser })

    } catch (error) {
        console.log(error)
        res.send(error)
    }

})

// razorpay setup //
let instance = new razorpay({
    key_id: "rzp_test_O1cfhf7n3DQiga", // your `KEY_ID`
    key_secret: "dWb5beJxy2J6kUhCLuQPnZBc" // your `KEY_SECRET`
})

//Booking page //
router.get("/booking/:id",auth, async (req, res) => {
    try {
        let currentUser = req.user;
        const id = req.params.id
        const name = await Docter.findById({ _id: id })
        res.render("booking", { data: name })
    } catch (error) {
        res.send(error)
    }
})
router.post("/booking/:id",auth, async (req, res) => {
    try {
        const id = req.params.id
        const currentUser = req.user
        const doctor = await Docter.findById({ _id: id })
        const bookingDetails = { date: req.body.date, time: req.body.time, fee: req.body.fee}
        let options = {
            amount: (req.body.fee) * 100,
            currency: "INR",

        }
        instance.orders.create(options, function (err, data) {
            res.render("checkout", { order_id: data, data: doctor, data2: bookingDetails, user:currentUser})
        })
        // res.render("checkout",{data:doctor, data2:bookingDetails})

    } catch (error) {
        console.log(error)
        res.end(error)
    }
})

// Checkout page //
router.get("/checkout",auth, (req, res) => {
    let currentUser = req.user 
    res.render("checkout" ,{user:currentUser})
})

router.post("/checkout/:id",auth, async (req, res) => {
    try {
        let currentUser = req.user
        body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
        var crypto = require("crypto");
        var expectedSignature = crypto.createHmac('sha256', "dWb5beJxy2J6kUhCLuQPnZBc")
            .update(body.toString())
            .digest('hex');
        console.log("sig" + req.body.razorpay_signature);
        console.log("sig" + expectedSignature);
        if (expectedSignature === req.body.razorpay_signature) {
            const newappointment = new Appointment({
                docterName: req.body.doctorName,
                name: req.body.name,
                age: req.body.age,
                email: req.body.email,
                phone: req.body.phone,
                image: currentUser.image,
                appointmentFor: req.body.appointmentFor,
                date: req.body.date,
                time: req.body.time,
                payment:{
                    amount:req.body.fee,
                    orderId:req.body.razorpay_order_id,
                    paymentId: req.body.razorpay_payment_id,
                    signature: req.body.razorpay_signature
                }
            })
            const result = await newappointment.save()
            
            res.render("booking-success", { status: "success", docterName: req.body.doctorName,data:{date:req.body.date, time:req.body.time}, data2:result._id })
        }
        else {
            res.render("booking-success", { data: "failure" })
        }

    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

router.get("/booking-success", async(req, res) => {
    res.render("booking-success")
})

// invoice page // 
router.get("/invoice-view/:id", async(req, res) => {
    try {
        const id = req.params.id
        const result = await Appointment.findById({_id:id})
        const doctor = await Docter.findOne({name:result.docterName})
        res.render("invoice-view", {data:result, data2:doctor})

        
    } catch (error) {
        res.send(error)
    }
})

//Patient profile setting//
router.get("/profile-settings", auth, async (req, res) => {
    try {
        const currentUser = req.user
        res.render("profile-settings", { data: currentUser })

    } catch (error) {
        res.send(error)
    }
})

router.post("/profile-settings", auth, upload, async (req, res) => {
    try {
        const currentUser = req.user;
        // middleware //
        const add = await currentUser.addInfo(req.body, req.file)

        const result = await User.findByIdAndUpdate({ _id: currentUser._id }, req.body, { new: true })
        res.redirect("/patient-dashboard")

    } catch (error) {
        res.send(error)
    }
})


// Index page //
router.get("/Urology-speciality", async (req, res) => {
    try {

        const result2 = await Docter.find({ specialization: "Urology" });
        if (result2.length == 0) {
            res.send("<h1> OOps Urology Doctor is not found </h1>")
        }
        else {
            res.render("search", { data: result2 })
        }

    } catch (error) {
        res.send(error)
    }
})

router.get("/Neurology-speciality", async (req, res) => {
    try {

        const result2 = await Docter.find({ specialization: "Neurology" });
        if (result2.length == 0) {
            res.send("<h1> OOps Neurology Doctor is not found </h1>")
        }
        else {
            res.render("search", { data: result2 })
        }

    } catch (error) {
        res.send(error)
    }
})

router.get("/Orthopedic-speciality", async (req, res) => {
    try {

        const result2 = await Docter.find({ specialization: "Orthopedic" });
        if (result2.length == 0) {
            res.send("<h1> OOps Orthopedic Doctor is not found </h1>")
        }
        else {
            res.render("search", { data: result2 })
        }

    } catch (error) {
        res.send(error)
    }
})

router.get("/Cardiologist-speciality", async (req, res) => {
    try {

        const result2 = await Docter.find({ specialization: "Cardiologist" });
        if (result2.length == 0) {
            res.send("<h1> OOps Cardiologist Doctor is not found </h1>")
        }
        else {
            res.render("search", { data: result2 })
        }

    } catch (error) {
        res.send(error)
    }
})

router.get("/Dentist-speciality", async (req, res) => {
    try {

        const result2 = await Docter.find({ specialization: "Dentist" });
        if (result2.length == 0) {
            res.send("<h1> OOps Dentist Doctor is not found </h1>")
        }
        else {
            res.render("search", { data: result2 })
        }

    } catch (error) {
        res.send(error)
    }
})



// term and condition page//
router.get("/term-condition", async (req, res) => {
    try {
        res.render("term-condition")

    } catch (error) {
        res.send(error)
    }
})

// privacy and policy page//
router.get("/privacy-policy", async (req, res) => {
    try {
        res.render("privacy-policy")

    } catch (error) {
        res.send(error)
    }
})


module.exports = router