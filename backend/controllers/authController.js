const Users = require('../models/User');
const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = hashPassword(password);
        const user = await Users.create({ username, password: hashedPassword });
        res.status(200).json({ message: 'OK' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = hashPassword(password);
        const user = await Users.findOne({ username, password: hashedPassword });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
        const isDev = process.env.NODE_ENV !== 'production';
        res.setHeader('Set-Cookie',`user_id=${user._id}; Path=/; HttpOnly; SameSite=${isDev ? 'Lax' : 'None'}${isDev ? '' : '; Secure'}`);
        
        res.status(200).json({ message: 'OK' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error.' });
    }
};
