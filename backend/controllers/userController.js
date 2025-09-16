const Users = require('../models/User');
const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

exports.get = async (req, res) => {
    const userId = req.headers.cookie?.split('user_id=')[1];
    const user = await Users.findById(userId).select('username -_id');
    res.status(200).json({ user });
};

exports.update = async (req, res) => {
    try {
        const userId = req.headers.cookie?.split('user_id=')[1];
        const { username, password } = req.body;

        const updateData = { username };
        if (password) updateData.password = hashPassword(password);

        await Users.findByIdAndUpdate(userId, updateData, { new: true });

        res.status(200).json({ message: "OK" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
};