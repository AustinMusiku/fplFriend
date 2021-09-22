const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const { Schema } = require('./schema/schema');
const cors = require('cors');
const dataLoader = require('dataloader');

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

// graphql endpoint
app.use('/graphql', graphqlHTTP(req => {
    // const playerLoader = new dataLoader()
    // const gameWeekLoader = new dataLoader()

    // const loaders = {
    //     player: playerLoader,
    //     gameWeek: gameWeekLoader 
    // }
    return {
        schema: Schema,
        graphiql: process.env.NODE_ENV == 'production'? false : true
    }
}))

// routes
const router = require('./routes/routes');
app.use('/', router);

// fire app
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port: ${port} in ${process.env.NODE_ENV} mode`);
})