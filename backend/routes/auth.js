const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
transporter.verify((err, success) => {
  if (err) {
    console.error('Email error:', err);
  } else {
    console.log('Email server ready');
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hash],
    err => {
      if (err) return res.status(400).json({ message: 'Email exists' });
      res.json({ message: 'Registered successfully' });
    }
  );
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email=?', [email], (err, user) => {
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid credentials' });

    const otp = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000;

    db.run('INSERT INTO otp_codes (user_id, otp, expires_at) VALUES (?, ?, ?)',
      [user.id, otp, expires]);

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your One-Time Password (OTP) for SafeWave',
      text: `Dear Customer,

Your OTP Code is: ${otp}

This code is valid for 2 minutes and can be used only once.
If you did not attempt to log in, please ignore this email.

Best regards,
Malak Mahmoud
Keroloues Mourad
Ezz Hamed
Security Team`
    });

    res.json({ message: 'OTP sent to email', userId: user.id });
  });
});

router.post('/verify-otp', (req, res) => {
  const { userId, otp } = req.body;

  db.get('SELECT * FROM otp_codes WHERE user_id=? ORDER BY id DESC',
    [userId],
    (err, record) => {
      if (!record) return res.status(400).json({ message: 'OTP not found' });
      if (Date.now() > record.expires_at)
        return res.status(400).json({ message: 'OTP expired' });
      if (record.otp !== otp)
        return res.status(400).json({ message: 'Invalid OTP' });

      res.json({ message: 'Access granted' });
    }
  );
});

module.exports = router;
