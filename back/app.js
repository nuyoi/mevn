const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
var cors = require('cors');

require('dotenv').config();

var app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/auth/signup', [
    body('email').isEmail().withMessage('Please type valid email').custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject('Email address already exists!');
            }
        });
    }),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be greater than 8 charactors'),
    body('name').trim().not().isEmpty().withMessage('Name field is required')
], async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        console.log(errors);
        return next(error);
    }
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    // 패스워드 해쉬화 해서 데이터베이스에 저장
    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            email,
            password: hashedPassword,
            name
        });
        const result = await user.save();

        res.status(201).json({
            message: "User created",
            user: result._id
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
})

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message, data
    })
})

// app.listen(3000, () => console.log('listening to port 3000'));

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zgfox.mongodb.net/taskmanager?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    app.listen(3000, () => console.log('listening to port 3000'));
}).catch(err => console.log(err));