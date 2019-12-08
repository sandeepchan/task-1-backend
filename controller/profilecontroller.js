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
router.get('/post/:id', [isAuth], async (req, res) => {
  try {
    await pool.query(
      'select (name, email, degree, percentage, dob) from profile inner join users on users.id = profile.id where users.id = $1',
      [req.params.id],
      function(err, result) {
        if (err) {
          console.log(err);
          res.status(400).json({ message: 'something went wrong' });
        } else {
          res
            .status(200)
            .json({ message: 'your details', results: result.rows[0] });
        }
      }
    );
  } catch (err) {
    res.status(400).json({ message: 'server error' });
  }
});
router.post('/posts', [isAuth], async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  try {
    const user = await pool.query('select * from users where id = $1', [
      req.userId.id
    ]);
    const { degree, percentage, gender, dob } = req.body;

    await pool.query(
      'insert into profile (degree, percentage,id,gender, dob) values ($1, $2, $3, $4, $5)',
      [degree, percentage, req.userId.id, gender, dob],
      function(err, result) {
        if (err) {
          return res.status(409).json({ message: 'already exists' });
        } else {
          return res.status(201).json({ message: 'created successfully' });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});
router.put('/edit', [isAuth], async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  try {
    const user = await pool.query('select * from users where id = $1', [
      req.userId.id
    ]);
    const { degree, percentage, gender, dob } = req.body;

    await pool.query(
      'update  profile set degree = $1, percentage= $2, gender =$3, dob=$4  where id=$5',
      [degree, percentage, gender, dob, req.userId.id],
      function(err, result) {
        if (err) {
          res.status(400).json({ message: 'something went wrong' });
        } else {
          return res.status(200).json({ message: 'updated successfully' });
        }
      }
    );
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
router.delete('/delete', [isAuth], async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  try {
    const user = await pool.query('select * from users where id = $1', [
      req.userId.id
    ]); //or req.paramas.id

    await pool.query(
      'delete from profile where id =$1',
      [req.userId.id],
      function(err, result) {
        if (err) {
          res.status(400).json({ message: 'something went wrong' });
        } else {
          return res.status(200).json({ message: 'deleted successfully' });
        }
      }
    );
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
module.exports = router;
