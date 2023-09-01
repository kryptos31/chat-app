const cloudinary = require("cloudinary").v2

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true
})

module.exports.getSignature = () => {

	const timestamp = Math.round(new Date().getTime() / 1000)
	const signature = cloudinary.utils.api_sign_request(
	  {
	    timestamp: timestamp
	  },
	  cloudinaryConfig.api_secret
	)
	return ({ timestamp, signature })
}

module.exports.deleteImg = () => {
	// actually delete the photo from cloudinary
	cloudinary.uploader.destroy(req.body.id)
}