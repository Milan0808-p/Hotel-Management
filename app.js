if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
// const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");
// const qwrapAsync=require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const Review=require("./models/review.js");
const listingsRoute=require("./routes/listing.js");
const reviewsRoute = require("./routes/review.js");
const userRoute= require("./routes/user.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));

main().then(()=>{
  console.log("connected to db");
}).catch((err)=>{
  console.log(err);
});
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const sessionOption={
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now()+ 7 * 24 *60 *60 *1000,
    maxAge:7 * 24 *60 *60 *1000,
    httpOnly:true,
  },
};

app.get("/",(req,res)=>{
  res.redirect("/listings");
});

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;   //it is used for logout button rendering 
  next();
});

//privacy police
// const express = require("express");
// const router = express.Router();

// Route for Privacy Policy
app.get("/privacy", (req, res) => {
  res.render("footer/privacy");
});

app.get("/terms", (req, res) => {
  res.render("footer/terms");
});

// module.exports = router;

//listing route
app.use("/listings",listingsRoute);

//review route
app.use("/listings/:id/reviews",reviewsRoute);

//user route
app.use("/",userRoute);


app.get("/error",(err,req,res)=>{
  let {status=500,message="Sometihng went wrong"}=err;
  res.render("error.ejs",{status,message})
})

// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });

//error handling middelware
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error.ejs", { status, message });
});
app.listen(8080,()=>{
  console.log("server is running on port 8080");
});