// flow
var express = require("express");
var config = require("../config.json");
var bodyParser = require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSD7F94";
var mongo = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");
var assert = require('assert');
var forEach = require('async-foreach').forEach;
var async = require('async');
var waterfall = require('async-waterfall');
var port = process.env.PORT || 4005;
var router = express.Router();
var url = 'mongodb://' + config.dbhost + ':27017/s_erp_data';

var cookieParser = require('cookie-parser');
router.use(function (req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});


// // Fee Types
// router.route('/fee_term/:school_id')
//     .post(function (req, res, next) {
//         var status = 1;
//         var school_id = req.params.school_id;
//         var fee_types = [];
//         var item = {
//             fee_term_id: 'getauto',
//             school_id: school_id,
//             fee_term: req.body.fee_term,
//             fee_types: fee_types,
//             status: status,
//         }

//         mongo.connect(url, function (err, db) {
//             autoIncrement.getNextSequence(db, 'fee_term', function (err, autoIndex) {
//                 var collection = db.collection('fee_term');
//                 collection.ensureIndex({
//                     "fee_term_id": 1,
//                 }, {
//                         unique: true
//                     }, function (err, result) {
//                         if (item.fee_term == null || item.fee_term == "undefined" || item.fee_term == "") {
//                             res.end('null');
//                         } else {
//                             collection.insertOne(item, function (err, result) {
//                                 if (err) {
//                                     if (err.code == 11000) {
//                                         res.end('false');
//                                     }
//                                     res.end('false');
//                                 }
//                                 collection.update({
//                                     _id: item._id
//                                 }, {
//                                         $set: {
//                                             fee_term_id: school_id + 'FeeTerm-' + autoIndex
//                                         }
//                                     }, function (err, result) {
//                                         db.close();
//                                         res.end('true');
//                                     });
//                             });
//                         }
//                     });
//             });
//         });

//     })
//     .get(function (req, res, next) {

//         var school_id = req.params.school_id;
//         var resultArray = [];
//         mongo.connect(url, function (err, db) {
//             assert.equal(null, err);
//             var cursor = db.collection('fee_term').find({ school_id });
//             cursor.forEach(function (doc, err) {
//                 assert.equal(null, err);
//                 resultArray.push(doc);
//             }, function () {
//                 db.close();
//                 res.send({
//                     fee_term: resultArray
//                 });
//             });
//         });
//     });

// router.route('/fee_types/:school_id')
//     .post(function (req, res, next) {
//         var status = 1;
//         var fee_term_id = req.body.fee_term_id
//         var item = {
//             fee_types_id: 'getauto',
//             fee_type: req.body.fee_type,
//             status: status,
//         }

//         mongo.connect(url, function (err, db) {
//             autoIncrement.getNextSequence(db, 'fee_type', function (err, autoIndex) {
//                 var collection = db.collection('fee_type');
//                 collection.ensureIndex({
//                     "fee_types_id": 1,
//                 }, {
//                         unique: true
//                     }, function (err, result) {
//                         if (item.fee_term_id == null || item.fee_type == null || item.fee_term_id == "undefined" || item.fee_type == "undefined" || item.fee_term_id == "" || item.fee_type == "") {
//                             res.end('null');
//                         } else {
//                                 collection.update({
//                                     fee_term_id: fee_term_id._id
//                                 }, {
//                                         $set: {
//                                             fee_types_id: fee_type_id + '-' + 'FeeTypes-' + autoIndex
//                                         },
//                                         $push: {
//                                             fee_types: { item }

//                                     }, function (err, result) {
//                                         db.close();
//                                         res.end('true');
//                                     }
//                             });
//                         }
//                     });
//             });
//         });

//     })
//     .get(function (req, res, next) {

//         var school_id = req.params.school_id;
//         var resultArray = [];
//         mongo.connect(url, function (err, db) {
//             assert.equal(null, err);
//             var cursor = db.collection('feetypes').find({ school_id });
//             cursor.forEach(function (doc, err) {
//                 assert.equal(null, err);
//                 resultArray.push(doc);
//             }, function () {
//                 db.close();
//                 res.send({
//                     feetypes: resultArray
//                 });
//             });
//         });
//     });

// Fee Types
router.route('/fee_term/:school_id')
    .post(function (req, res, next) {
        var status = 1;
        var school_id = req.params.school_id;
        var fee_types = [];
        var item = {
            fee_term_id: 'getauto',
            school_id: school_id,
            fee_term: req.body.fee_term,
            status: status,
        }

        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'fee_term', function (err, autoIndex) {
                var collection = db.collection('fee_term');
                collection.ensureIndex({
                    "fee_term_id": 1,
                }, {
                        unique: true
                    }, function (err, result) {
                        if (item.fee_term == null || item.fee_term == "undefined" || item.fee_term == "") {
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
                                            fee_term_id: school_id + '-FeeTerm-' + autoIndex
                                        }
                                    }, function (err, result) {
                                        db.close();
                                        res.end('true');
                                    });
                            });
                        }
                    });
            });
        });

    })
    .get(function (req, res, next) {

        var school_id = req.params.school_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('fee_term').find({ school_id });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    fee_term: resultArray
                });
            });
        });
    });

router.route('/fee_types/:school_id')
    .post(function (req, res, next) {
        var status = 1;
        var school_id = req.params.school_id;
        var item = {
            fee_types_id: 'getauto',
            fee_type: req.body.fee_type,
            school_id: school_id,
            status: status,
        }

        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'fee_type', function (err, autoIndex) {
                var collection = db.collection('fee_type');
                collection.ensureIndex({
                    "fee_types_id": 1,
                }, {
                        unique: true
                    }, function (err, result) {
                        if (item.fee_type == null || item.fee_type == "undefined" || item.fee_type == "") {
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
                                            fee_types_id: school_id + '-FeeType-' + autoIndex
                                        }
                                    }, function (err, result) {
                                        db.close();
                                        res.end('true');
                                    });
                            });
                        }
                    });
            });
        });

    })
    .get(function (req, res, next) {

        var school_id = req.params.school_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('fee_type').find({ school_id });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    fee_type: resultArray
                });
            });
        });
    });




// fee Master


router.route('/fee_master/:school_id')
    .post(function (req, res, next) {
        var status = 1;
        var item = {
            fee_master_id: 'getauto',
            school_id: req.params.school_id,
            class_id: req.body.class_id,
            fee_types_id: req.body.fee_types_id,
            // fee_term: req.body.fee_term,
            fee_term_id: req.body.fee_term_id,

            //term: req.body.term,
            fee_amount: parseInt(req.body.fee_amount),
            due_date: req.body.due_date,
            fee_description: req.body.fee_description,

        }

        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'fee_master', function (err, autoIndex) {
                var collection = db.collection('fee_master');
                collection.ensureIndex({
                    "fee_master_id": 1,
                }, {
                        unique: true
                    }, function (err, result) {
                        if (item.fee_types_id == null || item.fee_types_id == "undefined" || item.fee_types_id == "" || item.fee_term_id == "undefined" || item.fee_term_id == "" || item.fee_amount == "undefined" || item.fee_amount == "" || item.fee_amount == null) {
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
                                            fee_master_id: 'FeeMaster-' + autoIndex
                                        }
                                    }, function (err, result) {
                                        db.close();
                                        res.end('true');
                                    });
                            });
                        }
                    });
            });
        });

    })
    .get(function (req, res, next) {
        var school_id = req.params.school_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            // var cursor = db.collection('fee_types').find({school_id});
            var cursor = db.collection('fee_master').aggregate([
                {
                    $match: {
                        school_id: school_id
                    }
                },
                {
                    $lookup: {
                        from: "fee_type",
                        localField: "fee_types_id",
                        foreignField: "fee_types_id",
                        as: "fee_doc"
                    }
                },
                {
                    "$unwind": "$fee_doc"
                },
                {
                    $lookup: {
                        from: "fee_term",
                        localField: "fee_term_id",
                        foreignField: "fee_term_id",
                        as: "fee_term_doc"
                    }
                },
                {
                    "$unwind": "$fee_term_doc"
                },
                {
                    $lookup: {
                        from: "school_classes",
                        localField: "class_id",
                        foreignField: "class_id",
                        as: "class_doc"
                    }
                },
                {
                    "$unwind": "$class_doc"
                },

                {
                    "$project": {
                        "_id": "$_id",
                        "fee_types_id": "$fee_types_id",
                        "class_id": "$class_id",
                        "fee_master_id": "$fee_master_id",
                        "fee_amount": "$fee_amount",
                        "due_date": "$due_date",
                        "fee_type": "$fee_doc.fee_type",
                        "fee_term": "$fee_term_doc.fee_term",
                        "fee_term_id": "$fee_term_id",
                        "class_name": "$class_doc.name"
                    }
                }
            ]);
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    feemaster: resultArray
                });
            });
        });
    });

router.route('/fee_amount_by_fee_type/:fee_term_id/:fee_types_id/:class_id')
    .get(function (req, res, next) {
        var fee_types_id = req.params.fee_types_id;
        var fee_term_id = req.params.fee_term_id;
        var class_id = req.params.class_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            // var cursor = db.collection('fee_types').find({school_id});
            var cursor = db.collection('fee_master').aggregate([
                {
                    $match: {
                        fee_types_id: fee_types_id,
                        fee_term_id: fee_term_id,
                        class_id: class_id
                    }
                },
                {
                    "$lookup": {
                        "from": "fee_type",
                        "localField": "fee_types_id",
                        "foreignField": "fee_types_id",
                        "as": "fee_doc"
                    }
                },
                {
                    "$unwind": "$fee_doc"
                },
                {
                    "$lookup": {
                        "from": "fee_term",
                        "localField": "fee_term_id",
                        "foreignField": "fee_term_id",
                        "as": "fee_term_doc"
                    }
                },
                {
                    "$unwind": "$fee_term_doc"
                },
                {
                    "$project": {
                        "_id": "$_id",
                        "fee_types_id": "$fee_types_id",
                        "class_name": "$class_name",
                        "fee_master_id": "$fee_master_id",
                        "fee_amount": "$fee_amount",
                        "fee_type": "$fee_doc.fee_type",
                        "fee_term": "$fee_term_doc.fee_term",

                    }
                }

            ]);
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    feemaster: resultArray
                });
            });
        });
    });

router.route('/feeTypes_by_classId/:class_id')
    .get(function (req, res, next) {
        var resultArray = [];
        var class_id = req.params.class_id;

        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('fee_master').aggregate([
                {
                    $match: {
                        class_id: class_id
                    }
                },
                {
                    $lookup: {
                        from: "fee_type",
                        localField: "fee_types_id",
                        foreignField: "fee_types_id",
                        as: "feetype"
                    }
                },
                {
                    "$unwind": "$feetype"
                },
                {
                    $lookup: {
                        from: "fee_term",
                        localField: "fee_term_id",
                        foreignField: "fee_term_id",
                        as: "feeterm"
                    }
                },
                {
                    "$unwind": "$feeterm"
                },
                {
                    "$project": {
                        "_id": "$_id",
                        "fee_types_id": "$fee_types_id",
                        "fee_master_id": "$fee_master_id",
                        "fee_type": "$feetype.fee_type",
                        "fee_term_id": "$fee_term_id",
                        "fee_term": "$feeterm.fee_term",
                        "amount": "$fee_amount"
                    }
                }
            ])
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    feeTypes: resultArray
                });
            });

        });
    });


// Fee Collection
router.route('/fee_collection/:student_id')
    .post(function (req, res, next) {
        var status = 1;
        var student_id = req.params.student_id;
        var splited = student_id.split("-");
        var school_id = splited[0] + '-' + splited[1];
        current_date = new Date();

        var item = {
            student_fee_id: 'getauto',
            student_id: student_id,
            school_id: school_id,
            class_id: req.body.class_id,
            fee_types_id: req.body.fee_types_id,
            fee_paid: parseInt(req.body.fee_paid),
            fee_term_id: req.body.fee_term_id,
            total_fee: parseInt(req.body.total_fee),
            payment_mode: req.body.payment_mode,
            discount: parseInt(req.body.discount),
            fine: parseInt(req.body.fine),
            current_date: current_date,
            status: status,
        }

        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'student_fee', function (err, autoIndex) {
                var collection = db.collection('student_fee');
                collection.ensureIndex({
                    "student_fee_id": 1,
                }, {
                        unique: true
                    }, function (err, result) {
                        if (item.fee_types_id == null || item.student_id == null || item.fee_types_id == "" || item.fee_paid == "" || item.student_id == "" || item.fee_paid == "undefined" || item.fee_types_id == "undefined") {
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
                                            student_fee_id: 'student_fee-' + autoIndex
                                        }
                                    }, function (err, result) {
                                        db.close();
                                        res.end('true');
                                    });
                            });
                        }
                    });
            });
        });
    });


router.route('/fee_collection/:student_id')
    .get(function (req, res, next) {
        var student_id = req.params.student_id;
        var splited = student_id.split("-");
        var class_id = splited[0] + '-' + splited[1] + '-' + splited[2] + '-' + splited[3];

        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            // var cursor = db.collection('student_fee').find({ student_id });
            var cursor = db.collection('student_fee').aggregate([
                {
                    $match: {
                        student_id: student_id
                    }
                },
                {
                    $lookup: {
                        from: "fee_type",
                        localField: "fee_types_id",
                        foreignField: "fee_types_id",
                        as: "feetype"
                    }
                },
                {
                    "$unwind": "$feetype"
                },
                {
                    $lookup: {
                        from: "fee_term",
                        localField: "fee_term_id",
                        foreignField: "fee_term_id",
                        as: "feeterm"
                    }
                },
                {
                    "$unwind": "$feeterm"
                },
                {
                    "$project": {
                        "_id": "$_id",
                        "student_fee_id": "$student_fee_id",
                        "student_id": "$student_id",
                        "fee_types_id": "$fee_types_id",
                        "fee_type": "$feetype.fee_type",
                        "fee_term_id": "$fee_term_id",
                        "fee_term": "$feeterm.fee_term",
                        "payment_mode": "$payment_mode",
                        "discount": "$discount",
                        "fine": "$fine",
                        "current_date": "$current_date",
                        "fee_paid": "$fee_paid",
                        "total_fee": "$total_fee",
                        "fee_category": "$feetype.fee_type",

                    }
                }
            ])
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    student_fee_details: resultArray
                });
            });
        });
    });

router.route('/fee_by_Date/:select_date/:school_id')
    .get(function (req, res, next) {
        var resultArray = [];
        var school_id = req.params.school_id;
        var select_date = new Date(req.params.select_date);
        var endDate = new Date(select_date);
        endDate.setDate(endDate.getDate() + 1)
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            // var cursor = db.collection('student_fee').find({
            //     current_date: { $gte: new Date(select_date.toISOString()), $lt: new Date(endDate.toISOString()) },
            //     school_id: school_id
            // });
            var cursor = db.collection('student_fee').aggregate([
                {
                    $match: {
                        current_date: {
                            $gte: new Date(select_date.toISOString()),
                            $lt: new Date(endDate.toISOString())
                        },
                        school_id: school_id
                    },
                },
                {
                    $lookup: {
                        from: "fee_type",
                        localField: "fee_types_id",
                        foreignField: "fee_types_id",
                        as: "fee_doc"
                    }
                },
                {
                    $unwind: "$fee_doc"
                },
                {
                    $lookup: {
                        from: "fee_term",
                        localField: "fee_term_id",
                        foreignField: "fee_term_id",
                        as: "fee_term_doc"
                    }
                },
                {
                    $unwind: "$fee_term_doc"
                },
                {
                    $lookup: {
                        from: "students",
                        localField: "student_id",
                        foreignField: "student_id",
                        as: "student_doc"
                    }
                },
                {
                    $unwind: "$student_doc"
                },
                {
                    "$project": {
                        "_id": "$_id",
                        "student_Name": "$student_doc.first_name",
                        "student_id": "$student_id",
                        "fee_types_id": "$fee_types_id",
                        "fee_type": "$fee_doc.fee_type",
                        "fee_term_id": "$fee_term_id",
                        "fee_term": "$fee_term_doc.fee_term",
                        "payment_mode": "$payment_mode",
                        "discount": "$discount",
                        "fine": "$fine",
                        "current_date": "$current_date",
                        "total_fee": "$total_fee",
                        "fee_paid": "$fee_paid",
                        "fee_category": "$feetype.fee_category",

                    }
                }
            ])
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                var feePaid = 0;
                for (i = 0; i < resultArray.length; i++) {
                    feePaid += parseInt(resultArray[i].fee_paid);
                }
                db.close();
                res.send({
                    fee: resultArray,
                    feePaid: feePaid
                });
            });

        });
    });

// router.route('/yesterday_fee_amount/:select_date/:school_id')
//     .get(function (req, res, next) {
//         var resultArray = [];
//         var school_id = req.params.school_id;
//         var select_date = new Date(req.params.select_date);
//         var endDate = new Date(select_date);
//         endDate.setDate(endDate.getDate() - 1)
//         mongo.connect(url, function (err, db) {
//             assert.equal(null, err);
//             var cursor = db.collection('student_fee').aggregate([
//                 {
//                     $match: {
//                         current_date: {
//                             $gte: new Date(endDate.toISOString()),
//                             $lt: new Date(select_date.toISOString())
//                         }
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: "feetypes",
//                         localField: "fee_types_id",
//                         foreignField: "fee_types_id",
//                         as: "fee_doc"
//                     }
//                 },
//                 {
//                     $unwind: "$fee_doc"
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "student_id",
//                         foreignField: "student_id",
//                         as: "student_doc"
//                     }
//                 },
//                 {
//                     $unwind: "$student_doc"
//                 },
//                 {
//                     "$project": {
//                         "_id": "$_id",
//                         "student_Name": "$student_doc.first_name",
//                         "student_id": "$student_id",
//                         "fee_types_id": "$fee_types_id",
//                         "fee_type": "$fee_doc.fee_type",
//                         // "totalFee": "$feeMaster_doc.fee_amount",
//                         "payment_mode": "$payment_mode",
//                         "discount": "$discount",
//                         "fine": "$fine",
//                         "current_date": "$current_date",
//                         // "due_date": "$feeMaster_doc.due_date",
//                         "fee_paid": "$fee_paid",
//                         "fee_category": "$feetype.fee_category",
//                         // "fee_amount": "$feemaster.fee_amount",
//                     }
//                 }
//             ])
//             cursor.forEach(function (doc, err) {
//                 assert.equal(null, err);
//                 resultArray.push(doc);
//             }, function () {
//                 var feePaid = 0;
//                 for (i = 0; i < resultArray.length; i++) {
//                     feePaid += parseInt(resultArray[i].fee_paid);
//                 }
//                 db.close();
//                 res.send({
//                     // fee: resultArray,
//                     yesterDayfeePaid: feePaid
//                 });
//             });

//         });
//     });

// router.route('/lastweek_fee_amount/:select_date/:school_id')
//     .get(function (req, res, next) {
//         var resultArray = [];
//         var school_id = req.params.school_id;
//         var select_date = new Date(req.params.select_date);
//         var presentDate = new Date(select_date);
//         presentDate.setDate(presentDate.getDate() + 1)
//         var endDate = new Date(select_date);
//         endDate.setDate(endDate.getDate() - 6)
//         mongo.connect(url, function (err, db) {
//             assert.equal(null, err);
//             var cursor = db.collection('student_fee').aggregate([
//                 {
//                     $match: {
//                         current_date: {
//                             $gte: new Date(endDate.toISOString()),
//                             $lt: new Date(presentDate.toISOString())
//                         }
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: "feetypes",
//                         localField: "fee_types_id",
//                         foreignField: "fee_types_id",
//                         as: "fee_doc"
//                     }
//                 },
//                 {
//                     $unwind: "$fee_doc"
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "student_id",
//                         foreignField: "student_id",
//                         as: "student_doc"
//                     }
//                 },
//                 {
//                     $unwind: "$student_doc"
//                 },
//                 {
//                     "$project": {
//                         "_id": "$_id",
//                         "student_Name": "$student_doc.first_name",
//                         "student_id": "$student_id",
//                         "fee_types_id": "$fee_types_id",
//                         "fee_type": "$fee_doc.fee_type",
//                         // "totalFee": "$feeMaster_doc.fee_amount",
//                         "payment_mode": "$payment_mode",
//                         "discount": "$discount",
//                         "fine": "$fine",
//                         "current_date": "$current_date",
//                         // "due_date": "$feeMaster_doc.due_date",
//                         "fee_paid": "$fee_paid",
//                         "fee_category": "$feetype.fee_category",
//                         // "fee_amount": "$feemaster.fee_amount",
//                     }
//                 }
//             ])
//             cursor.forEach(function (doc, err) {
//                 assert.equal(null, err);
//                 resultArray.push(doc);
//             }, function () {
//                 var feePaid = 0;
//                 for (i = 0; i < resultArray.length; i++) {
//                     feePaid += parseInt(resultArray[i].fee_paid);
//                 }
//                 db.close();
//                 res.send({
//                     // fee: resultArray,
//                     lastweekfeePaid: feePaid
//                 });
//             });

//         });
//     });


router.route('/feetypes/:school_id/:class_id')
    .get(function (req, res, next) {
        var school_id = req.params.school_id;
        var class_id = req.params.class_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('fee_master').find({ school_id, class_id });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    feetypes: resultArray
                });
            });
        });
    });


router.route('/school_fee_details_for_dashboard/:date/:school_id')
    .get(function (req, res, next) {
        var resultArray = [];
        var school_id = req.params.school_id;
        var feeDetails = [];
        var select_date = new Date(req.params.date);
        var endDate = new Date(select_date);
        endDate.setDate(endDate.getDate() + 1)
        var lastDayDate = new Date(select_date);
        lastDayDate.setDate(lastDayDate.getDate() - 1)
        var presentDate = new Date(select_date);
        presentDate.setDate(presentDate.getDate() + 1)
        var lastweekDate = new Date(select_date);
        lastweekDate.setDate(lastweekDate.getDate() - 6)


        mongo.connect(url, function (err, db) {

            async.waterfall(
                [
                    function getSchoolClasses(next) {
                        //   console.log("getSchoolClassed");
                        db.collection('school_classes').find({
                            school_id
                        }).toArray(function (err, result) {
                            if (err) {
                                next(err, null);
                            }
                            next(null, result);
                        });
                    },
                    function getFeetypesData(result, next) {
                        //  console.log(result);                      
                        var count = 0;
                        var classResult = result;
                        var classResultLength = result.length;
                        if (classResultLength == 0) {
                            next(null, []);
                        } else {
                            //  console.log("In Second step sections")
                            classResult.forEach(function (classData) {
                                var class_id = classData.class_id;
                                // console.log(class_id);
                                db.collection('fee_master').find({
                                    class_id
                                }).toArray(function (err, feeresults) {
                                    count++;
                                    if (err) {
                                        next(err, null);
                                    }
                                    classData.fee = feeresults;

                                    if (classResultLength == count) {

                                        next(null, classResult);
                                        // next(null, classData);
                                    }

                                })
                            })
                        }
                    },
                    function getClassStudents(classResult, next) {
                        var classResultLength = classResult.length;
                        var count = 0;
                        if (classResultLength == 0) {
                            next(null, []);
                        } else {
                            //  console.log("In Second step sections")
                            classResult.forEach(function (classData) {
                                var class_id = classData.class_id;
                                // console.log(class_id);
                                db.collection('students').find({
                                    class_id
                                }).toArray(function (err, studentresults) {
                                    count++;
                                    if (err) {
                                        next(err, null);
                                    }
                                    classData.students = studentresults

                                    if (classResultLength == count) {

                                        next(null, classResult);
                                        // next(null, classData);
                                    }
                                })
                            })
                        }
                    },
                    function getTotalStudentFee(classResult, next) {
                        // console.log(result);                        
                        var data = db.collection('student_fee').find({
                            school_id: school_id
                        }).toArray(function (err, studentFeeResult) {
                            if (err) {
                                next(err, null);
                            }
                            // console.log("total attenance result")
                            // console.log(attResult);
                            next(null, classResult, studentFeeResult);
                        });
                    },
                    function getTodayFeePaid(classResult, studentFeeResult, next) {
                        // console.log(result);                        
                        var cursor = db.collection('student_fee').aggregate([
                            {
                                $match: {
                                    current_date: {
                                        $gte: new Date(select_date.toISOString()),
                                        $lt: new Date(endDate.toISOString())
                                    },
                                    school_id: school_id,
                                },
                            },
                            {
                                $lookup: {
                                    from: "feetypes",
                                    localField: "fee_types_id",
                                    foreignField: "fee_types_id",
                                    as: "fee_doc"
                                }
                            },
                            {
                                $unwind: "$fee_doc"
                            },
                            {
                                $lookup: {
                                    from: "students",
                                    localField: "student_id",
                                    foreignField: "student_id",
                                    as: "student_doc"
                                }
                            },
                            {
                                $unwind: "$student_doc"
                            },
                            {
                                "$project": {
                                    "_id": "$_id",
                                    "student_Name": "$student_doc.first_name",
                                    "student_id": "$student_id",
                                    "fee_types_id": "$fee_types_id",
                                    "fee_type": "$fee_doc.fee_type",
                                    // "totalFee": "$feeMaster_doc.fee_amount",
                                    "payment_mode": "$payment_mode",
                                    "discount": "$discount",
                                    "fine": "$fine",
                                    "current_date": "$current_date",
                                    // "due_date": "$feeMaster_doc.due_date",
                                    "fee_paid": "$fee_paid",
                                    "fee_category": "$feetype.fee_category",
                                    // "fee_amount": "$feemaster.fee_amount",
                                }
                            }
                        ]).toArray(function (err, todayFeeResult) {
                            if (err) {
                                next(err, null);
                            }
                            // console.log("total attenance result")
                            // console.log(attResult);
                            next(null, classResult, studentFeeResult, todayFeeResult);
                        });
                    },
                    function getYesterDayFeePaid(classResult, studentFeeResult, todayFeeResult, next) {
                        // console.log(result);                        
                        var cursor = db.collection('student_fee').aggregate([
                            {
                                $match: {
                                    current_date: {
                                        $gte: new Date(lastDayDate.toISOString()),
                                        $lt: new Date(select_date.toISOString())
                                    },
                                    school_id: school_id,
                                },
                            },
                            {
                                $lookup: {
                                    from: "feetypes",
                                    localField: "fee_types_id",
                                    foreignField: "fee_types_id",
                                    as: "fee_doc"
                                }
                            },
                            {
                                $unwind: "$fee_doc"
                            },
                            {
                                $lookup: {
                                    from: "students",
                                    localField: "student_id",
                                    foreignField: "student_id",
                                    as: "student_doc"
                                }
                            },
                            {
                                $unwind: "$student_doc"
                            },
                            {
                                "$project": {
                                    "_id": "$_id",
                                    "student_Name": "$student_doc.first_name",
                                    "student_id": "$student_id",
                                    "fee_types_id": "$fee_types_id",
                                    "fee_type": "$fee_doc.fee_type",
                                    // "totalFee": "$feeMaster_doc.fee_amount",
                                    "payment_mode": "$payment_mode",
                                    "discount": "$discount",
                                    "fine": "$fine",
                                    "current_date": "$current_date",
                                    // "due_date": "$feeMaster_doc.due_date",
                                    "fee_paid": "$fee_paid",
                                    "fee_category": "$feetype.fee_category",
                                    // "fee_amount": "$feemaster.fee_amount",
                                }
                            }
                        ]).toArray(function (err, yesterdayFeeResult) {
                            if (err) {
                                next(err, null);
                            }
                            // console.log("total attenance result")
                            // console.log(attResult);
                            next(null, classResult, studentFeeResult, todayFeeResult, yesterdayFeeResult);
                        });
                    },
                    function getYesterDayRemaingFee(classResult, studentFeeResult, todayFeeResult, yesterdayFeeResult, next) {
                        // console.log(result);                        
                        var data = db.collection('student_fee').find({
                            current_date: {
                                $lt: new Date(select_date.toISOString())
                            },
                            school_id: school_id,

                        }).toArray(function (err, yesterRemaingFeeResult) {
                            if (err) {
                                next(err, null);
                            }
                            // console.log("total attenance result")
                            // console.log(attResult);
                            next(null, classResult, studentFeeResult, todayFeeResult, yesterdayFeeResult, yesterRemaingFeeResult);
                        });
                    },
                    function getLastWeekFeePaid(classResult, studentFeeResult, todayFeeResult, yesterdayFeeResult, yesterRemaingFeeResult, next) {
                        // console.log(result);                        
                        var cursor = db.collection('student_fee').aggregate([
                            {
                                $match: {
                                    current_date: {
                                        $gte: new Date(lastweekDate.toISOString()),
                                        $lt: new Date(presentDate.toISOString())
                                    },
                                    school_id: school_id,
                                },
                            },
                            {
                                $lookup: {
                                    from: "feetypes",
                                    localField: "fee_types_id",
                                    foreignField: "fee_types_id",
                                    as: "fee_doc"
                                }
                            },
                            {
                                $unwind: "$fee_doc"
                            },
                            {
                                $lookup: {
                                    from: "students",
                                    localField: "student_id",
                                    foreignField: "student_id",
                                    as: "student_doc"
                                }
                            },
                            {
                                $unwind: "$student_doc"
                            },
                            {
                                "$project": {
                                    "_id": "$_id",
                                    "student_Name": "$student_doc.first_name",
                                    "student_id": "$student_id",
                                    "fee_types_id": "$fee_types_id",
                                    "fee_type": "$fee_doc.fee_type",
                                    // "totalFee": "$feeMaster_doc.fee_amount",
                                    "payment_mode": "$payment_mode",
                                    "discount": "$discount",
                                    "fine": "$fine",
                                    "current_date": "$current_date",
                                    // "due_date": "$feeMaster_doc.due_date",
                                    "fee_paid": "$fee_paid",
                                    "fee_category": "$feetype.fee_category",
                                    // "fee_amount": "$feemaster.fee_amount",
                                }
                            }
                        ]).toArray(function (err, lastWeekFeeResult) {
                            if (err) {
                                next(err, null);
                            }
                            // console.log("total attenance result")
                            // console.log(attResult);
                            next(null, classResult, studentFeeResult, todayFeeResult, yesterdayFeeResult, yesterRemaingFeeResult, lastWeekFeeResult);
                        });
                    },
                    function getLastWeekDayRemaingFee(classResult, studentFeeResult, todayFeeResult, yesterdayFeeResult, yesterRemaingFeeResult, lastWeekFeeResult, next) {
                        // console.log(result);                        
                        var data = db.collection('student_fee').find({
                            current_date: {
                                $lt: new Date(lastweekDate.toISOString())
                            },
                            school_id: school_id,

                        }).toArray(function (err, lastWeekRemaingFeeResult) {
                            if (err) {
                                next(err, null);
                            }
                            // console.log("total attenance result")
                            // console.log(attResult);
                            next(null, classResult, studentFeeResult, todayFeeResult, yesterdayFeeResult, yesterRemaingFeeResult, lastWeekFeeResult, lastWeekRemaingFeeResult);
                        });
                    }, function getFinalFeeData(classResult, studentFeeResult, todayFeeResult, yesterdayFeeResult, yesterRemaingFeeResult, lastWeekFeeResult, lastWeekRemaingFeeResult, next) {
                        // console.log("getAttendanceData");
                        //  console.log(attResult);
                        //  console.log(result);
                        var count = 0;

                        /* student Total Fee Paid Details */
                        studentFeePaid = 0;
                        if (studentFeeResult != 0) {
                            var studentFeeLength = studentFeeResult.length;
                            // console.log(studentFeeResult);

                            for (a = 0; a < studentFeeLength; a++) {

                                if (studentFeeResult[a].fee_paid) {
                                    studentFeePaid += parseInt(studentFeeResult[a].fee_paid);
                                }

                            }
                        }
                        // console.log(studentFeePaid);

                        /* Today Total Fee Details */

                        todayfeePaid = dayBefore = dayBeforeTotalCollection = lastWeek = lastWeekTotalCollection = 0;

                        if (todayFeeResult) {
                            if (todayFeeResult.length != 0) {
                                for (t = 0; t < todayFeeResult.length; t++) {
                                    todayfeePaid += parseInt(todayFeeResult[t].fee_paid);
                                }
                            }
                        }
                        //      console.log(todayfeePaid);

                        /* Yesterday Total Fee Details */

                        if (yesterdayFeeResult) {
                            if (yesterdayFeeResult.length != 0) {
                                for (y = 0; y < yesterdayFeeResult.length; y++) {
                                    dayBefore += parseInt(yesterdayFeeResult[y].fee_paid);
                                }
                            }
                        }
                        //   console.log(dayBefore);

                        /*  Total Fee Collection Before today */

                        if (yesterRemaingFeeResult) {
                            if (yesterRemaingFeeResult.length != 0) {
                                for (yr = 0; yr < yesterRemaingFeeResult.length; yr++) {
                                    dayBeforeTotalCollection += parseInt(yesterRemaingFeeResult[yr].fee_paid);
                                }
                            }
                        }
                        //  console.log(dayBeforeTotalCollection);


                        /* Last Week Total Fee Details */

                        if (lastWeekFeeResult) {
                            if (lastWeekFeeResult.length != 0) {
                                for (l = 0; l < lastWeekFeeResult.length; l++) {
                                    lastWeek += parseInt(lastWeekFeeResult[l].fee_paid);
                                }
                            }
                        }
                        // console.log(lastWeek);

                        /*  Total Fee Collection Before Last Week */

                        if (lastWeekRemaingFeeResult) {
                            if (lastWeekRemaingFeeResult.length != 0) {
                                for (lwr = 0; lwr < lastWeekRemaingFeeResult.length; lwr++) {
                                    lastWeekTotalCollection += parseInt(lastWeekRemaingFeeResult[lwr].fee_paid);
                                }
                            }
                        }
                        //  console.log(lastWeekTotalCollection);

                        // var classResult = classResult;
                        var classDataLength = classResult.length;
                        var allClassesTotalAmount = 0;

                        if (classDataLength == 0) {
                            next(null, []);
                        } else {

                            classResult.forEach(function (classData) {
                                classStudents = [];
                                classFeeTypes = [];
                                var feeTypeAmount = 0;
                                feeAmountForAllStudentsInClass = 0;
                                allFeeTypesAmountForStudentInClass = 0;
                                var classesData = classData;

                                var classFeeLength = classData.fee.length;
                                var classFeeData = classData.fee;
                                var classStudentsLength = classData.students.length;
                                var class_id = classData.class_id;
                                var className = classData.name;
                                if (classFeeLength == 0) {
                                    count++;
                                    // console.log("count 0")
                                } else {
                                    if (classStudentsLength != 0) {

                                        for (i = 0; i < classFeeLength; i++) {
                                            //  console.log(classStudentsLength);
                                            feeTypeAmount = parseInt(classFeeData[i].fee_amount);
                                            //  console.log(feeTypeAmount);
                                            feeAmountForAllStudentsInClass = feeTypeAmount * parseInt(classStudentsLength);
                                            allFeeTypesAmountForStudentInClass += parseInt(feeAmountForAllStudentsInClass);

                                        }
                                    }
                                    //  console.log(allTypesAmountForStudentInClass);

                                    count++;
                                }
                                allClassesTotalAmount += allFeeTypesAmountForStudentInClass;

                                if (classDataLength == count) {
                                    todayFeeCollected = todayfeePaid;
                                    // totalFeeCollected = allClassesTotalAmount;
                                    remainingFeeBalance = allClassesTotalAmount - studentFeePaid;
                                    yesterdayFeeCollected = dayBefore;
                                    yesterdayRemainingFeeBalance = allClassesTotalAmount - dayBeforeTotalCollection;
                                    lastweekFeeCollected = lastWeek;
                                    lastweekRemainingFeeBalance = allClassesTotalAmount - lastWeekTotalCollection;

                                    feeDetails.push({
                                        schoolTotalFee: allClassesTotalAmount,
                                        TodayfeePaid: todayfeePaid,
                                        TotalFeeCollectedYet: studentFeePaid,
                                        TodayreaminingFeeBalanceYet: remainingFeeBalance,
                                        yesterdayfeePaid: yesterdayFeeCollected,
                                        yesterdayTotalFeeCollected: dayBeforeTotalCollection,
                                        yesterdayRemainingFeeBalance: yesterdayRemainingFeeBalance,
                                        lastweekfeePaid: lastWeek,
                                        lastweekTotalFeeCollected: lastWeekTotalCollection,
                                        lastweekRemainingFeeBalance: lastweekRemainingFeeBalance



                                    })
                                    next(null, feeDetails);
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
                            feeReports: result1
                        });

                    }
                }
            );
        });
    });

//Add student fees

router.route('/student/feecollect/:school_id/:student_id')
    .post(function (req, res, next) {
        var status = 1;
        var academic_year = "2017-2018";
        var fee_status = "paid";
        var school_id = req.params.school_id;
        var student_id = req.params.student_id;
        var class_id = req.body.class_id;
        var section_id = req.body.section_id;
        var fee_type_id = req.body.fee_type_id;
        var item = {
            school_id: school_id,
            student_id: student_id,
            class_id: class_id,
            section_id: section_id,
            fee_category: req.body.fee_category,
            fee_type: req.body.fee_type,
            fee_amount: req.body.fee_amount,
            fee_fine: req.body.fee_fine,
            fee_discount: req.body.fee_discount,
            fee_total: req.body.fee_total,
            fee_status: fee_status,
            fee_type_id: fee_type_id,
            fee_description: req.body.fee_description,
            fee_due_date: req.body.fee_due_date,
            fee_paid_on: new Date(),
            academic_year: academic_year,
            status: status
        }

        mongo.connect(url, function (err, db) {
            var collection = db.collection('student_fee');
            if (item.school_id == null || item.student_id == null || item.class_id == null || item.section_id == null || item.fee_type_id == null || item.fee_category == null || item.fee_total == null) {
                res.end('null');
            } else {

                db.collection('student_fee').find({ school_id, student_id, fee_type_id, class_id, section_id }).toArray(function (err, items) {

                    if (items.length > 0) {
                        res.end('false');
                    } else {
                        collection.insertOne(item, function (err1, result1) {
                            if (err1) {
                                if (err1.code == 11000) {
                                    res.end('false');
                                }
                                res.end('false');
                            }
                            db.close();
                            res.send('true');
                        });
                    }
                })
            }
        });
    })
    .get(function (req, res, next) {
        var school_id = req.params.school_id;
        var student_id = req.params.student_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('student_fee').find({ school_id, student_id });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    Student_fee: resultArray
                });
            });
        });
    });


// Modified

// Edit for Fee Types

router.route('/edit_fee_types/:fee_types_id')
    .put(function (req, res, next) {
        var myquery = { fee_types_id: req.params.fee_types_id };
        var req_fee_type = req.body.fee_type;

        mongo.connect(url, function (err, db) {
            db.collection('fee_type').update(myquery, {
                $set: {
                    fee_type: req_fee_type,
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

// Delete for Fee Types



router.route('/delete_fee_types/:fee_types_id')
    .delete(function (req, res, next) {
        var myquery = { fee_types_id: req.params.fee_types_id };

        mongo.connect(url, function (err, db) {
            db.collection('fee_type').deleteOne(myquery, function (err, result) {
                assert.equal(null, err);
                if (err) {
                    res.send('false');
                }
                else {
                    mongo.connect(url, function (err, db) {
                        db.collection('fee_master').deleteMany(myquery, function (err, result) {
                            assert.equal(null, err);
                            if (err) {
                                res.send('false');
                            }
                            else {
                                mongo.connect(url, function (err, db) {
                                    db.collection('student_fee').deleteMany(myquery, function (err, result) {
                                        assert.equal(null, err);
                                        if (err) {
                                            res.send('false');
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
                db.close();
                res.send('true');
            });
        });
    });



router.route('/edit_fee_terms/:fee_term_id')
    .put(function (req, res, next) {
        var myquery = { fee_term_id: req.params.fee_term_id };
        var fee_term = req.body.fee_term;

        mongo.connect(url, function (err, db) {
            db.collection('fee_term').update(myquery, {
                $set: {
                    fee_term: fee_term,
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


// Edit for Fee Collection

router.route('/edit_fee_master/:fee_master_id')
    .put(function (req, res, next) {
        var myquery = { fee_master_id: req.params.fee_master_id };
        var req_fee_amount = req.body.fee_amount;
        var req_fee_type = req.body.fee_type;


        mongo.connect(url, function (err, db) {
            db.collection('fee_master').update(myquery, {
                $set: {
                    fee_amount: req_fee_amount,
                    fee_type: req_fee_type,
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


router.route('/delete_fee_master/:fee_master_id')
    .delete(function (req, res, next) {
        var myquery = { fee_master_id: req.params.fee_master_id };

        mongo.connect(url, function (err, db) {
            db.collection('fee_master').deleteOne(myquery, function (err, result) {
                assert.equal(null, err);
                if (err) {
                    res.send('false');
                }
                // else {
                //     mongo.connect(url, function (err, db) {
                //         db.collection('student_fee').deleteMany(myquery, function (err, result) {
                //             assert.equal(null, err);
                //             if (err) {
                //                 res.send('false');
                //             }
                //         });
                //     });
                // }
                db.close();
                res.send('true');
            });
        });
    });


router.route('/edit_fee_collection/:student_fee_id')
    .put(function (req, res, next) {
        var myquery = { student_fee_id: req.params.student_fee_id };
        var req_payment_mode = req.body.payment_mode;
        var req_fee_type = req.body.fee_type;
        var req_discount = req.body.discount;
        var req_fine = req.body.fine;


        mongo.connect(url, function (err, db) {
            db.collection('student_fee').update(myquery, {
                $set: {
                    payment_mode: req_payment_mode,
                    fee_type: req_fee_type,
                    discount: req_discount,
                    fine: req_fine
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


router.route('/delete_fee_collection/:student_fee_id')
    .delete(function (req, res, next) {
        var myquery = { student_fee_id: req.params.student_fee_id };

        mongo.connect(url, function (err, db) {
            db.collection('student_fee').deleteOne(myquery, function (err, result) {
                assert.equal(null, err);
                if (err) {
                    res.send('false');
                }
                db.close();
                res.send('true');
            });
        });
    });



router.route('/section_student_fee_paid_details/:section_id/:fee_types_id/:fee_term_id')
    .get(function (req, res, next) {
        var resultArray = [];
        // var school_id = req.params.school_id;
        // var class_id = req.params.class_id;
        var section_id = req.params.section_id;
        var fee_term_id = req.params.fee_term_id;
        var splited = section_id.split("-");
        var class_id = splited[0] + '-' + splited[1] + '-' + splited[2] + '-' + splited[3];
        var fee_types_id = req.params.fee_types_id;
        var feeDetails = studentFeeDetails = [];

        mongo.connect(url, function (err, db) {

            async.waterfall(
                [
                    function getstudents(next) {
                        //   console.log("getSchoolClassed");
                        db.collection('students').find({
                            section_id
                        }).toArray(function (err, result) {
                            if (err) {
                                next(err, null);
                            }
                            next(null, result);
                        });
                    },
                    function getStudentsData(result, next) {
                        //   console.log("getSectionsData");                      
                        var count = 0;
                        var studentResult = result;
                        var studentResultLength = result.length;
                        if (studentResultLength == 0) {
                            next(null, []);
                        } else {
                            //  console.log("In Second step sections")
                            studentResult.forEach(function (studentData) {
                                var student_id = studentData.student_id;
                                // console.log(student_id);
                                db.collection('student_fee').find({
                                    student_id: student_id, fee_types_id: fee_types_id, fee_term_id: fee_term_id
                                }).sort({ 'student_id': 1 }).toArray(function (err, results) {
                                    count++;
                                    if (err) {
                                        next(err, null);
                                    }
                                    studentData.fee = results
                                    // console.log(studentData.fee);

                                    if (studentResultLength == count) {

                                        next(null, studentResult);
                                        // next(null, classData);
                                    }

                                })
                            })
                        }
                    },
                    function getFeeTypesByClassId(result, next) {
                        //   console.log("getTotalSchoolAttendance");
                        // console.log(result);                        
                        var data = db.collection('fee_master').find({
                            fee_types_id: fee_types_id,
                            fee_term_id: fee_term_id,
                            class_id: class_id
                        }).toArray(function (err, feeResult) {
                            if (err) {
                                next(err, null);
                            }
                            // console.log("total attenance result")
                            // console.log(attResult);
                            next(null, result, feeResult);
                        });
                    }, function getStudentFeeDetails(result, feeResult, next) {
                        // console.log("getAttendanceData");
                        //  console.log(result);
                        //  console.log(feeResult);
                        var count = 0;

                        var studentResult = result;
                        var studentDataLength = result.length;
                        if (feeResult.length == 0) {
                            res.end("false");
                        }
                        else if (feeResult.length >= 1) {
                            if (studentDataLength == 0) {
                                next(null, []);
                            } else {
                                // console.log("In fourth step sections attendance")

                                studentResult.forEach(function (studentData) {

                                    var feeLength = studentData.fee.length;
                                    var studentFee = studentData.fee;
                                    var studentId = studentData.student_id;
                                    var studentName = studentData.first_name;
                                    totalfee = feeResult[0].fee_amount;
                                    due_date = feeResult[0].due_date;
                                    var balance = 0;
                                    paidAmount = 0;
                                    TotalDiscount = TotalFine = 0;
                                    fine = discount = 0;
                                    if (feeLength == 0) {
                                        count++;
                                        balance = totalfee - paidAmount + fine - discount;
                                        // console.log("count 0")
                                    } else {

                                        for (var i = 0; i < feeLength; i++) {

                                            if (studentFee[i].fee_types_id == feeResult[0].fee_types_id && studentFee[i].fee_term_id == feeResult[0].fee_term_id) {

                                                feePaid = studentFee[i].fee_paid;
                                                feePaid = parseInt(feePaid);
                                                fine = studentFee[i].fine;
                                                fine = parseInt(fine);
                                                discount = studentFee[i].discount;
                                                discount = parseInt(discount);
                                                //console.log(typeof (feePaid) + " " + feePaid);
                                                paidAmount += feePaid;
                                                TotalDiscount += discount;
                                                TotalFine += fine;
                                            }
                                        }

                                        balance = totalfee - paidAmount - TotalDiscount + TotalFine;
                                        count++;
                                    }
                                    // console.log(studentName);
                                    //  console.log("totalfee:" + totalfee + " paid:" + paidAmount + " balance:" + balance);
                                    studentFeeDetails.push({ "studentName": studentName, "totalFee": totalfee, "paidAmount": paidAmount, "fine": TotalFine, "Discount": TotalDiscount, "Balance": balance, "DueDate": due_date })

                                    //  feeDetails.push({"studentfee":studentFeeDetails});

                                    if (studentDataLength == count) {
                                        next(null, studentFeeDetails);
                                    }
                                });
                            }
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
                            studentFee: result1
                        });

                    }
                }
            );
        });
    });




module.exports = router;