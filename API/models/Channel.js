const mongoose = require("mongoose");
const channelSchema = new mongoose.Schema({
	name : {
		type: String,
		required: true
	},
	members : [
		{
			email: {
				type: String,
				required: true
			}
		}
	],
	messages: [
		{
			message: {
				type: String				
			},
			from: {
				type: String
			}
		}
	]
})

module.exports = mongoose.model("Channel", channelSchema);