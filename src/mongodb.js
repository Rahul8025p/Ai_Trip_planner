const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

// ✅ Recommended: Remove deprecated options
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas Connected");
  })
  .catch((err) => {
    console.error("❌ Failed to Connect", err);
  });

// Review schema
const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true
  },
  photoPath: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Trip schema
const TripSchema = new mongoose.Schema({
  destination: String,
  days: Number,
  budget: String,
  traveller: String,
  imageUrl: String,
  hotels: Array,
  itinerary: Array,
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviews: [ReviewSchema]
});

// User schema
const LoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  enrollmentnumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  trips: [TripSchema]
});

const User = mongoose.model("User", LoginSchema);
module.exports = User;
