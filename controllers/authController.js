const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/UserModel');
const ms = require('ms');
const ErrorResponse = require('../utils/errorResponse');

// @route    GET api/auth/me
// @desc     Get logged user
// @access   Private
exports.getLoggedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.log(error.message);
    return next(new ErrorResponse('مشكلة في السيرفر', 500));
  }
};
// @route    POST api/auth/register
// @desc     Register user
// @access   Public
exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(400, errors.array()));
    }

    let { username, email, password } = req.body;
    email = email.toLowerCase();

    // Check if the email exists
    const userCheck = await UserModel.findOne({ email: email });

    if (userCheck) {
      return next(new ErrorResponse(`هذا المستخدم موجود من قبل`, 400));
    }

    // Create user in the db
    const user = await UserModel.create({
      username,
      email,
      password,
    });

    sendTokenResponse(user, 200, res, 'تم التسجيل بنجاح');
  } catch (error) {
    console.log(error.message);
    return next(new ErrorResponse('مشكلة في السيرفر', 500));
  }
};

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
exports.loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(400, errors.array()));
    }

    let { email, password } = req.body;

    email = email.toLowerCase();

    // Bring the user from the DB
    const user = await UserModel.findOne({ email }).select('+password');

    // Check if the user exist
    if (!user) {
      return next(new ErrorResponse(`خطأ في الايميل او كلمة المرور`, 400));
    }

    // Check the password if match or not
    const isMatch = await user.checkPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse(`خطأ في الايميل او كلمة المرور`, 400));
    }

    await convertCookieToLogin(req, res, user._id);

    sendTokenResponse(user, 200, res, 'مرحبا بعودتك');
  } catch (error) {
    console.log(error.message);
    return next(new ErrorResponse('مشكلة في السيرفر', 500));
  }
};

const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = user.getSignedJwtToken(ms('30d'));

  const options = {
    expires: new Date(Date.now() + duration),
    httpOnly: false,
  };

  if (process.env.NODE_ENV == 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    message,
  });
};
