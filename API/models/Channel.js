const mongoose = require("mongoose");
const channelSchema = new mongoose.Schema({
	_id:{
		type: String
	},
	name : {
		type: String,
		required: true
	},
	description : {
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
			},
			_id: {
				type: String
			}
		}
	]
})

module.exports = mongoose.model("Channel", channelSchema);