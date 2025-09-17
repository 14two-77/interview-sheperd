const Users = require('../models/User');
const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

exports.get = async (req, res) => {
    try {
        const userId = req.headers.cookie?.split('user_id=')[1];
        const user = await Users.findById(userId).select('username -_id');
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

exports.update = async (req, res) => {
    try {
        const userId = req.headers.cookie?.split('user_id=')[1];
        const { username, password } = req.body;

        if (!username || username.trim() === "") {
            return res.status(400).json({ error: 'Username is required' });
        }

        const trimmedUsername = username.trim();

        const existingUser = await Users.findOne({ username: trimmedUsername, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const updateData = { username: trimmedUsername };

        if (password && password.trim() !== "") {
            updateData.password = hashPassword(password.trim());
        }

        await Users.findByIdAndUpdate(userId, updateData, { new: true });

        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};
