const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');

const app = express();
app.use(express.json({ limit: '10kb' }));
const limiter = rateLimit({
    windowMs: 60*60*1000,
    max: 25, // limit each IP to 100 requests per windowMs
    message: 'Too many requests' // message to send
});
//app.use(limiter);
app.use(cors());
app.use(routes);

module.exports = app;