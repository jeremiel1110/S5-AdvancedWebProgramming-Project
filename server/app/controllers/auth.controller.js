const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.users;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api',
};

exports.login = async (req, res) => {
  const body = req.body || {};
  const email = body.email;
  const password = body.password;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).send({
      message: "Email and password are required.",
    });
  }

  if (bcrypt.truncates(password)) {
    return res.status(400).send({ message: 'Password must not exceed 72 bytes.' });
  }

  try {
    const user = await User.findOne({ where: { email: email.trim() } });

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).send({ message: 'Wrong email or password.' });
    }

    const publicUser = {
      id: user.user_id,
      email: user.email,
      firstName: user.user_firstname,
      lastName: user.user_lastname,
      role: user.role,
    };

    const token = jwt.sign(publicUser, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });

    res.cookie('token', token, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
    res.set('Cache-Control', 'no-store');
    return res.send({ user: publicUser });
  } catch (err) {
    return res.status(500).send({ message: 'Unable to log in. Please try again later.' });
  }
};

exports.me = (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.send({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
    },
  });
};

exports.logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.send({ message: 'Logged out.' });
};
