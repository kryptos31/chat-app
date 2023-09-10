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
		default: [
			{_id: 1, name: 'WELCOME'},
			{_id: '0f0bfc1ce83b318b4096cd64202ee1fc5f3716acbc4e31b8', name: 'FRONT-END DEVELOPERS'},
			{_id: '77eadea6ee80208eedb7d42c752353ea68c18e5632db1bd6', name: 'BACK-END DEVELOPERS'},
			{_id: 'd35a6002edb541c586b00f7d77339e3cdd22516f2a137568', name: 'FULL-STACK DEVELOPERS'},
			{_id: '35b6a7f6dcd3afea247dd4da78710e5dbbca08d092ab461f', name: 'CHANNEL 1'},
			{_id: 'ad0d07478c5a6b9da1f23044182ef4f0717edbb335c48111', name: 'CHANNEL 2'},
			{_id: '4a0aa1fdedd91a8eb44f4b3bf670171aa47a551f4c83e166', name: 'CHANNEL 3'}
		]
	}
})
module.exports = mongoose.model("User", userSchema);