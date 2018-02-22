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

var storageImage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
        // cb(null, file.originalname);
    }
});

var uploadImage = multer({ //multer settings
    storage: storageImage,
    fileFilter: function (req, file, callback) { //file filter
        if (['jpg', 'png'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');


router.route('/schools')
    .post(function (req, res, next) {
        var status = 1;
        schools = [];
        uploadImage(req, res, function (err) {
            if (err) {
                res.json({ error_code: 1, err_desc: err });
                return;
            }
            /** Multer gives us file info in req.file object */
            if (!req.file) {
                res.json({ error_code: 1, err_desc: "No file passed" });
                return;
            }
            var SchoolImage = {
                filename: req.file.filename,
                originalname: req.file.originalname,
                imagePath: req.file.path,
                mimetype: req.file.mimetype,
            }
            var item = {
                school_id: 'getauto',
                name: req.body.name,
                est_on: req.body.est_on,
                address: req.body.address,
                phone: req.body.phone,
                email: req.body.email,
                website: req.body.website,
                academic_year: req.body.academic_year,
                description: req.body.description,
                founder: req.body.founder,
                chairman: req.body.chairman,
                vice_principal: req.body.vice_principal,
                extra_curricular_activites: req.body.extra_curricular_activites,
                coordinator: req.body.coordinator,
                principal: req.body.principal,
                alternate_phone: req.body.alternate_phone,
                class_from: req.body.class_from,
                timings: req.body.timings,
                alternate_email: req.body.alternate_email,
                medium: req.body.medium,
                facilities_available: req.body.facilities_available,
                afflication: req.body.afflication,
                status: status,
            };
            var username = req.body.email;
            // var mail = {
            //     from: "basinahemababu91@gmail.com",
            //     to: username,
            //     subject: "Authentication fields for PROSchool ",
            //     text: "email: " + username + "password : " + username,
            //     html: "<b> Username :</b>" + username + "<br>" + "<b> Password : </b>" + username
            // }

            // smtpTransport.sendMail(mail, function (error, response) {
            //     if (error) {
            //         console.log(error);
            //     } else {
            //         console.log("Message sent: ");
            //     }

            //     smtpTransport.close();
            // });
            mongo.connect(url, function (err, db) {
                autoIncrement.getNextSequence(db, 'schools', function (err, autoIndex) {
                    var collection = db.collection('schools');
                    collection.ensureIndex({
                        "school_id": 1,
                    }, {
                            unique: true
                        }, function (err, result) {
                            if (item.name == null || item.email == null || item.phone == null) {
                                res.end('null');
                            } else {
                                collection.insertOne(item, function (err, result) {
                                    if (err) {
                                        if (err.code == 11000) {
                                            res.end('false');
                                        }
                                        res.end('false');
                                    }
                                    collection.update({
                                        _id: item._id
                                    }, {
                                            $set: {
                                                school_id: 'SCH-927' + autoIndex
                                            },
                                            $push: {
                                                SchoolImage
                                            }
                                        }, function (err, result) {
                                            db.close();
                                            res.send('username and password sent to your email');
                                            var userData = {};
                                            userData.email = item.email;
                                            userData.password = item.email;
                                            userData.uniqueId = 'SCH-927' + autoIndex;
                                            userData.role = "admin";
                                            userData.school_id = 'SCH-927' + autoIndex;
                                            schoolUserModule.addAdminToSchool(userData);
                                        });
                                });
                            }
                        });
                });
            });
        });
    })
    .get(function (req, res, next) {
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('schools').find();
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    schools: resultArray
                });
            });
        });
    });

router.route('/school_details/:school_id')
    .get(function (req, res, next) {
        var school_id = req.params.school_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('schools').find({ school_id });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    schools: resultArray
                });
            });
        });
    });



router.route('/school/:school_id')
    .post(function (req, res, next) {
        var school_id = req.params.school_id;
        var name = req.body.name;
        var value = req.body.value;
        mongo.connect(url, function (err, db) {
            db.collection('schools').update({ school_id }, { $set: { [name]: value } }, function (err, result) {
                assert.equal(null, err);
                db.close();
                res.send('true');
            });
        });
    });


router.route('/edit_school_details/:school_id')
    .put(function (req, res, next) {

        var myquery = { school_id: req.params.school_id };
        var req_name = req.body.name;
        var req_medium = req.body.medium;
        var req_academic_year = req.body.academic_year;
        var req_extra_curricular_activites = req.body.extra_curricular_activites;
        var req_facilities_available = req.body.facilities_available;
        var req_timings = req.body.timings;
        var req_afflication = req.body.afflication;
        var req_class_from = req.body.class_from;
        var req_website = req.body.website;
        var req_email = req.body.email;
        var req_phone = req.body.phone;
        var req_alternate_phone = req.body.alternate_phone;
        var req_address = req.body.address;
        var req_founder = req.body.founder;
        var req_chairman = req.body.chairman;
        var req_principal = req.body.principal;
        var req_vice_principal = req.body.vice_principal;
        var req_coordinator = req.body.coordinator;
        var req_est_on = req.body.est_on;

        mongo.connect(url, function (err, db) {
            db.collection('schools').update(myquery, {
                $set: {
                    name: req_name,
                    medium: req_medium,
                    academic_year: req_academic_year,
                    timings: req_timings,
                    extra_curricular_activites: req_extra_curricular_activites,
                    facilities_available: req_facilities_available,
                    afflication: req_afflication,
                    class_from: req_class_from,
                    founder: req_founder,
                    chairman: req_chairman,
                    principal: req_principal,
                    vice_principal: req_vice_principal,
                    coordinator: req_coordinator,
                    website: req_website,
                    email: req_email,
                    phone: req_phone,
                    est_on: req_est_on,
                    alternate_phone: req_alternate_phone,
                    address: req_address,
                }
            }, function (err, result) {
                assert.equal(null, err);
                if (err) {
                    res.send('false');
                }
                db.close();
                res.send('true');
            });
        });
    });



router.route('/schools_photo_edit/:school_id')
    .post(function (req, res, next) {
        var status = 1;
        var school_id = req.params.school_id;
        var myquery = { school_id: req.params.school_id };
        uploadImage(req, res, function (err) {
            if (err) {
                res.json({ error_code: 1, err_desc: err });
                return;
            }
            /** Multer gives us file info in req.file object */
            if (!req.file) {
                res.json({ error_code: 1, err_desc: "No file passed" });
                return;
            }
            // var SchoolImage = {
            filename = req.file.filename;
            originalname = req.file.originalname;
            imagePath = req.file.path;
            mimetype = req.file.mimetype;
            // }
            //   var filename = req.file.filename;
            //   console.log(filename);

            mongo.connect(url, function (err, db) {
                db.collection('schools').update(myquery, {
                    $set:
                        ({ SchoolImage: [{ filename: filename, originalname: originalname, imagePath: imagePath, mimetype: mimetype }] })
                    // SchoolImage: SchoolImage
                }, function (err, result) {
                    if (err) {
                        res.send('false');
                    }
                    db.close();
                    res.send('true');
                });
            });
        })
    });

// router.route('/Email_to_Teacher/:teacher_id/:school_id')
//     .post(function (req, res, next) {
//         var school_id = req.params.school_id;
//         var teacherId = req.params.teacher_id;
//         //  var teacher = req.body.teacher;
//         //    teacherId = teacher_id.toUpperCase();
//         teacher_id = teacherId.toLowerCase();
//         var resultArray = resultArray2 = [];
//         mongo.connect(url, function (err, db) {
//             assert.equal(null, err);
//             var cursor = db.collection('teachers').find({ teacher_id: teacherId });
//             cursor.forEach(function (doc, err) {
//                 assert.equal(null, err);
//                 resultArray.push(doc);
//             }, function () {

//                 employeeId = resultArray[0].employee_id;
//                 // console.log(employeeId);

//                 mongo.connect(url, function (err, db) {
//                     assert.equal(null, err);
//                     var cursor = db.collection('employee').find({ employee_id: employeeId });
//                     cursor.forEach(function (doc, err) {
//                         assert.equal(null, err);
//                         resultArray.push(doc);
//                     }, function () {
//                         //   console.log(resultArray);
//                         email = resultArray[1].email;
//                         // console.log(email);

//                         var mail = {
//                             from: "mokshasoftsolutions@gmail.com",
//                             to: email,
//                             subject: "Authentication fields for PROSchool ",
//                             text: "email: " + teacher_id + "password : " + teacher_id,
//                             html: "<b> Username :</b>" + teacher_id + "<br>" + "<b> Password : </b>" + teacher_id
//                         }

//                         smtpTransport.sendMail(mail, function (error, response) {
//                             if (error) {
//                                 //console.log(error);
//                                 res.send('false');
//                             } else {
//                                 // console.log("Message sent: ");
//                             }

//                             smtpTransport.close();
//                         });
//                         db.close();

//                     });
//                 });

//                 res.send('true');
//             });
//         });

//     });


router.route('/Email_to_all_Teachers/:school_id')
    .post(function (req, res, next) {
        var resultArray = [];
        var school_id = req.params.school_id;
        var teachersResultArray = req.body.teachers;


        mongo.connect(url, function (err, db) {

            async.waterfall(
                [

                    function getSchoolEmployees(next) {
                        //   console.log("getSchoolClassed");
                        db.collection('teachers').find({
                            school_id
                        }).toArray(function (err, result) {
                            if (err) {
                                next(err, null);
                            }
                            next(null, result);
                        });
                    },
                    function getEmployeeData(result, next) {
                        //   console.log("getSectionsData");                      
                        var count = 0;
                        var teachersResult = result;
                        var teachersResultLength = result.length;
                        if (teachersResultLength == 0) {
                            next(null, []);
                        } else {
                            //  console.log("In Second step sections")
                            var teachersData = {};
                            teachersResult.forEach(function (teachersData) {
                                var employee_id = teachersData.employee_id;
                                // console.log(class_id);
                                db.collection('employee').find({
                                    employee_id
                                }).toArray(function (err, results) {
                                    count++;
                                    if (err) {
                                        next(err, null);
                                    }
                                    teachersData.employee = results

                                    if (teachersResultLength == count) {

                                        next(null, teachersResult);
                                        // next(null, classData);
                                    }

                                })
                            })
                        }
                    }, function getemployeeData(result, next) {
                        // console.log("getAttendanceData");
                        //  console.log(attResult);
                        //  console.log(result);
                        var count = 0;

                        var teachersResult = result;
                        var teacherDataLength = result.length;
                        //  console.log(classData.sections);
                        if (teacherDataLength == 0) {
                            next(null, []);
                        } else {
                            // console.log("In fourth step sections attendance")
                            teachersResult.forEach(function (teacherData) {


                                var sectionCount = 0;
                                var teachersData = teacherData;
                                var teacherId = teacherData.teacher_id;

                                var employeeDataLength = teacherData.employee.length;
                                var employee_id = teacherData.employee_id;
                                //  var employeeEmail = teachersData.employee[0].email;
                                if (employeeDataLength == 0) {
                                    count++;
                                    // console.log("count 0")
                                } else {
                                    //  console.log(teacherId);
                                    //  console.log(employee_id);
                                    //   console.log(teachersResultArray);
                                    teachersResultArrayLength = teachersResultArray.length;

                                    for (var i = 0; i < teachersResultArrayLength; i++) {

                                        if (teachersResultArray[i].teacher_id == teacherId) {
                                            Email = teachersData.employee[0].email;
                                            //  console.log(teacherId);
                                            //  console.log(Email);
                                            // filepath = __dirname + '/../uploads/file-1512814699055.jpg';
                                            var mail = {
                                                from: "mokshasoftsolutions@gmail.com",
                                                to: Email,
                                                subject: "Authentication fields for PROSchool ",
                                                text: "email: " + teacherId.toLowerCase() + "password : " + teacherId.toLowerCase(),
                                                html: "<b> Username :</b>" + teacherId.toLowerCase() + "<br>" + "<b> Password : </b>" + teacherId.toLowerCase(),
                                                // attachments: [{
                                                //     filename: 'file-1512814699055.jpg',
                                                //     streamSource: fs.createReadStream(filepath)
                                                // }]
                                            }

                                            smtpTransport.sendMail(mail, function (error, response) {
                                                if (error) {
                                                    //console.log(error);
                                                    // res.send('false');
                                                } else {
                                                    // console.log("Message sent: ");
                                                }

                                                smtpTransport.close();
                                            });


                                        }


                                    }
                                    count++;
                                }

                                if (teacherDataLength == count) {
                                    next(null, 'classAttendence');
                                }
                            });
                        }
                    }
                ],
                function (err, result1) {

                    db.close();
                    if (err) {
                        res.send({
                            error: err
                        });

                    } else {

                        res.send({
                            students: result1
                        });

                    }
                }
            );
        });
    });

router.route('/Email_to_all_Parents/:school_id')
    .post(function (req, res, next) {
        var resultArray = [];
        var school_id = req.params.school_id;
        var parentsResultArray = req.body.parents;


        mongo.connect(url, function (err, db) {

            async.waterfall(
                [
                    function getSchoolParents(next) {
                        //   console.log("getSchoolClassed");
                        db.collection('parents').find({
                            school_id
                        }).toArray(function (err, result) {
                            if (err) {
                                next(err, null);
                            }
                            next(null, result);
                        });
                    },
                    function getParentsData(result, next) {

                        var count = 0;
                        var parentResult = result;
                        var parentResultLength = result.length;
                        if (parentResultLength == 0) {
                            next(null, []);
                        } else {

                            parentResult.forEach(function (parentData) {
                                //  console.log(parentsData);
                                var student_id = parentData.students[0].student_id;
                                // console.log(student_id);
                                db.collection('students').find({
                                    student_id
                                }).toArray(function (err, results) {
                                    count++;
                                    if (err) {
                                        next(err, null);
                                    }
                                    parentData.studentArray = results
                                    // console.log(student_id);
                                    // console.log(studentArray.students);
                                    if (parentResultLength == count) {

                                        next(null, parentResult);
                                        // next(null, classData);
                                    }

                                })
                            })
                        }
                    }, function getemployeeData(result, next) {
                        // console.log("getAttendanceData");
                        //   console.log(studentArray.students[0].father_email);
                        //  console.log(result);
                        var count = 0;

                        var parentResult = result;
                        var parentDataLength = result.length;
                        //  console.log(classData.sections);
                        if (parentDataLength == 0) {
                            next(null, []);
                        } else {
                            // console.log("In fourth step sections attendance")
                            parentResult.forEach(function (parentData) {

                                var parentsData = parentData;
                                var parentId = parentData.parent_id;

                                var parentDataLength = parentData.studentArray.length;
                                // var studentsArray2 = studentArray.students;
                                // var student_id = parentData.students[0].student_id;
                                //  var employeeEmail = teachersData.employee[0].email;
                                if (parentDataLength == 0) {
                                    count++;
                                    // console.log("count 0")
                                } else {
                                    //  console.log(studentArray);
                                    //  console.log(employee_id);
                                    //   console.log(teachersResultArray);
                                    parentsResultArrayLength = parentsResultArray.length;

                                    for (var i = 0; i < parentsResultArrayLength; i++) {
                                        //  console.log("hema");
                                        if (parentsResultArray[i].parent_id == parentId) {
                                            // console.log("babu");
                                            //  console.log(parentsResultArray[i].parent_id);
                                            if (parentData.studentArray[0].father_email) {
                                                // console.log(studentArray);
                                                Email = parentData.studentArray[0].father_email;
                                                //  console.log(parentId);
                                                //  console.log(Email);

                                                var mail = {
                                                    from: "mokshasoftsolutions@gmail.com",
                                                    to: Email,
                                                    subject: "Authentication fields of PROSchool ",
                                                    text: "email: " + parentId.toLowerCase() + "password : " + parentId.toLowerCase(),
                                                    html: "<b> Username :</b>" + parentId.toLowerCase() + "<br>" + "<b> Password : </b>" + parentId.toLowerCase()
                                                }

                                                smtpTransport.sendMail(mail, function (error, response) {
                                                    if (error) {
                                                        //console.log(error);
                                                        // res.send('false');
                                                    } else {
                                                        // console.log("Message sent: ");
                                                    }

                                                    smtpTransport.close();
                                                });

                                            }
                                        }


                                    }
                                    count++;
                                }

                                if (parentDataLength == count) {
                                    next(null, 'classAttendence');
                                }
                            });
                        }
                    }
                ],
                function (err, result1) {

                    db.close();
                    if (err) {
                        res.send({
                            error: err
                        });

                    } else {

                        res.send({
                            students: result1
                        });

                    }
                }
            );
        });
    });


module.exports = router;
