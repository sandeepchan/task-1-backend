const Pool = require('pg').Pool;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'sandeep',
  database: 'people',
  port: 5432
});
router.post(
  '/signup',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      await pool.query(
        'select email from users where email = $1',
        [email],
        function(err, result) {
          if (result.rows[0]) {
            return res
              .status(400)
              .json({ errors: [{ message: 'User already exist' }] });
          }
        }
      );

      const salt = await bcrypt.genSalt(10);

      hash = await bcrypt.hash(password, salt);
      await pool.query(
        'Insert into users (name, email, password) values($1, $2, $3)',
        [name, email, hash],
        function(err, result) {
          if (err) {
          } else {
            res.status(200).json({ message: 'User  created' });
          }
        }
      );
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
);
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      let loadedUser;
      let result = await pool.query('select * from users where email = $1', [
        email
      ]);
      loadedUser = result;
      if (!result.rows[0]) {
        return res.status(400).json({ messsge: 'Invalid Credentials' });
      }
      const isMatch = await bcrypt.compare(password, result.rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      const token = jwt.sign(
        {
          userId: result.rows[0].id
        },
        'somesecrete',
        { expiresIn: 360000 }
      );

      res.status(200).json({
        message: 'login successfully',
        token: token,
        userId: result.rows[0].id
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);
module.exports = router;
