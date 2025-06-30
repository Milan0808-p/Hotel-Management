const express = require("express");
const router = express.Router({mergeParams:true});
const qwrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");

//review route
router.post(
  "/",isLoggedIn,
  qwrapAsync(reviewController.creatReview)
);

// Delete review route
router.delete(
  "/:reviewId",isLoggedIn,isReviewAuthor,
  qwrapAsync(reviewController.deleteReview)
);

module.exports = router;
