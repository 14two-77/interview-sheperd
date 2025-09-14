const Users = require('../models/User');

async function auth(req, res, next) {
    try {
        const userId = req.headers.cookie?.split('user_id=')[1];
        if (!userId) return res.status(401).json({ error: 'Unauthorized: no cookie' });

        const user = await Users.findById(userId);
        if (!user) return res.status(401).json({ error: 'Unauthorized: user not found' });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

module.exports = auth;
