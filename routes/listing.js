const express = require("express");
const router = express.Router();
const qwrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const passport = require("passport");
const {
  isLoggedIn,
  isReviewAuthor,
  isOwnwer,
  isAdmin,
} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(qwrapAsync(listingController.index))
  .post(
    isLoggedIn,
    isAdmin,
    upload.single("listing[image]"),
    qwrapAsync(listingController.creatListing)
  );

//book your hotel form
router.get("/:id/book", isLoggedIn, qwrapAsync(listingController.buyHotel));

//book bill
router.post("/:id/book", isLoggedIn, qwrapAsync(listingController.hotelBill));

//bookings render for admin
router.get(
  "/admin/bookings",
  isLoggedIn,
  isAdmin,
  qwrapAsync(listingController.bookingsRender)
);

//input new data route
router.get("/new", isLoggedIn, isAdmin, listingController.renderNewForm);

//your listing route
router.get(
  "/your-listings",
  isLoggedIn,
  qwrapAsync(listingController.yourListing)
);

router.post(
  "/:listingId/bookings/:bookingId/cancel",
  isLoggedIn,
  qwrapAsync(listingController.cancelBooking)
);

// User's own bookings
router.get(
  "/my-bookings",
  isLoggedIn,
  qwrapAsync(listingController.userBookingsRender)
);

router.post(
  "/:listingId/bookings/:bookingId/cancel",
  isLoggedIn,
  qwrapAsync(listingController.cancelBooking)
);

router.get(
  "/:listingId/bookings/:bookingId/bill",
  isLoggedIn,
  qwrapAsync(listingController.renderBookingBill)
);

router
  .route("/:id")
  .get(qwrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isAdmin,
    upload.single("listing[image]"),
    qwrapAsync(listingController.editeListing)
  )
  .delete(isLoggedIn, isAdmin, qwrapAsync(listingController.deleteListing));

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isAdmin,
  qwrapAsync(listingController.renderEditeForm)
);

module.exports = router;
