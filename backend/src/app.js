const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const driverRoutes = require('./routes/driver');
require('dotenv').config();
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

app.use('/', (req, res, next)=>{
    if (req.url === "/") {
        res.json('OK')
    } else {
        next()
    }
})
app.use('/api', driverRoutes)


app.listen(4000, () => {
    try {
        console.log('Server running on 4000')
        mongoose.connect(process.env.MONGO_URI, {
            ssl: true,
            tlsAllowInvalidCertificates: true, // temporary workaround if needed
          });
        console.log("Database is running")
    } catch (error) {
        console.log(error.message)
    }
   
});