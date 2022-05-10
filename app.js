require('dotenv').config()
const express = require("express");
const app = express()
const path = require("path");
const hbs = require("hbs");
const multer = require("multer")

// file import(require) //
require("./db/conn")  // require( database conn)
const router = require("./router/routing") // require router
const adminRouter = require("./router/admin-routing")
const docterRouter = require("./router/docter-routing")
const User = require("./db/user"); 

// console.log(process.env.SECRET_KEY)

app.use(router);
app.use(adminRouter);
app.use(docterRouter) 

const port = process.env.PORT || 8000;

app.use("/public", express.static(path.join(__dirname, "public")))
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/views"));
hbs.registerPartials(path.join(__dirname, "/views/partial"))

app.use(express.json())
app.use(express.urlencoded({extended:false}));   


app.get("/", (req,res)=>{
    res.render("index")
})


app.get("*", (req,res)=>{
    res.status(404).send(" <h1> 404 Not Found </h1>")
})


app.listen(port, ()=>{
    console.log(`server is running on port ${port}`) 
})