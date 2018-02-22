// flow
var express = require("express");
var config = require("../config.json");
var bodyParser = require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSD7F94";
var mongo = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");
var assert = require('assert');
var port = process.env.PORT || 4005;
var router = express.Router();
var async = require('async');
var fs = require('fs');
var waterfall = require('async-waterfall');
var forEach = require('async-foreach').forEach;
var multer = require('multer');
var url = 'mongodb://' + config.dbhost + ':27017/s_erp_data';
var mailer = require('nodemailer');
var schoolUserModule = require('../api_components/school_registration_user');
var cookieParser = require('cookie-parser');
router.use(function (req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

// Add Schools

// Use Smtp Protocol to send Email
var smtpTransport = mailer.createTransport({
    service: "gmail",
    auth: {
        user: "mokshasoftsolutions@gmail.com",
        pass: "Moksha99"
    }
});

router.route('/websiteQuery_moksha/:date')
    .post(function (req, res, next) {
        var status = 1;
        var date = req.params.date;
        var query = req.body.query;
        var user = req.body.user;
        if (user && query) {
            var mail = {
                from: "mokshasoftsolutions@gmail.com",
                to: "info@mokshasoftsolutions.in",
                subject: "ProSchool ERP User Queries ",
                // text: "email: " + username + "password : " + username,
                html: "<b> Username :</b>" + user + "<br>" + "<b> Query : </b>" + query
            }

            smtpTransport.sendMail(mail, function (error, response) {
                if (error) {
                    res.send('email not sent');
                } else {
                    //  console.log("Message sent: ");
                }

                smtpTransport.close();
            });

            res.send('email sent');
        }
        else {
            res.send('false');
        }
    });



module.exports = router;