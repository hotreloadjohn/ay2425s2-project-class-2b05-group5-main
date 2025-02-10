
const express = require('express');
const {getProfileData} = require('../models/profile.model');
const {updatePassword} = require('../models/profile.model');
const {updateUsername} = require('../models/profile.model');
const {updateEmail} = require('../models/profile.model');
const {verifyPassword} = require('../models/profile.model');
const router = express.Router();

router.get('/:userId', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId parameter" });
        }
        const data = await getProfileData(userId);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

router.post('/verify-password', async (req, res, next) => {
    try {
        const { userId, password } = req.body;
        const result = await verifyPassword(userId, password);
        res.status(200).json({ success: true, message: "Password verified" });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
});

router.put('/:field/update', async (req, res, next) => {
    try {
        const { value } = req.body;
        const userId = parseInt(req.body.userId, 10);
        const field = req.params.field;

        let result;
        if (field === "password") {
            const { oldPassword } = req.body;
            result = await updatePassword(userId, value);
        } else if (field === "username") {
            result = await updateUsername(userId, value);
        } else if (field === "email") {
            result = await updateEmail(userId, value);
        } else {
            return res.status(400).json({ error: "Invalid field for update" });
        }

        res.status(200).json({ message: `${field} updated successfully`, result });
    } catch (error) {
        next(error);
    }
});

module.exports = router;



