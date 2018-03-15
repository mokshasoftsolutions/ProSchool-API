var express = require('express'); // Web Framework
var app = express();
var sql = require('mssql');// MS Sql Server client
var router = express.Router();

var bodyParser = require("body-parser");

router.use(bodyParser.json({ limit: '100mb' }));
router.use(bodyParser.urlencoded({ limit: '100mb', extended: false, parameterLimit: 10000 }));

var dbconncetion = require("./dbconnection.js");

var cookieParser = require('cookie-parser');

var sqlConfig = {
    user: 'sa',
    password: 'Jaasmith@4',
    server: 'localhost',
    database: 'sample_data',
    port: 1433

}
router.use(function (req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

//Get API
router.route('/user')
    .get(function (req, res) {
        sql.connect(sqlConfig, function () {
            var request = new sql.Request();
            request.query('select * from hemababu', function (err, recordset) {
                if (err) console.log(err);
                res.send({ sampleData: recordset }); // Result in JSON format
            });
        });
    })

//POST API
router.route('/user')
    .post(function (req, res) {
        var id = req.body.id;
        var name = req.body.name;
        var near = req.body.near;
        var street = req.body.street;
        var city = req.body.city;


        sql.connect(sqlConfig, function () {
            var request = new sql.Request();

            request.query("INSERT INTO hemababu ([id],[name],[near],[street],[city]) VALUES ('" + id + "','" + name + "','" + near + "','" + street + "','" + city + "')", function (err, result, fields) {
                if (err) console.log(err);

                res.end(JSON.stringify(result));  // Result in JSON format
            });
        });
    });



//PUT API
router.route('/user/:id')
    .put(function (req, res) {

        sql.connect(sqlConfig, function () {
            var request = new sql.Request()
            request.query("UPDATE hemababu SET name= '" + req.body.name + "',near='" + req.body.near + "'  WHERE id= '" + req.params.id + "'", function (err, recordset) {
                if (err) console.log(err);
                res.send(JSON.stringify(recordset)); // Result in JSON format
            });
        });
    });

// DELETE API
router.route('/user/:id')
    .delete(function (req, res) {

        sql.connect(sqlConfig, function () {
            var request = new sql.Request();
            request.query("DELETE FROM hemababu WHERE id='" + req.params.id + "'", function (err, recordset) {
                if (err) console.log(err);
                res.end(JSON.stringify(recordset)); // Result in JSON format
            });
        });
    });

module.exports = router;