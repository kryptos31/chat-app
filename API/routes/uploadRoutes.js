const express = require('express');
const router = express.Router();
const cloudinary = require("cloudinary").v2

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true
})


const uploadController = require("../controllers/uploadController");


router.get("/get-signature", (req, res) => {
  	const timestamp = Math.round(new Date().getTime() / 1000)
  	  const signature = cloudinary.utils.api_sign_request(
  	    {
  	      timestamp: timestamp
  	    },
  	    process.env.CLOUDINARY_SECRET
  	  )
  	  
  	  res.json({ timestamp, signature })

})

router.post("/delete-photo", async (req, res) => {
	uploadController.deleteImg().then(resultFromController => res.send(resultFromController))
 })

module.exports = router;