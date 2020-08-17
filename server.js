const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const cors = require('cors');
const morgan = require('morgan');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(errorHandler());
app.use(cors());
app.use(morgan('dev'));

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}.\nCtrl + C to quit.`);
})

module.exports = app;