const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', auth, ctrl.logout);
router.get('/check-login', ctrl.checkLogin);

module.exports = router;
