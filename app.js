const express = require('express');
const app = express();
const path = require('path');
const authRoutes = require('./routes/authRoute');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyparser = require("body-parser")
// Constants
const port = process.env.PORT || 3800;
const mongoURI = process.env.MONGODB_CONNECTION;
require('dotenv').config();





// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION).then(()=>{console.log("Database Connected")}).catch((err)=>{console.log(err)});



// Middleware
app.use(bodyparser.json())
app.use(express.json()); // For JSON payloads
// Routes
app.use('/api/authRoute', authRoutes);


app.use(express.urlencoded({ extended: true })); // For URL-encoded payloads
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(cors({ origin: '*' })); // Allow all origins, including Postman










// 404 Handling (Optional)
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server up and running http://localhost:${port}`);
});
