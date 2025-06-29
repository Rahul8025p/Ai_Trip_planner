const express=require("express")
const app=express()
const path=require("path")
const hbs=require("hbs")
const { engine } = require('express-handlebars');
const User=require("./mongodb")
const templatePath=path.join(__dirname,'../templates')
const axios=require('axios')
const dotenv=require('dotenv')
const fetch = require('node-fetch');
const multer = require('multer');
const session = require('express-session');
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use('/uploads', express.static('uploads'));
app.use(express.json())
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main',
    helpers: {
        encodeURIComponent: function (str) {
            return encodeURIComponent(str);
        },
        json: function(context) {
            return JSON.stringify(context, null, 2);
        },
        incrementIndex: function(index) {
            return parseInt(index) + 1;
        },
        formatDate: (date) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(date).toLocaleDateString(undefined, options);
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
app.set("view engine","hbs")
app.set("views",templatePath)
app.use(express.urlencoded({extended:false}))

app.get("/" ,(req,res)=>{
    res.render("login",{ layout: false })
})
app.get("/signup" ,(req,res)=>{
    res.render("signup",{ layout: false })
})
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const fetchImage = async (query) => {
    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query: query,
                client_id: UNSPLASH_ACCESS_KEY,
                per_page: 1,
                order_by: 'popular'
            },
        });
        return response.data.results[0]?.urls.regular || 'flight.img.jpg';
    } catch (error) {
        console.error('Error fetching image from Unsplash:', error);
        return null;
    }
};
app.post("/signup", async (req, res) => {
    const ADMIN_PASSWORD = "Team 7";
    const isAdminSelected = req.body.adminPassword !== undefined && req.body.adminPassword !== "";
    const isAdmin = isAdminSelected && req.body.adminPassword === ADMIN_PASSWORD;
    if (isAdminSelected && !isAdmin) {
        return res.render("signup", {
            layout: false,
            errorMessage: "Incorrect admin password. Please try again.",
        });
    }
    const data = {
        email: req.body.email.toLowerCase().trim(),
        name: req.body.name,
        enrollmentnumber: req.body.enrollmentnumber,
        password: req.body.password,
        isAdmin: isAdmin
    };
    try {
        await User.create(data);
        res.render("login", { layout: false });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("An error occurred during signup");
    }
});
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const check = await User.findOne({ email: email });

        if (!check) {
            res.send("Email not found");
        } else if (check.password === req.body.password) {
            req.session.userId = check._id;
            const profilePhoto = check.profilePhoto;
            if (check.isAdmin) {
                console.log("Admin login successful");
                return res.render("admin-home", { profilePhoto, layout: false });
            }
            return res.render("home", { profilePhoto, layout: false });
        } else {
            return res.send("Wrong Password");
        }
    } catch (error) {
        console.error("Error during login: ", error);
        res.send("An error occurred while processing your request");
    }
});

const nodemailer = require("nodemailer");
const { model } = require("mongoose")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "rahul.pallabothula2005@gmail.com",
        pass: "xahx xtud izeh ckpc" 
    }
});

app.get("/forgot-password", (req, res) => {
    res.render("forgot-password",{ layout: false });
});

app.post("/forgot-password", async (req, res) => {
    const email = req.body.email.toLowerCase().trim();
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.send("Email not found");
    }

    const resetToken = Math.random().toString(36).substr(2); 
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    console.log(`Reset Link: ${resetLink}`);

    const mailOptions = {
        from: "rahul.pallabothula2005@gmail.com",
        to: "rahul.pallabothula2005@gmail.com",
        subject: "Password Reset Request",
        text: `You requested a password reset. Click the link to reset your password: ${resetLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
            return res.send("Error sending email");
        }
        console.log("Email sent: " + info.response);
        res.send("Password reset link sent to your email.");
    });
});

app.get("/reset-password/:token", (req, res) => {
    res.render("reset-password",{ token: req.params.token , layout: false});
});


app.post("/reset-password/:token", async (req, res) => {
    const { email, newPassword } = req.body;
    await User.updateOne({ email: email }, { $set: { password: newPassword } });
    res.send("Password has been reset successfully. You can now log in.");
});
app.get('/review.hbs', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: Please log in" });
    }
    try {
        // const user = await User.findById(userId).lean();
        // if (!user || !user.isAdmin) {
        //     return res.status(403).send("Forbidden: You are not authorized to view this page");
        // }
        const allUsers = await User.find().lean(); // Fetch all users
        const allReviews = allUsers.flatMap(user => user.trips?.flatMap(trip => trip.reviews || []) || []);
        res.render("reviewpage", { userId, reviews: allReviews, layout: false });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/admin-review.hbs', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: Please log in" });
    }
    try {
        const user = await User.findById(userId).lean();
        if (!user || !user.isAdmin) {
            return res.status(403).send("Forbidden: You are not authorized to view this page");
        }
        const allUsers = await User.find().lean(); // Fetch all users
        const allReviews = allUsers.flatMap(user => user.trips?.flatMap(trip => trip.reviews || []) || []);
        res.render("admin-reviewpage", { userId, reviews: allReviews, layout: false });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/update-user', async (req, res) => {
    const { firstName, enrollmentNumber, email } = req.body;
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: Please log in" });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { 
                name: firstName,
                enrollmentnumber: enrollmentNumber,
                email: email
            },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/user.hbs", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send("Unauthorized: Please log in");
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        } 
        res.render("user",{user,layout: false});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/user-admin.hbs", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send("Unauthorized: Please log in");
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        } 
        res.render("admin-profile",{user,layout: false});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/trip-details.hbs", (req, res) => {
    res.render("trip-details",{ layout: false });
});
app.get('/create-trip', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send("Unauthorized: Please log in");
    }
    res.render('trip-details',{ layout: false });
});
app.post('/create-trip', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send("Unauthorized: Please log in");
    }

    const start = 'Prayagraj';
    const { destination, days, budget, traveller } = req.body;

    console.log('Trip Details:', { start, destination, days, budget, traveller });

    const prompt = `Generate a travel plan from ${start} to ${destination} for ${days} days for ${traveller} with a ${budget} budget. 
Return only JSON structured like:
{
  "destination": "Destination name",
  "days": number,
  "budget": "budget",
  "traveller": "traveller",
  "hotels": [
    {
      "name": "Hotel name 1",
      "address": "Hotel address 1",
      "price": "Hotel price 1",
      "rating": "Hotel rating 1"
    },
    {
      "name": "Hotel name 2",
      "address": "Hotel address 2",
      "price": "Hotel price 2",
      "rating": "Hotel rating 2"
    },
    {
      "name": "Hotel name 3",
      "address": "Hotel address 3",
      "price": "Hotel price 3",
      "rating": "Hotel rating 3"
    },
    {
      "name": "Hotel name 4",
      "address": "Hotel address 4",
      "price": "Hotel price 4",
      "rating": "Hotel rating 4"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "places": [
        {
          "placeName": "Place name",
          "placeDetails": "Description",
          "ticketPricing": "Entry fee",
          "rating": "Rating",
          "timeTravel": "Hours spent",
          "timing": "Start - End"
        }
      ]
    }
  ]
}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generate = async (maxRetries = 3, delay = 30000) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const result = await model.generateContent(prompt);
                const text = result.response.text() ;
                if (!text) throw new Error('Empty response from model');
                return text;
            } catch (err) {
                if (err.status === 429 && attempt < maxRetries - 1) {
                    console.warn(`Rate limit hit. Retrying in ${delay / 1000}s... (Attempt ${attempt + 1})`);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    console.error('Error during content generation:', err);
                    throw new Error('Failed to generate content');
                }
            }
        }
    };

    try {
        const generatedContent = await generate();
        console.log('Generated Content (raw):', generatedContent);

        const jsonMatch = generatedContent.match(/```json([\s\S]*?)```/);
        let cleanedContent = jsonMatch ? jsonMatch[1].trim() : generatedContent.trim();
        cleanedContent = cleanedContent.replace(/```json/g, '').replace(/```/g, '');
        cleanedContent = cleanedContent.replace(/(\r\n|\n|\r)/gm, "");
        cleanedContent = cleanedContent.replace(/(})(?=\s*\{)/g, "},");

        let generatedTrip;
        try {
            generatedTrip = JSON.parse(cleanedContent);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return res.status(500).send('Failed to parse generated content as JSON.');
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found');

        let destinationImage = user.trips.find(trip => trip.destination === destination)?.imageUrl;
        if (!destinationImage) destinationImage = await fetchImage(destination);

        for (const hotel of generatedTrip.hotels) {
            const hotelImage = user.trips.find(trip =>
                trip.destination === destination &&
                trip.hotels.some(h => h.name === hotel.name)
            )?.hotels.find(h => h.name === hotel.name)?.imageUrl;

            hotel.imageUrl = hotelImage || await fetchImage(hotel.name);
        }

        for (const day of generatedTrip.itinerary) {
            for (const place of day.places) {
                const placeImage = user.trips.find(trip =>
                    trip.destination === destination &&
                    trip.itinerary.some(i => i.places.some(p => p.placeName === place.placeName))
                )?.itinerary.find(i =>
                    i.places.some(p => p.placeName === place.placeName)
                )?.places.find(p => p.placeName === place.placeName)?.imageUrl;

                place.imageUrl = placeImage || await fetchImage(place.placeName);
            }
        }

        user.trips.push({
            destination: generatedTrip.destination,
            days: generatedTrip.days,
            budget: generatedTrip.budget,
            traveller: generatedTrip.traveller,
            imageUrl: destinationImage,
            hotels: generatedTrip.hotels,
            itinerary: generatedTrip.itinerary,
            createdAt: new Date()
        });

        await user.save();
        res.render('trip-results', {
            trip: generatedTrip,
            destinationImage: destinationImage,
            layout: false
        });

    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).send('An error occurred while generating content.');
    }
});

app.get('/trip-images.hbs', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render("user-trip-img", { user, layout: false });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

app.get("/my-trips", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user || user.trips.length === 0) {
            return res.render("my-trips", { trips: [], layout: false });
        }
        res.render("my-trips", { trips: user.trips, layout: false });
    } catch (error) {
        console.error("Error fetching user's trips:", error);
        res.status(500).send("An error occurred while fetching trips.");
    }
});
app.get('/mytripresults', async (req, res) => {
    const tripId = req.query.tripId;
    if (!tripId) {
        return res.status(400).send('Trip ID is required');
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const trip = user.trips.find(t => t._id.toString() === tripId);
        if (!trip) {
            return res.status(404).send('Trip not found');
        }
        console.log(trip.destination);
        res.render('mytripresults', { trip, layout: false });
    } catch (error) {
        console.error('Error fetching trip:', error);
        res.status(500).send('An error occurred while fetching the trip.');
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage }); 
app.post('/upload-profile-photo', upload.single('profilePhoto'), async (req, res) => {
    const photoPath = req.file.path.replace(/\\/g, "/");

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        user.profilePhoto = photoPath;
        await user.save();
        // res.send("Profile photo uploaded successfully!");
        res.render("user",{user,layout:false});
    } catch (err) {
        console.error("Error uploading profile photo:", err);
        res.status(500).send("Error uploading profile photo");
    }
});

app.post('/add-review', upload.single('profilePhoto'), async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send("Unauthorized: Please log in");
    }
    const { destination, rating, reviewText } = req.body;
    const photoPath = req.file ? req.file.path : null;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const trip = user.trips.find(trip => trip.destination === destination);
        if (!trip) {
            return res.status(404).send('Trip not found');
        }
        
        trip.reviews.push({
            rating: parseInt(rating, 10),
            reviewText: reviewText,
            photoPath: photoPath
        });
        
        await user.save();
        res.status(200).send('Review added successfully');
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).send('An error occurred while adding the review.');
    }
});

app.get('/uploads.hbs', (req, res) => {
    res.render('uploads',{layout: false });
});

app.delete("/reviews/:id", async (req, res) => {
    try {
      const reviewId = req.params.id;
  
      const allUsers = await User.find();
      let reviewDeleted = false;
  
      for (const user of allUsers) {
        for (const trip of user.trips) {
          const reviewIndex = trip.reviews.findIndex(
            (review) => review._id.toString() === reviewId
          );
  
          if (reviewIndex !== -1) {
            trip.reviews.splice(reviewIndex, 1);
            reviewDeleted = true;
            await user.save();
            break;
          }
        }
  
        if (reviewDeleted) {
          break;
        }
      }
  
      if (!reviewDeleted) {
        return res.status(404).send("Review not found");
      }
  
      res.status(200).send("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).send("Internal Server Error");
    }
  });
    
  app.get("/admin-user.hbs", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send("Unauthorized: Please log in");
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        } 
        res.render("admin-profile",{user,layout: false});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
