const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const { check } = require('express-validator');

// @route    GET api/auth/me
// @desc     Get logged user
// @access   Private
router.get('/me', auth, authController.getLoggedUser);

// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.post(
  '/register',
  [
    check('username', 'إسم المستخدم مطلوب').not().isEmpty(),
    check('email', 'الرجاء إرسال إيميل صحيح').isEmail(),
    check('password', 'الرجاء إدخال كلمة سر بطول ٦ احرف على الأقل').isLength({
      min: 6,
    }),
  ],
  authController.registerUser
);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/login',
  [
    check('email', 'الرجاء إرسال إيميل صحيح').isEmail(),
    check('password', 'كلمة المرور مطلوبة').exists(),
  ],
  authController.loginUser
);

module.exports = router;
