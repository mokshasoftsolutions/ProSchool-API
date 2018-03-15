// flow
var express = require("express");
var config = require("../config.json");
var bodyParser = require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSD7F94";
var mongo = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");
var assert = require('assert');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var forEach = require('async-foreach').forEach;
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

router.route('/formative_assessment/:school_id')
    .post(function (req, res, next) {
        var school_id = req.params.school_id;
        var assessment_type = req.body.assessment_type;
        var max_marks = req.body.max_marks;
        var f_number = parseInt(req.body.number);
        //  var f_ind_number = parseInt(req.body.f_ind_number);
        var code = req.body.code;

        var assessments = [];
        var formativeAssessment = {};

        for (i = 0; i < f_number; i++) {
            code = code;
            FA_code = code + '-' + parseInt(i + 1);

            if (i == 0) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_1 = FA_code;
            }
            else if (i == 1) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_2 = FA_code;
            }
            else if (i == 2) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_3 = FA_code;
            }
            else if (i == 3) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_4 = FA_code;
            }
            else if (i == 4) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_5 = FA_code;
            }
            else if (i == 5) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_6 = FA_code;
            }
            else if (i == 6) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_7 = FA_code;
            }
            else if (i == 7) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_8 = FA_code;
            }
            else if (i == 8) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_9 = FA_code;
            }
            else if (i == 9) {
                assessments.push({ "FA": FA_code });
                formativeAssessment.FA_10 = FA_code;
            }
            // assessments.push({ "FA": FA_code });
            // fa_array = [];

        }


        var item = {
            assessment_id: 'getauto',
            school_id: school_id,
            assessment_type: assessment_type,
            max_marks: max_marks,
            f_number: f_number,
            code: code,
            assessment: assessments,
            Formative_Assessment: formativeAssessment
        }

        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'assessment_pattern', function (err, autoIndex) {

                var data = db.collection('assessment_pattern').find({
                    school_id: item.school_id
                }).count(function (e, triggerCount) {

                    if (triggerCount > 0) {
                        res.send('false');
                    } else {
                        var collection = db.collection('assessment_pattern');
                        collection.ensureIndex({
                            "assessment_id": 1,
                        }, {
                                unique: true
                            }, function (err, result) {
                                if (item.assessment_type == null) {
                                    res.end('null');
                                } else {
                                    collection.insertOne(item, function (err, result) {
                                        if (err) {
                                            if (err.code == 11000) {
                                                console.log(err);
                                                res.end('false');
                                            }
                                            res.end('false');
                                        }
                                        collection.update({
                                            _id: item._id
                                        }, {
                                                $set: {
                                                    assessment_id: 'Assessment-' + autoIndex
                                                },
                                            }, function (err, result) {
                                                db.close();
                                                res.end('true');
                                            });
                                    });
                                }
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
            var cursor = db.collection('assessment_pattern').find({ school_id });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    assessment: resultArray
                });
            });
        });
    });

router.route('/formative_assessment_innerloop/:assessment_id/:value/:number/:school_id')
    .post(function (req, res, next) {

        var assessment_id = req.params.assessment_id;
        var value = req.params.value;

        var item = {
            assessment_inner_id: 'getauto',
            assessment_id: assessment_id,
            school_id:req.params.school_id,
            code: value,
            assMarks: req.body.assMarks,
            f_number: req.params.number,
            //  code: code,
        };

        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'assessment_pattern_inner', function (err, autoIndex) {
                var data = db.collection('assessment_pattern_inner').find({
                    assessment_id: item.assessment_id,
                    code: item.code
                }).count(function (e, triggerCount) {

                    if (triggerCount > 0) {
                        res.send('false');
                    } else {
                        var collection = db.collection('assessment_pattern_inner');

                        collection.ensureIndex({
                            "assessment_inner_id": 1,
                        }, {
                                unique: true
                            }, function (err, result) {
                                if (item.assessment_id == null || item.assessment_id == "" || item.f_number == "" || item.assMarks == "undefined" || item.assMarks == "" || item.assessment_id == "undefined" || item.f_number == "undefined") {
                                    res.end('null');
                                } else {
                                    collection.insertOne(item, function (err, result) {
                                        if (err) {
                                            if (err.code == 11000) {
                                                console.log(err);
                                                res.end('false');
                                            }
                                            res.end('false');
                                        }
                                        collection.update({
                                            _id: item._id
                                        }, {
                                                $set: {
                                                    assessment_inner_id: 'Assessment-Inner-' + autoIndex
                                                },
                                                // $push: {
                                                //     Formative_Assessment
                                                // }
                                            }, function (err, result) {
                                                db.close();
                                                res.end('true');
                                            });
                                    });
                                }
                            });
                    }
                });
            });
        });
    })

router.route('/formative_assessment_innerloop/:code/:school_id')
    .get(function (req, res, next) {
        var school_id = req.params.school_id;
        var code = req.params.code;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('assessment_pattern_inner').find({ school_id: school_id, code: code });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    assessment: resultArray
                });
            });
        });
    });


router.route('/summative_assessment/:school_id')
    .post(function (req, res, next) {
        var school_id = req.params.school_id;
        var assessment_type = req.body.assessment_type;
        var max_marks = req.body.max_marks;
        var f_number = parseInt(req.body.number);
        //  var f_ind_number = parseInt(req.body.f_ind_number);
        var code = req.body.code;

        var Summative_assessments = [];
        var summativeAssessment = {};

        for (i = 0; i < f_number; i++) {
            code = code;
            SA_code = code + '-' + parseInt(i + 1);

            if (i == 0) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_1 = SA_code;
            }
            else if (i == 1) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_2 = SA_code;
            }
            else if (i == 2) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_3 = SA_code;
            }
            else if (i == 3) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_4 = SA_code;
            }
            else if (i == 4) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_5 = SA_code;
            }
            else if (i == 5) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_6 = SA_code;
            }
            else if (i == 6) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_7 = SA_code;
            }
            else if (i == 7) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_8 = SA_code;
            }
            else if (i == 8) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_9 = SA_code;
            }
            else if (i == 9) {
                Summative_assessments.push({ "SA": SA_code });
                summativeAssessment.SA_10 = SA_code;
            }
            // assessments.push({ "FA": FA_code });
            // fa_array = [];

        }

        var item = {
            summative_assessment_id: 'getauto',
            school_id: school_id,
            assessment_type: assessment_type,
            max_marks: max_marks,
            f_number: f_number,
            code: code,
            Summative_assessments: Summative_assessments,
            summativeAssessment: summativeAssessment
        }

        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'summative_assessment', function (err, autoIndex) {

                var data = db.collection('summative_assessment').find({
                    school_id: item.school_id
                }).count(function (e, triggerCount) {

                    if (triggerCount > 0) {
                        res.send('false');
                    } else {
                        var collection = db.collection('summative_assessment');
                        collection.ensureIndex({
                            "summative_assessment_id": 1,
                        }, {
                                unique: true
                            }, function (err, result) {
                                if (item.assessment_type == null) {
                                    res.end('null');
                                } else {
                                    collection.insertOne(item, function (err, result) {
                                        if (err) {
                                            if (err.code == 11000) {
                                                console.log(err);
                                                res.end('false');
                                            }
                                            res.end('false');
                                        }
                                        collection.update({
                                            _id: item._id
                                        }, {
                                                $set: {
                                                    summative_assessment_id: 'summative-Assessment-' + autoIndex
                                                },
                                            }, function (err, result) {
                                                db.close();
                                                res.end('true');
                                            });
                                    });
                                }
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
            var cursor = db.collection('summative_assessment').find({ school_id });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    assessment: resultArray
                });
            });
        });
    });

router.route('/summative_assessment_innerloop/:summative_assessment_id/:value/:number')
    .post(function (req, res, next) {

        var summative_assessment_id = req.params.summative_assessment_id;
        var value = req.params.value;

        var item = {
            summative_assessment_inner_id: 'getauto',
            summative_assessment_id: summative_assessment_id,
            code: value,
            assMarks: req.body.assMarks,
            f_number: req.params.number,
            //  code: code,
        };

        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'summative_assessment_pattern_inner', function (err, autoIndex) {
                var data = db.collection('summative_assessment_pattern_inner').find({
                    summative_assessment_id: item.summative_assessment_id,
                    code: item.code
                }).count(function (e, triggerCount) {

                    if (triggerCount > 0) {
                        res.send('false');
                    } else {
                        var collection = db.collection('summative_assessment_pattern_inner');

                        collection.ensureIndex({
                            "summative_assessment_inner_id": 1,
                        }, {
                                unique: true
                            }, function (err, result) {
                                if (item.summative_assessment_id == null || item.summative_assessment_id == "" || item.f_number == "" || item.assMarks == "undefined" || item.assMarks == "" || item.summative_assessment_id == "undefined" || item.f_number == "undefined") {
                                    res.end('null');
                                } else {
                                    collection.insertOne(item, function (err, result) {
                                        if (err) {
                                            if (err.code == 11000) {
                                                console.log(err);
                                                res.end('false');
                                            }
                                            res.end('false');
                                        }
                                        collection.update({
                                            _id: item._id
                                        }, {
                                                $set: {
                                                    summative_assessment_inner_id: 'summative-Assessment-Inner-' + autoIndex
                                                },
                                                // $push: {
                                                //     Formative_Assessment
                                                // }
                                            }, function (err, result) {
                                                db.close();
                                                res.end('true');
                                            });
                                    });
                                }
                            });
                    }
                });
            });
        });
    })

module.exports = router;