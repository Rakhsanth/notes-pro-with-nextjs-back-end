// 3rd party modules
const mongoose = require('mongoose');

const connectDB = async () => {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    });

    console.log(
        `MongoDB connected: ${connection.connection.host}`.cyan.underline
    );
};

module.exports = connectDB;
