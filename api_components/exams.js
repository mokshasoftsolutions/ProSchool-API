// flow
var express = require("express");
var config = require("../config.json");
var bodyParser = require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSD7F94";
var mongo = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");
var assert = require('assert');
var async = require('async');
var waterfall = require('async-waterfall');
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

// Add Exams

router.route('/exams/:exam_sch_id')
    .post(function (req, res, next) {
        var status = 1;
        var subject_id = req.body.subject_id;
        var exam_title = req.params.exam_sch_id;
        var splited = subject_id.split("-");
        var section_id = splited[0] + '-' + splited[1] + '-' + splited[2] + '-' + splited[3] + '-' + splited[4] + '-' + splited[5];
        var ind_ass = req.body.ind_ass;
        var Exam_dates = req.body.Exam_dates;
        var Start_times = req.body.Start_times;
        var End_times = req.body.End_times;
        var exams = [];

        for (i = 0; i < ind_ass.length; i++) {
            ind_assessment = ind_ass[i].FA;
            exam_date = Exam_dates[i];
            start_time = Start_times[i];
            end_time = End_times[i];
            n = i + 1;

            var exam = {};
            exam["Assessment"] = ind_assessment;
            exam["Exam_date"] = exam_date;
            exam["Start_time"] = start_time;
            exam["End_time"] = end_time;
            exams.push(exam); // ["Paper"+n] = exam;
        }

        var item = {
            exam_paper_id: 'getauto',
            subject_id: subject_id,
            section_id: section_id,
            exam_title: exam_title,
            exams: exams,
            status: status,
        };
        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'exams', function (err, autoIndex) {
                var collection = db.collection('exams');
                collection.ensureIndex({
                    "exam_paper_id": 1,
                }, {
                        unique: true
                    }, function (err, result) {
                        if (item.subject_id == null || item.exam_title == null || item.exams == null) {
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
                                            exam_paper_id: section_id + '-' + exam_title + '-EXM-' + autoIndex
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

router.route('/exams/:exam_title/:section_id')
    .get(function (req, res, next) {

        var exam_title = req.params.exam_title;
        var section_id = req.params.section_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            // var cursor = db.collection('exams').find({exam_sch_id});
            var cursor = db.collection('exams').aggregate([{
                $match: {
                    exam_title: exam_title,
                    section_id: section_id,
                    status: 1
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject_id",
                    foreignField: "subject_id",
                    as: "subjects"
                }
            },
            {
                $unwind: "$subjects"
            },

            {
                $group: {
                    _id: '$_id',

                    // "exam_paper_id": { "$first": "$exam_paper_id" },
                    "subject_id": { "$first": "$subject_id" },
                    // "exam_title": { "$first": "$exam_title" },
                    "exams": { "$first": "$exams" },
                    "subject_name": { "$first": "$subjects.name" },
                    // "section_id": { "$first": "$section_id" }
                }
            }
            ]).sort({ subject_id: 1 });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    exams: resultArray,
                });
            });
        });
    });

router.route('/assessment_marksbulk_eval/:exam_title/:section_id/:subjectId')
    .post(function (req, res, next) {

        var subjectId = req.params.subjectId;
        var section_id = req.params.section_id;
        var exam_title = req.params.exam_title;
        var splited = section_id.split("-");
        var school_id = splited[0] + '-' + splited[1];

        var assessmentMarks = [];

        var marksArray = req.body.studentsMarks;
        var assessment_id = marksArray[0].assMarks[0].assessment_id;

        var marksArrayLength = marksArray.length;
        var studentAssessmentMarks = [];


        for (i = 0; i < marksArrayLength; i++) {

            studentId = marksArray[i].student_id;
            assMarks = marksArray[i].assMarks;
            assMarksLength = assMarks.length;
            var Marks = [];
            var Total_maxMarks = 0;
            var Total_marks = 0;

            for (j = 0; j < assMarksLength; j++) {

                marks = marksArray[i].marks[j];
                innerCode = assMarks[j].FA;
                ind_maxMarks = assMarks[j].maxMarks;
                var ind_marks = {};
                ind_marks["Assessment"] = innerCode;
                ind_marks["marks"] = marks;
                Total_marks += parseInt(marks);
                Total_maxMarks += parseInt(ind_maxMarks);
                Marks.push(ind_marks);
                percentage = (parseInt(Total_marks) / parseInt(Total_maxMarks)) * parseInt(100);
            }

            if (percentage > 90 && percentage <= 100) {
                grade = "A1";
            } else if (percentage > 80 && percentage <= 90) {
                grade = "A2";
            } else if (percentage > 70 && percentage <= 80) {
                grade = "B1";
            } else if (percentage > 60 && percentage <= 70) {
                grade = "B2";
            } else if (percentage > 50 && percentage <= 60) {
                grade = "C1";
            } else if (percentage > 40 && percentage <= 50) {
                grade = "C2";
            } else if (percentage > 34 && percentage <= 40) {
                grade = "D";
            } else {
                grade = "E";
            };

            studentAssessmentMarks.push({ student_id: studentId, Marks: Marks, Total_marks: Total_marks, Total_maxMarks: Total_maxMarks, grade: grade })
        }
        //  console.log(studentAssessmentMarks);

        if (exam_title == null || section_id == null) {
            res.end('null');
        } else {
            var count = 0;
            if (studentAssessmentMarks.length > 0) {
                forEach(studentAssessmentMarks, function (key, value) {

                    var item = {
                        assessment_result_id: '',
                        school_id: school_id,
                        student_id: key.student_id,
                        section_id: section_id,
                        subjectId: subjectId,
                        exam_title: exam_title,
                        assessment_id: assessment_id,
                        maxMarks: key.Total_maxMarks,
                        Marks: key.Marks,
                        Total_marks: key.Total_marks,
                        Grade: grade,
                    };

                    mongo.connect(url, function (err, db) {
                        autoIncrement.getNextSequence(db, 'assessment_evaluation', function (err, autoIndex) {
                            var data = db.collection('assessment_evaluation').find({
                                section_id: section_id,
                                exam_title: exam_title,
                                subjectId: subjectId,
                                student_id: item.student_id
                            }).count(function (e, triggerCount) {

                                if (triggerCount > 0) {
                                    count++;
                                    if (count == studentAssessmentMarks.length) {
                                        res.send('false');
                                    }
                                } else {
                                    var collection = db.collection('assessment_evaluation');
                                    collection.ensureIndex({
                                        "assessment_result_id": 1,
                                    }, {
                                            unique: true
                                        }, function (err, result) {
                                            if (item.section_id == null || item.exam_title == null || item.Marks == null || item.subjectId == null) {
                                                res.end('null');
                                            } else {
                                                item.assessment_result_id = item.school_id + '-' + item.assessment_id + '-EVAL-' + autoIndex;
                                                collection.insertOne(item, function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                        if (err.code == 11000) {

                                                            res.end('false');
                                                        }
                                                        res.end('false');
                                                    }
                                                    count++;
                                                    db.close();

                                                    if (count == studentAssessmentMarks.length) {
                                                        res.end('true');
                                                    }

                                                });
                                            }
                                        });
                                }
                            });
                        });
                    });
                });
            } else {
                res.end('false');
            }
        }
    })

router.route('/assessment_marks_by_section_id/:exam_title/:section_id')
    .get(function (req, res, next) {
        var resultArray = [];
        var section_id = req.params.section_id;
        var exam_title = req.params.exam_title;
        var studentsMarks = [];


        mongo.connect(url, function (err, db) {

            async.waterfall(
                [

                    function getSectionStudents(next) {
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
                    function getsectionStudentsData(result, next) {
                        //   console.log("getSectionsData");                      
                        var count = 0;
                        var studentsResult = result;
                        var studentsResultLength = result.length;
                        if (studentsResultLength == 0) {
                            next(null, []);
                        } else {
                            //  console.log("In Second step sections")
                            studentsResult.forEach(function (studentData) {
                                var studentId = studentData.student_id;
                                db.collection('assessment_evaluation').aggregate([
                                    {
                                        $match: {
                                            exam_title: exam_title,
                                            section_id: section_id,
                                            student_id: studentId
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "subjects",
                                            localField: "subjectId",
                                            foreignField: "subject_id",
                                            as: "subject_doc"
                                        }
                                    },
                                    {
                                        $unwind: "$subject_doc"
                                    },
                                    {
                                        $project:
                                            {
                                                section_id: "$section_id",
                                                subject_id: "$subjectId",
                                                subject: "$subject_doc.name",
                                                exam_title: "$exam_title",
                                                assessment_id: "$assessment_id",
                                                maxMarks: "$maxMarks",
                                                marks: "$Marks",
                                                totalMarks: "$Total_marks",
                                                grade: "$Grade",

                                            }
                                    }
                                ]).toArray(function (err, results) {
                                    count++;
                                    if (err) {
                                        next(err, null);
                                    }
                                    studentData.assessments = results

                                    if (studentsResultLength == count) {

                                        next(null, studentsResult);
                                        // next(null, classData);
                                    }

                                })
                            })
                        }
                    }, function getAttendanceData(result, next) {

                        // console.log(result);
                        var count = 0;

                        var studentResult = result;
                        var studentDataLength = result.length;
                        //  console.log(sectionDataLength);
                        if (studentDataLength == 0) {
                            next(null, []);
                        } else {
                            // console.log("In fourth step sections attendance")
                            studentResult.forEach(function (studentData) {
                                sectionAttendence = [];
                                attendenceClass = [];

                                var studentsData = studentData;

                                var assessmentsDataLength = studentData.assessments.length;
                                var student_id = studentData.student_id;
                                var studentName = studentData.first_name + " " + studentData.last_name;
                                var roll_no = studentData.roll_no;


                                // if (assessmentsDataLength == 0) {
                                //     count++;
                                //     // console.log("count 0")
                                // } else {

                                //     count++;
                                // }
                                count++;
                                studentsMarks.push({ student_id: student_id, student_name: studentName, roll_no: roll_no, assessments: studentData.assessments })



                                // classAttendance.push(attendanceSection);

                                if (studentDataLength == count) {
                                    next(null, studentsMarks);
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


router.route('/all_assessment_marks_by_section_id/:section_id')
    .get(function (req, res, next) {
        var resultArray = [];
        var section_id = req.params.section_id;
        var splited = section_id.split("-");
        var school_id = splited[0] + '-' + splited[1];
        var studentsMarks = [];


        mongo.connect(url, function (err, db) {

            async.waterfall(
                [

                    function getSectionStudents(next) {
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
                    function getsectionStudentsData(result, next) {
                        //   console.log("getSectionsData");                      
                        var count = 0;
                        var studentsResult = result;
                        var studentsResultLength = result.length;
                        if (studentsResultLength == 0) {
                            next(null, []);
                        } else {
                            //  console.log("In Second step sections")
                            studentsResult.forEach(function (studentData) {
                                var studentId = studentData.student_id;
                                db.collection('assessment_evaluation').aggregate([
                                    {
                                        $match: {
                                            student_id: studentId
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "subjects",
                                            localField: "subjectId",
                                            foreignField: "subject_id",
                                            as: "subject_doc"
                                        }
                                    },
                                    {
                                        $unwind: "$subject_doc"
                                    },
                                    {
                                        $project:
                                            {
                                                section_id: "$section_id",
                                                subject_id: "$subjectId",
                                                subject: "$subject_doc.name",
                                                exam_title: "$exam_title",
                                                assessment_id: "$assessment_id",
                                                maxMarks: "$maxMarks",
                                                marks: "$Marks",
                                                totalMarks: "$Total_marks",
                                                grade: "$Grade",
                                            }
                                    }
                                ]).sort({ subject_id: 1 }).toArray(function (err, results) {
                                    count++;
                                    if (err) {
                                        next(err, null);
                                    }
                                    studentData.assessments = results

                                    if (studentsResultLength == count) {

                                        next(null, studentsResult);
                                        // next(null, classData);
                                    }

                                })
                            })
                        }
                    },
                    function getSchoolExamSchedules(result, next) {

                        var data = db.collection('exam_schedule').find({
                            school_id: school_id
                        }).toArray(function (err, scheduleResult) {
                            if (err) {
                                next(err, null);
                            }
                            // console.log("total attenance result")
                            // console.log(attResult);
                            next(null, result, scheduleResult);
                        });
                    }, function getAttendanceData(result, scheduleResult, next) {
                        // console.log(scheduleResult);
                        //  console.log(result);

                        var count = 0;

                        var studentResult = result;
                        var studentDataLength = result.length;
                        var scheduleArray = scheduleResult;
                        var scheduleArrayLength = scheduleArray.length;

                        if (studentDataLength == 0) {
                            next(null, []);
                        } else {

                            studentResult.forEach(function (studentData) {

                                var studentsData = studentData;

                                var assessmentsDataLength = studentData.assessments.length;
                                var assessments = studentData.assessments;
                                var student_id = studentData.student_id;
                                var studentName = studentData.first_name + " " + studentData.last_name;
                                var roll_no = studentData.roll_no;


                                if (assessmentsDataLength == 0) {
                                    count++;

                                } else {
                                    var exam_marks = [];

                                    for (i = 0; i < scheduleArrayLength; i++) {

                                        var subjects = [];
                                        examTitle = scheduleArray[i].exam_title;
                                        var totalAllMarks = 0;
                                        var totalMaxMarks = 0;
                                        for (j = 0; j < assessmentsDataLength; j++) {

                                            if (examTitle == assessments[j].exam_title) {
                                                //  console.log("hema");
                                                totalMarks = parseInt(assessments[j].totalMarks);
                                                subject_name = assessments[j].subject;
                                                max_marks = assessments[j].maxMarks;
                                                totalAllMarks += totalMarks;
                                                totalMaxMarks += parseInt(max_marks);
                                                percentage = (parseInt(totalAllMarks) / parseInt(totalMaxMarks)) * parseInt(100);
                                                if (percentage > 90 && percentage <= 100) {
                                                    grade = "A1";
                                                } else if (percentage > 80 && percentage <= 90) {
                                                    grade = "A2";
                                                } else if (percentage > 70 && percentage <= 80) {
                                                    grade = "B1";
                                                } else if (percentage > 60 && percentage <= 70) {
                                                    grade = "B2";
                                                } else if (percentage > 50 && percentage <= 60) {
                                                    grade = "C1";
                                                } else if (percentage > 40 && percentage <= 50) {
                                                    grade = "C2";
                                                } else if (percentage > 34 && percentage <= 40) {
                                                    grade = "D";
                                                } else {
                                                    grade = "E";
                                                };

                                                subjects.push({ subject_name: subject_name, max_marks: max_marks, total_marks: totalMarks, totalAllMarks: totalAllMarks, grade: grade })

                                            }


                                        }
                                        exam_marks.push({ exam_title: examTitle, subjects: subjects, totalAllMarks: totalAllMarks, totalMaxMarks: totalMaxMarks })


                                    }

                                    count++;
                                }
                                // count++;
                                studentsMarks.push({ student_id: student_id, student_name: studentName, exam_marks: exam_marks })



                                // classAttendance.push(attendanceSection);

                                if (studentDataLength == count) {
                                    next(null, studentsMarks);
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


router.route('/all_assessment_marks_by_student_id/:student_id')
    .get(function (req, res, next) {
        var resultArray = [];
        var student_id = req.params.student_id;
        var splited = student_id.split("-");
        var school_id = splited[0] + '-' + splited[1];
        var studentsMarks = [];


        mongo.connect(url, function (err, db) {

            async.waterfall(
                [

                    function getsectionStudentsData(next) {

                        db.collection('assessment_evaluation').aggregate([
                            {
                                $match: {
                                    student_id: student_id
                                },
                            },
                            {
                                $lookup: {
                                    from: "subjects",
                                    localField: "subjectId",
                                    foreignField: "subject_id",
                                    as: "subject_doc"
                                }
                            },
                            {
                                $unwind: "$subject_doc"
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
                                $project:
                                    {
                                        section_id: "$section_id",
                                        student_id: "$student_id",
                                        student_name: "$student_doc.first_name",
                                        subject_id: "$subjectId",
                                        subject: "$subject_doc.name",
                                        exam_title: "$exam_title",
                                        assessment_id: "$assessment_id",
                                        maxMarks: "$maxMarks",
                                        marks: "$Marks",
                                        totalMarks: "$Total_marks"
                                    }
                            }
                        ]).sort({ subject_id: 1 }).toArray(function (err, results) {

                            if (err) {
                                next(err, null);
                            }

                            next(null, results);

                        })

                    },
                    function getSchoolExamSchedules(results, next) {
                        //  console.log(results);

                        var data = db.collection('exam_schedule').find({
                            school_id: school_id
                        }).toArray(function (err, scheduleResult) {
                            if (err) {
                                next(err, null);
                            }

                            next(null, results, scheduleResult);
                        });
                    }, function getAttendanceData(results, scheduleResult, next) {
                        // console.log(scheduleResult);
                        //  console.log(results);

                        var count = 0;

                        var assessmentResult = results;
                        var assessmentResultLength = results.length;
                        var scheduleArray = scheduleResult;
                        var scheduleArrayLength = scheduleArray.length;
                        var student_name = assessmentResult[0].student_id;
                        var student_name = assessmentResult[0].student_name;
                        var exam_marks = [];

                        if (scheduleArrayLength == 0) {
                            next(null, []);
                        } else {

                            scheduleArray.forEach(function (scheduleData) {

                                var schedulesData = scheduleData;

                                var exam_title = scheduleData.exam_title;


                                var subjects = [];
                                for (i = 0; i < assessmentResultLength; i++) {


                                    examTitle = assessmentResult[i].exam_title;
                                    var totalAllMarks = 0;


                                    if (exam_title == examTitle) {

                                        totalMarks = parseInt(assessmentResult[i].totalMarks);
                                        subject_name = assessmentResult[i].subject;
                                        max_marks = assessmentResult[i].maxMarks;
                                        totalAllMarks += totalMarks;

                                        subjects.push({ subject_name: subject_name, max_marks: max_marks, total_marks: totalMarks })

                                    }
                                    console.log(subjects);

                                }
                                exam_marks.push({ exam_title: exam_title, subjects: subjects, totalAllMarks: totalAllMarks })


                                count++;
                                // classAttendance.push(attendanceSection);

                                if (scheduleArrayLength == count) {

                                    studentsMarks.push({ student_id: student_id, student_name: student_name, exam_marks: exam_marks })
                                    next(null, studentsMarks);
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


router.route('/exams/:exam_sch_id')
    .get(function (req, res, next) {

        var exam_sch_id = req.params.exam_sch_id;
        var resultArray = [];
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('exams').find({ exam_sch_id });
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    resultArray
                });
            });
        });
    });





// Exams papers bulk upload via excel sheet


var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

router.route('/bulk_upload_exampapers/:subject_id/:exam_sch_id/:class_id/:section_id')
    .post(function (req, res, next) {
        var subject_id = req.params.subject_id;
        var exam_sch_id = req.params.exam_sch_id;
        var class_id = req.params.class_id;
        var section_id = req.params.section_id;
        var status = 1;
        var exceltojson;
        upload(req, res, function (err) {
            if (err) {
                res.json({ error_code: 1, err_desc: err });
                return;
            }
            /** Multer gives us file info in req.file object */
            if (!req.file) {
                res.json({ error_code: 1, err_desc: "No file passed" });
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, function (err, result) {
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }
                    res.json({ data: result });
                    console.log(result[0]);
                    var test = result;
                    var count = 0;

                    if (test.length > 0) {
                        test.forEach(function (key, value) {

                            var item = {
                                exam_paper_id: 'getauto',
                                subject_id: subject_id,
                                exam_sch_id: exam_sch_id,
                                subject_name: key.subjectname,
                                exam_paper_title: key.exam_papertitle,
                                date: key.date,
                                start_time: key.starttime,
                                end_time: key.endtime,
                                max_marks: key.maxmarks,
                                section_id: section_id,
                                class_id: class_id,
                                status: status,
                            };
                            mongo.connect(url, function (err, db) {
                                autoIncrement.getNextSequence(db, 'exams', function (err, autoIndex) {

                                    var collection = db.collection('exams');
                                    collection.ensureIndex({
                                        "exam_paper_id": 1,
                                    }, {
                                            unique: true
                                        }, function (err, result) {
                                            if (item.subject_id == null || item.exam_sch_id == null || item.exam_paper_title == null || item.date == null) {
                                                res.end('null');
                                            } else {
                                                item.exam_paper_id = exam_sch_id + '-EXM-' + autoIndex;
                                                collection.insertOne(item, function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                        if (err.code == 11000) {

                                                            res.end('false');
                                                        }
                                                        res.end('false');
                                                    }
                                                    count++;
                                                    db.close();

                                                    if (count == test.length) {
                                                        res.end('true');
                                                    }


                                                });
                                            }
                                        });

                                });
                            });

                        });


                    } else {
                        res.end('false');
                    }


                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        })
    });



//  Modified
// Exam evaluation bulk upload via excel sheet


router.route('/bulk_upload_exam_eval/:exam_sch_id/:exam_paper_id/:student_id/:section_id/:class_id')
    .post(function (req, res, next) {
        var subject_id = req.params.subject_id;
        var status = 1;
        var exceltojson;
        upload(req, res, function (err) {
            if (err) {
                res.json({ error_code: 1, err_desc: err });
                return;
            }
            /** Multer gives us file info in req.file object */
            if (!req.file) {
                res.json({ error_code: 1, err_desc: "No file passed" });
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, function (err, result) {
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }
                    res.json({ data: result });
                    console.log(result[0]);
                    var test = result;
                    var count = 0;

                    if (test.length > 0) {
                        test.forEach(function (key, value) {

                            var item = {
                                paper_result_id: 'getauto',
                                exam_sch_id: exam_sch_id,
                                exam_paper_id: exam_paper_id,
                                student_id: student_id,
                                class_id: class_id,
                                section_id: section_id,
                                marks: key.marks,
                                percentage: key.percentage,
                                conduct: key.conduct,
                                status: status,
                            }
                            mongo.connect(url, function (err, db) {
                                autoIncrement.getNextSequence(db, 'exam_evaluation', function (err, autoIndex) {

                                    var collection = db.collection('exam_evaluation');
                                    collection.ensureIndex({
                                        "paper_result_id": 1,
                                    }, {
                                            unique: true
                                        }, function (err, result) {
                                            if (item.exam_paper_id == null || item.student_id == null || item.marks == null) {
                                                res.end('null');
                                            } else {
                                                item.paper_result_id = exam_paper_id + '-' + student_id + '-EVAL-' + autoIndex;
                                                collection.insertOne(item, function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                        if (err.code == 11000) {

                                                            res.end('false');
                                                        }
                                                        res.end('false');
                                                    }
                                                    count++;
                                                    db.close();

                                                    if (count == test.length) {
                                                        res.end('true');
                                                    }


                                                });
                                            }
                                        });

                                });
                            });

                        });


                    } else {
                        res.end('false');
                    }


                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        })
    });





module.exports = router;
