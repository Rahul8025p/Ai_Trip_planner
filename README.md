![Screenshot 2025-06-29 193311](https://github.com/user-attachments/assets/4524a7b0-52ba-4d7c-b767-b38fc63f8993)👨‍💻 Project description

📸 Screenshots

📂 File structure

🌐 Live link

🛠 Setup instructions

🧾 Features list

🪪 Author info


# 🌍 Campus Routes - AI Travel Planner

**Campus Routes** is a full-stack AI-powered travel planning platform where users can generate smart, visually appealing itineraries by simply entering basic travel preferences. It offers hotel recommendations, sightseeing spots, timelines, and even review management – all packed in a clean UI built with Handlebars.

🟢 **Live Project Link**: [Click to Visit](https://ai-trip-planner-team-7-tfzq.onrender.com)

---

## 📸 Screenshots

### 🧭 Destination & Travel Details Input
> Users input destination, days, budget, and type of travelers.

![Screenshot 2025-06-29 193311](https://github.com/user-attachments/assets/99911e74-5973-4dbc-959b-f0f33bf5f6b5)


---

### 🧳 Dynamic Trip Plan Output
> Shows city image, duration, budget, and number of travelers.

![Screenshot 2025-06-29 193348](https://github.com/user-attachments/assets/2547e0e1-e05c-4874-a354-1c1b95defee9)


---

### 🏨 Hotel Recommendations
> Hotels include name, price, ratings, address, and Google Maps links.

![Screenshot 2025-06-29 193405](https://github.com/user-attachments/assets/c770df0a-0f68-4072-94b2-9ea1f07ce60d)


---

### 📅 Day-Wise Itinerary
> Auto-generated day plan with activity slots and ratings.

![Screenshot 2025-06-29 193444](https://github.com/user-attachments/assets/feaf73d6-0031-4206-957c-bf70368982b1)


---

### 📂 My Trips Page
> Displays all previously generated trips in a card-based UI.

![Screenshot 2025-06-29 193422](https://github.com/user-attachments/assets/aa42fd9e-bef3-4db2-bbce-4518509fd54b)


---

### ⭐ Add a Review Modal
> Users can rate the trip and leave a review.

![Screenshot 2025-06-29 193506](https://github.com/user-attachments/assets/4b088550-3bfb-4f7b-8a60-c42e59761b15)


---

### 👤 Account Settings Page
> Users can manage profile info, trips, password, and bio.

![Screenshot 2025-06-29 193522](https://github.com/user-attachments/assets/bb4005f9-8da2-46df-ad80-dceaac70cc51)


---

## 📁 File Structure

ai-travel-planner/
├── backend/
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Express route handlers
│ ├── public/ # Static assets
│ ├── views/ # Handlebars templates
│ ├── .env # Environment config
│ ├── app.js # Main server file
│ └── mongodb.js # MongoDB connection
├── README.md


---

## ✨ Features

- 🌍 Smart AI-based itinerary generation (Gemini API)
- 🏨 Hotel and activity recommendations based on user preferences
- 📷 Destination-based images using Unsplash API
- 🧾 Save & manage past trips
- 💬 Trip review & rating system
- 👤 User authentication & profile management
- 🌐 Fully responsive frontend

---

## 🧑‍💻 Tech Stack

- **Frontend Templating:** Handlebars (HBS)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **APIs:** Gemini (AI), Unsplash (images)
- **Auth:** Session-based login
- **Styling:** CSS, Bootstrap

---

## 🔧 Local Setup

```bash
git clone https://github.com/yourusername/ai-travel-planner.git
cd ai-travel-planner/backend
npm install

MONGO_URI=your_mongodb_connection_string
UNSPLASH_ACCESS_KEY=your_unsplash_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000

Then Run:
node app.js
Visit: http://localhost:5000


---

✅ You can now push this `README.md` to your GitHub repo and place all screenshots in the repo root (or `assets/` folder) for visibility.

📱 Phone: +91 9876543215
🏫 College: IIIT Allahabad
💼 Designation: UI Developer
