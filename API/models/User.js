const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
	profileImg : {
		type: String,
		default: "a placeholder img will be used here if no img uploaded"
	},
	firstName : {
		type: String,
		required :[true, "Firstname is required."]
	},
	lastName : {
		type: String,
		required :[true, "Lastname is required."]
	},
	email : {
		type: String,
		required :[true, "Email is required."]
	},
	mobileNo : {
		type: Number,
		required :[true, "Mobile is required."]
	},
	password : {
		type : String,
		required: [true, "Password is required"]
	},
	activeStatus : {
		type: Boolean,
		default: true
	},
	channelsJoined : {
		type: Array,
		default: [{name: 'Welcome'}]
	}
})
module.exports = mongoose.model("User", userSchema);