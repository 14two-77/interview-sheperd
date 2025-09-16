const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/interviewController');

router.post('/start', auth, ctrl.startInterview);
router.get('/stream/:interview', auth, ctrl.streamInterview);
router.get('/:interview/stream', auth, ctrl.streamInterview);
router.post('/message', auth, ctrl.sendMessage);
router.get('/:id', auth, ctrl.getInterview);
router.post('/:id/finish', auth, ctrl.finishInterview);
router.get('/', auth, ctrl.getInterviewAll);
router.get('/:id/message', auth, ctrl.getInterviewMessage);

module.exports = router;
