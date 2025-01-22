const router = require('express').Router();
const { userController } = require('../../controllers');
const { authMiddleware } = require('../../middlewares');

router.post('/register', userController.signup);

router.post('/login', userController.login);

router.post('/forgot_password', userController.forgetPassword);

router.put(
  '/update_password',
  authMiddleware.verifyUser,
  userController.changePassword
);

router.put('/update', authMiddleware.verifyUser, userController.updateProfile);

router.post('/validate_pass_reset_link', userController.validateLink);

router.post('/reset_password', userController.resetPassword);

router.post('/send_otp', authMiddleware.verifyUser, userController.sendOTP);

router.post('/verify_otp', authMiddleware.verifyUser, userController.verifyOTP);

module.exports = router;
