const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors")
require('dotenv').config();


// import routes here. Ex: const userRoutes = require("./routes/userRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

mongoose.connect(`${process.env.DB_CONNECTION_STRING}/Chat_Application?retryWrites=true&w=majority`,
		{
			useNewUrlParser : true,
			useUnifiedTopology : true
		});

let db = mongoose.connection;

db.on('error', console.error.bind(console, "MongoDB connection Error"))
db.once('open', () => console.log('Now connected to MongoDB Atlas!'))

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Use routes here. Ex: app.use("/users", userRoutes)
app.use("/users", userRoutes)

app.listen(process.env.PORT || 4000, () => {
	console.log(`API is now online on port ${process.env.PORT || 4000}`)
})