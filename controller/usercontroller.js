const Pool = require('pg').Pool;
const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'sandeep',
  database: 'people',
  port: 5432
});
router.delete('/delete', [isAuth], async (req, res) => {
  try {
    await pool.query(
      'delete from profile where id = $1',
      [req.userId.id],
      function(err, result) {
        if (err) {
          res.status(400).json({ message: 'something went wrong' });
        }
      }
    );
    await pool.query(
      'delete from users where id = $1',
      [req.userId.id],
      function(err, result) {
        if (err) {
          res.status(400).json({ message: 'something went wrong' });
        } else {
          res.status(200).json({ message: 'user deleted' });
        }
      }
    );
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
module.exports = router;
