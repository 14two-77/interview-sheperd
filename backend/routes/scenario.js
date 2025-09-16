const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/scenarioController');

router.get('/me', auth, ctrl.getMe);
router.get('/other', auth, ctrl.getOther);
router.get('/:id', auth, ctrl.getOne);
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
