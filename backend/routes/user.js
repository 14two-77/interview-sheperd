const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.get('/', auth, ctrl.get);
router.put('/', auth, ctrl.update);

module.exports = router;
