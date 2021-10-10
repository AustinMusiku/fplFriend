const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const { Schema } = require('./schema/schema');
const cors = require('cors');
const dataLoader = require('dataloader');
const fs = require('fs');
const compression = require('compression')
const fetchControllers = require('./controllers/fetchControllers');

// config file
dotenv.config();

const app = express()

// middleware
app.use(compression({ level: 9 }))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/dist', express.static(path.join(__dirname + '/dist')))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + '/views'))
app.use(cors({
    allowedHeaders : 'Content-Type,Authorization'
}));

// // setup logging write stream for morgan
// let logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
// app.use(morgan('tiny', { stream: logStream }));

// graphql endpoint
app.use('/graphql', graphqlHTTP(req => {
    const playerEventLoader = new dataLoader(keys => {
        return Promise.all(keys.map(key => fetchControllers.getPlayerEventsById(key)))
    })

    const playerLoader = new dataLoader(keys => {
        return Promise.all(keys.map(fetchControllers.getPlayerDataById))
    })

    const loaders = {
        playerEvent: playerEventLoader,
        player: playerLoader
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