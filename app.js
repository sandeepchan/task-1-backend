const express = require('express'),
  app = express(),
  bodyparser = require('body-parser'),
  cors = require('cors');
const authroutes = require('./controller/authcontroller');
const profileroute = require('./controller/profilecontroller');
const userController = require('./controller/usercontroller');
app.use(bodyparser.json());
app.use(
  bodyparser.urlencoded({
    extended: false
  })
);
app.use(cors());
app.use('/auth', authroutes);
app.use('/profile', profileroute);
app.use('/user', userController);
app.listen(8000, () => console.log('Server Started'));
