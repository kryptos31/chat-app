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

module.exports.checkEmail = async(reqBody) => {
	return User.find({email : reqBody.email}).then(result => {
		if (result.length > 0){
			return true;
		} else {
			return false;
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

module.exports.getProfile = (reqBody) => {
	return User.findById(reqBody.userId).then(result => {

		if(result == null ){
			return false;
		} else {
			result.password = "";
			return result;
		}
	})
}


module.exports.updateUserInfo = async (userId, updatedInfo) => {
    try {
        const user = await User.findById(userId);

        if (user) {
            
            user.firstName = updatedInfo.firstName || user.firstName;
            user.lastName = updatedInfo.lastName || user.lastName;
            user.email = updatedInfo.email || user.email;
            user.mobileNo = updatedInfo.mobileNo || user.mobileNo;

            await user.save();
            return true; 
        } else {
            return false; 
        }
    } catch (error) {
        console.error("Error updating user information:", error);
        return false;
    }
};

module.exports.removeUser = async (userId) => {
    try {
        const user = await User.findByIdAndDelete(userId);
        
        if (user) {
            return true; 
        } else {
            return false; 
        }
    } catch (error) {
        console.error("Error removing user:", error);
        return false; 
    }
};
