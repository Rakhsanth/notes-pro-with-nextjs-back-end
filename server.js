// 3rd party modules
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const colors = require('colors');
// core modules
const path = require('path');
// custom modules
const rootPath = require('./utils/rootPath');
const connectDb = require('./config/db');

// To get and environment variables from config:
dotenv.config({ path: path.join(rootPath, 'config', 'config.env') });

// Connecting to mongoDB
connectDb();

// Init express app
const app = express();

// Using the body parser from express to parse the body from request without that chunk and buffer thing.
app.use(express.json()); // I think it has the next method so that this can pass to all middlewares

// This will add the cookie parsing functionlity and enables to get get and send cookie on req and res.
app.use(cookieParser());

// To enable cors from different trusted origins
app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }));

if (process.env.ENVIRONMENT === 'dev') {
    app.use(morgan('dev'));
}

// To serve the static files like the API docs if needed
app.use(express.static(path.join(rootPath, 'public')));

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
    console.log(
        `Server is on and running in ${process.env.ENVIRONMENT} mode at port: ${port}`
            .yellow.bold
    );
});

process.on('unhandledRejection', (error, promise) => {
    console.log(`Error: ${error.message}`.red.bold);
    server.close(() => {
        process.exit(1);
    });
});
