var express = require('express');
var mongoose = require('mongoose');

require('dotenv').config();

var app = express();

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zgfox.mongodb.net/taskmanager?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    app.listen(3000, ()=>console.log('listening to port 3000'));
}).catch(err => console.log(err));