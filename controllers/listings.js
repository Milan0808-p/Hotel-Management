const Listing = require("../models/listing.js");
const axios = require("axios"); 

module.exports.index = async (req, res) => {
  let { search, category } = req.query;
  let allListings;

  if (search) {
    allListings = await Listing.find({
      location: { $regex: search, $options: "i" },
    });
  } else if (category) {
    allListings = await Listing.find({
      categories: category,
    });
  } else {
    allListings = await Listing.find({});
  }
  res.render("listing/index", { allListings, search });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
};

module.exports.creatListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Some Error is occurred");
  }
  const { listing } = req.body;
  const newListing = new Listing(listing);
  let url = req.file
    ? req.file.path
    : "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=600";
  let filename = req.file ? req.file.filename : "default_image";

  // Use Mapbox Geocoding API to get coordinates
  try {
    const mapboxToken = process.env.MAPBOX_TOKEN;
    const geoResponse = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        listing.location
      )}.json?access_token=${mapboxToken}`
    );
    if (geoResponse.data.features.length > 0) {
      newListing.coordinates = geoResponse.data.features[0].center;
    }
  } catch (err) {
    console.error("Error fetching coordinates:", err);
  }


  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.categories = Array.isArray(req.body.categories)
    ? req.body.categories
    : [req.body.categories]; // Ensure categories is an array
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  // Fetch the current listing
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // Fetch all listings for markers
  const allListings = await Listing.find({});

  // Use Mapbox Geocoding API to get coordinates for the current listing
  let coordinates = [30, 15]; // Default coordinates
  try {
    const mapboxToken = process.env.MAPBOX_TOKEN;
    const geoResponse = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        listing.location
      )}.json?access_token=${mapboxToken}`
    );
    if (geoResponse.data.features.length > 0) {
      coordinates = geoResponse.data.features[0].center; // Get the first result's coordinates
    }
  } catch (err) {
    console.error("Error fetching coordinates:", err);
  }

  res.render("listing/show.ejs", { listing, coordinates, allListings });
};

module.exports.renderEditeForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listing/edit.ejs", { listing });
};

module.exports.editeListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Some Error is occurred");
  }
  let { id } = req.params;
  const { listing } = req.body;

  let newData = await Listing.findByIdAndUpdate(id, listing, { new: true });

  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    newData.image = { url, filename };
    newData.save();
  }


  // Update the categories field
  newData.categories = Array.isArray(req.body.categories)
    ? req.body.categories
    : [req.body.categories];
  await newData.save();

  req.flash("success", "updated Successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Deleted Successfully!");
  console.log(deleteListing);
  res.redirect("/listings");
};

module.exports.yourListing = async (req, res) => {
  try {
    const userId = req.user._id; // Get the current logged-in user's ID
    const userOwnedListings = await Listing.find({ owner: userId }); // Find listings owned by the user
    res.render("listing/yourListings", { allListings: userOwnedListings }); // Pass the listings to the view
  } catch (err) {
    console.error("Error fetching user listings:", err);
    req.flash(
      "error",
      "Unable to fetch your listings. Please try again later."
    );
    res.redirect("/listings");
  }
};

module.exports.buyHotel = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    // Collect all booked date ranges
    const bookedRanges = listing.bookings.map(b => ({
      checkIn: b.checkIn,
      checkOut: b.checkOut
    }));
    res.render("listing/book", { listing, bookedRanges });
  } catch (err) {
    console.error("Error fetching listing for booking:", err);
    req.flash("error", "Unable to process your request.");
    res.redirect("/listings");
  }
};

module.exports.hotelBill = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    const { name, email, phone, checkIn, checkOut, guests } = req.body;
    const days = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    const totalCost = days * listing.price * guests;

    // Check for overlapping bookings
    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    const isOverlap = listing.bookings.some(booking => {
      // Existing booking dates
      const existingCheckIn = new Date(booking.checkIn);
      const existingCheckOut = new Date(booking.checkOut);
      // Overlap if: newCheckIn < existingCheckOut && newCheckOut > existingCheckIn
      return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
    });

    if (isOverlap) {
      req.flash("error", "Selected dates are already booked for this hotel. Please choose different dates.");
      return res.redirect(`/listings/${listing._id}/book`);
    }

    const booking = {
      name,
      email,
      phone,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      guests,
      totalCost,
      user: req.user._id
    };

    listing.bookings.push(booking);
    await listing.save();

    res.render("listing/bill", {
      listing,
      name,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      days,
      totalCost,
    });
  } catch (err) {
    console.error("Error processing booking:", err);
    req.flash("error", "Unable to process your booking.");
    res.redirect("/listings");
  }
};

module.exports.bookingsRender = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).populate(
      "owner"
    );
    const bookings = listings.reduce((acc, listing) => {
      listing.bookings.forEach((booking) => {
        acc.push({ listing, booking });
      });
      return acc;
    }, []);

    res.render("listing/adminBookings", { bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    req.flash("error", "Unable to fetch bookings.");
    res.redirect("/listings");
  }
};

// Show all bookings for all users (not recommended for privacy)
module.exports.userBookingsRender = async (req, res) => {
  const today = new Date();
  // Automatically delete bookings where checkOut date is in the past
  await Listing.updateMany(
    {},
    { $pull: { bookings: { checkOut: { $lt: today } } } }
  );

  const listings = await Listing.find({});
  let bookings = [];
  listings.forEach(listing => {
    if (listing.bookings && listing.bookings.length > 0) {
      listing.bookings.forEach(booking => {
        bookings.push({ listing, booking });
      });
    }
  });
  res.render("listing/userBookings", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
  const { listingId, bookingId } = req.params;
  await Listing.findByIdAndUpdate(listingId, { $pull: { bookings: { _id: bookingId } } });
  req.flash("success", "Booking cancelled successfully.");
  res.redirect("back");
};

module.exports.cancelBooking = async (req, res) => {
  const { listingId, bookingId } = req.params;
  await Listing.updateOne(
    { _id: listingId, "bookings._id": bookingId },
    { $set: { "bookings.$.cancelled": true } }
  );
  req.flash("success", "Booking cancelled successfully.");
  res.redirect("/listings/my-bookings");
};

module.exports.renderBookingBill = async (req, res) => {
  const { listingId, bookingId } = req.params;
  const listing = await Listing.findById(listingId);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings/my-bookings");
  }
  const booking = listing.bookings.id(bookingId);
  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/listings/my-bookings");
  }
  // Render bill.ejs with booking details
  res.render("listing/bill", {
    listing,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    days: Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24)),
    totalCost: booking.totalCost,
  });
};