const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const bookingSchema=new Schema({
  name:String,
  email:String,
  phone:String,
  checkIn:Date,
  checkOut:Date,
  guests:Number,
  totalCost:Number,
  user: { type: Schema.Types.ObjectId, ref: "User" },
  cancelled: { type: Boolean, default: false }
});

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: {
      type: String,
      default: "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    filename: {
      type: String,
      default: "default_image",
    },
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  bookings:[bookingSchema],
  categories: [String],
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0], // Default coordinates
  },
});

// Middleware to delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;