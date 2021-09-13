const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');

// config file
dotenv.config();

const app = express()

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname + '/public')))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + '/views'))

// routes
const router = require('./routes/routes');
app.use('/', router);

// fire app
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port: ${port} in ${process.env.NODE_ENV} mode`);
})