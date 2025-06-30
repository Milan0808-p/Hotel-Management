const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn=(req,res,next)=>{
  if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","Please logged in first");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}

module.exports.isReviewAuthor=async(req,res,next)=>{
  let {id,reviewId}=req.params;
  let review=await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not authorized to delete this review.");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "Admin") {
    return next();
  }
  req.flash("error", "You do not have permission to perform this action.");
  res.redirect("/listings");
};
// module.exports.isOwner=async(req,res,next)=>{
//   let {id}=req.params;
//   let listing=await Listing.findById(id);
//   if (!listing.owner.equals(req.user._id)) {
//     req.flash("error", "You don't have  permision");
//     return res.redirect(`/listings/${id}`);
//   }
//   next();
// }