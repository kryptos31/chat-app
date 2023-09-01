const express = require('express');
const router = express.Router();

const userController = require("../controllers/userController");
const auth = require("../auth");


router.post("/register", (req, res) => {
	userController.registerUser(req.body).then(resultFromController => res.send(resultFromController))
})

router.post("/login", (req, res) => {
	userController.loginUser(req.body).then(resultFromController => res.send(resultFromController))
})

router.get("/details", auth.verify, (req, res) => {
    const userData = auth.decode(req.headers.authorization);
    userController.getProfile({userId : userData.id}).then(resultFromController => res.send(resultFromController))
})

router.put("/update/:userId", async (req, res) => {
    const userId = req.params.userId;
    const updatedInfo = req.body;

    userController.updateUserInfo(userId, updatedInfo)
        .then(resultFromController => {
            if (resultFromController) {
                res.send("User information updated successfully.");
            } else {
                res.status(404).send("User not found or update failed.");
            }
        });
});

router.delete("/remove/:userId", auth.verify, async (req, res) => {
    const userId = req.params.userId;

    userController.removeUser(userId)
        .then(resultFromController => {
            if (resultFromController) {
                res.json({ message: "User account removed successfully." });
            } else {
                res.status(404).json({ message: "User not found or removal failed." });
            }
        });
});


module.exports = router;