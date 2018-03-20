
var express = require("express");
var config = require("../config.json");
var bodyParser = require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSD7F94";
var mongo = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");
var assert = require('assert');
var port = process.env.PORT || 4005;
var forEach = require('async-foreach').forEach;
var router = express.Router();
var url = 'mongodb://' + config.dbhost + ':27017/s_erp_data';
var teacherUserModule = require('../api_components/teacher_user_save');
var cookieParser = require('cookie-parser');
var adminModule = function () { };


adminModule.prototype.addAdmin = function (request) {
    var status = 1;
    var adminstrative_name = request.name;
    var school_id = request.school_id;
    var splited = school_id.split("-");
    var schoolId = splited[1];
    var schoolAutoId = schoolId.slice(3);
    var employee_id = request.employee_id;
    var joined_on = request.joined_on;
    // var students = {student_id : student_id};
    var item = {
        adminstrative_id: 'getauto',
        adminstrative_name: adminstrative_name,
        school_id: school_id,
        employee_id: employee_id,
        joined_on: joined_on,
        status: status,
    }
    mongo.connect(url, function (err, db) {
        autoIncrement.getNextSequence(db, 'adminstrative', function (err, autoIndex) {
            var collection = db.collection('adminstrative');
            collection.ensureIndex({
                "adminstrative_id": 1,
            }, {
                    unique: true
                }, function (err, result) {
                    collection.insertOne(item, function (err, result) {
                        if (err) {
                            if (err.code == 11000) {
                                // res.end('false');
                            }
                            // res.end('false');
                        }
                        collection.update({

                            _id: item._id
                        }, {
                                $set: {
                                    adminstrative_id: school_id + '-ADM-' + autoIndex
                                }
                            }, function (err, result) {
                                // db.close();
                                // res.end('true');
                                var userData = {};
                                userData.email = "91" + schoolAutoId + 'A' + autoIndex;
                                userData.password = "91" + schoolAutoId + 'A' + autoIndex;
                                userData.uniqueId = school_id + '-ADM-' + autoIndex;
                                userData.employeeId = employee_id;
                                // userData.email = parentId+autoIndex;
                                // userData.password = parentId+autoIndex;
                                // userData.uniqueId = parentId+autoIndex;
                                userData.role = "adminstrative";
                                userData.school_id = school_id;
                                teacherUserModule.teacherUserModuleSave(userData);
                            });
                    });

                });
        });
    });
}

// adminModule.prototype.admin = function (admins_account, res, next) {
//     // console.log(teachers_account[0]);
//     // var prents_length = parents_account.length;
//     var count = 0;
//     if (admins_account.length > 0) {
//         forEach(admins_account, function (key, value) {
//             // if (key.teachers_account == 'TRUE') {
//             var status = 1;
//             var adminstrative_name = key.name;
//             var school_id = key.school_id;
//             var splited = school_id.split("-");
//             var schoolId = splited[1];
//             var schoolAutoId = schoolId.slice(3);
//             var employee_id = key.employee_id;
//             var joined_on = key.joined_on;

//             var item = {
//                 adminstrative_id: 'getauto',
//                 adminstrative_name: adminstrative_name,
//                 school_id: school_id,
//                 employee_id: employee_id,
//                 joined_on: joined_on,
//                 status: status,
//             }

//             mongo.connect(url, function (err, db) {
//                 autoIncrement.getNextSequence(db, 'adminstrative', function (err, autoIndex) {
//                     var collection = db.collection('adminstrative');
//                     collection.ensureIndex({
//                         "adminstrative_id": 1,
//                     }, {
//                             unique: true
//                         }, function (err, result) {
//                             if (item.adminstrative_name == null || employee_id == null || school_id == null) {
//                                 res.end('null');
//                             } else {
//                                 //   item.teacher_id = school_id + '-TCH-' + autoIndex;
//                                 collection.insertOne(item, function (err, result) {
//                                     if (err) {
//                                         //  console.log(err);
//                                         if (err.code == 11000) {

//                                             // res.end('false');
//                                         }
//                                         //  res.end('false');
//                                     }
//                                     collection.update({
//                                         _id: item._id
//                                     }, {
//                                             $set: {
//                                                 adminstrative_id: school_id + '-ADM-' + autoIndex
//                                             },
//                                         }, function (err, result) {
//                                             // db.close();
//                                             // res.end('true');
//                                             var userData = {};
//                                             userData.email = "91" + schoolAutoId + 'A' + autoIndex;
//                                             userData.password = "91" + schoolAutoId + 'A' + autoIndex;
//                                             userData.uniqueId = school_id + '-ADM-' + autoIndex;
//                                             // userData.email = parentId+autoIndex;
//                                             // userData.password = parentId+autoIndex;
//                                             // userData.uniqueId = parentId+autoIndex;
//                                             userData.role = "adminstrative";
//                                             userData.school_id = school_id;
//                                             teacherUserModule.teacherUserModuleSave(userData);
//                                         });
//                                     count++;
//                                     db.close();

//                                     if (count == admins_account.length) {
//                                         // res.send('true');
//                                     }
//                                 });
//                             }
//                         });

//                 });
//             });
//         });

//     }
// }
module.exports = new adminModule();