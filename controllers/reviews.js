const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.creatReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Listing review created Successfully!");
  console.log("new review save");

  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // Find the listing and remove the review
  await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });

  // Delete the review from the database
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Listing review deleted Successfully!");
  res.redirect(`/listings/${id}`);
};
