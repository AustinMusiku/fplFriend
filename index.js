const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const { Schema } = require('./schema/schema');
const cors = require('cors');
const dataLoader = require('dataloader');
const morgan = require('morgan');
const fs = require('fs');
const fetchControllers = require('./controllers/fetchControllers'); 

// config file
dotenv.config();

const app = express()

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname + '/public')))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + '/views'))
app.use(cors());

// // setup logging write stream for morgan
// let logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// app.use(morgan('tiny', { stream: logStream }));


// graphql endpoint
app.use('/graphql', graphqlHTTP(req => {
    const gameWeekLoader = new dataLoader(keys => {
        Promise.all(keys.map(key => fetchControllers.getPlayerEventsById(key)))
    })

    const loaders = {
        gameWeek: gameWeekLoader 
    }
    return {
        context: { loaders },
        schema: Schema,
        graphiql: process.env.NODE_ENV == 'production'? false : true
    }
}))

// routes
const router = require('./routes/routes');
const { Stream } = require('stream');
app.use('/', router);

// fire app
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port: ${port} in ${process.env.NODE_ENV} mode`);
})