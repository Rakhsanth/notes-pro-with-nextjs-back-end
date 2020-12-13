// 3rd party modules
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const morgan = require('morgan');
const colors = require('colors');
// core modules
const path = require('path');
// custom modules
const rootPath = require('./utils/rootPath');
const connectDb = require('./config/db');
const mongoErrorHandler = require('./middlewares/mongoErrorHandler');
const userRoutes = require('./routes/users');
const notesRoutes = require('./routes/notes');
// To get and environment variables from config:
dotenv.config({ path: path.join(rootPath, 'config', 'config.env') });

// Connecting to mongoDB
connectDb();

// Init express app
const app = express();

// Using the body parser from express to parse the body from request without that chunk and buffer thing.
app.use(express.json()); // I think it has the next method so that this can pass to all middlewares

// Used for trusting the 1st proxy set by heroku in this case
app.set('trust proxy', true);

// This will add the cookie parsing functionlity and enables to get get and send cookie on req and res.
app.use(cookieParser());

// To enable cors from different trusted origins
app.use(
    cors({
        credentials: true,
        origin: ['http://localhost:3000', 'https://notes-pro.vercel.app'],
    })
);

// create mongo store for storing sessions
const store = new mongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions',
});

// console.log(store);

// create session
const secureCookie = process.env.ENVIRONMENT === 'prod' ? true : false;
// const httpOnly = process.env.ENVIRONMENT === 'prod' ? true : false;
app.use(
    require('express-session')({
        // By default UUID-safe is used which is enough unleass some complex use case is needed
        name: process.env.SESSION_NAME,
        secret: process.env.SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * process.env.SESSION_EXPIRE, // 1 hour
            httpOnly: true,
            secure: secureCookie,
            domain:
                process.env.ENVIRONMENT === 'prod'
                    ? 'https://notes-pro.vercel.app'
                    : 'http://localhost:3000',
        },
        store: store,
        resave: true,
        saveUninitialized: false,
    })
);

if (process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'prod') {
    app.use(morgan('dev'));
}

// To serve the static files like the API docs if needed
app.use(express.static(path.join(rootPath, 'public')));

// API routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notes', notesRoutes);
// Error handler for catched errors from above middlewares.
//This recieves the next() from the above router middleware.

app.get('/*', (req, res, next) => {
    res.status(200).json({ success: false, message: 'dummy response' });
});

app.use(mongoErrorHandler);

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
