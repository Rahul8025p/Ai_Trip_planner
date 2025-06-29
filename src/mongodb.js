const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/LoginSignUp")
  .then(() => {
    console.log("Mongodb Connected");
  })
  .catch((err) => {
    console.log("Failed to Connect", err);
  });
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
      required: function() { return !!this.photoPath; }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
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
  profilePhoto: 
  { 
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
