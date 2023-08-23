const User = require('../models/User');
const bcrypt = require("bcrypt");
const auth = require("../auth");

module.exports.registerUser = async (reqBody) => {

	let newUser = new User({
		firstName: reqBody.firstName,
		lastName: reqBody.lastName,
		email : reqBody.email,
		mobileNo: reqBody.mobileNo,
		password : bcrypt.hashSync(reqBody.password, 10)
	})

	return newUser.save().then((user, error) => {
		if(error){
			return false;
		} else {
			return true;
		}
	})
}

module.exports.loginUser = (reqBody) => {
	return User.findOne({email : reqBody.email}).then(result => {
		
		if(result == null ){
			return false;
		} else {
			const isPasswordCorrect = bcrypt.compareSync(reqBody.password, result.password)

			if(isPasswordCorrect){
				return { access: auth.createAccessToken(result)}
			} else {
				return false;
			}

		}
	})
}
