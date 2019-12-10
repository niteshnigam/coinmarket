//<---------------------------------- signup form ------------------------------------------------->//
const coinmarket_db = require('../database/coinmarket_db')

const mail = require('../mail')

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const uuidv4 = require('uuid/v4');


//<-------------------------export functions-------------------------------------------------------->//
module.exports = {
        signup: signup,
        signin: signin,
        verifytoken: verifytoken,
        forgotpassword: forgotpassword,
        changepassword: changepassword,
        resetpassword: resetpassword
    }
    //<------------------------------------------------------------------------------------------------->//


//validating the email//
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
//validating the mobile //
function validateMobile(mobile_no) {
    var mob = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
    return mob.test(mobile_no);
}

function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};

//function for signup//

function signup(req, res) {
    var today = new Date().toMysqlFormat();
    var token = uuidv4();
    const registration = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        mobileNo: req.body.mobileNo,
        email: req.body.email,
        password: req.body.password,
        updated_at: today,
        status: 0,
        token: token
    }
    console.log(registration);
    if (!req.body.first_name) {
        res.status(422).json({
            status: 422,
            msg: "first name required"
        })
        return
    } else if (!req.body.last_name) {
        res.status(422).json({
            status: 422,
            msg: "last name required"
        })
        return

    } else if (!validateEmail(req.body.email)) {
        res.status(422).json({
            msg: "invalid email",
        })
        return

    } else if (!validateMobile(req.body.mobileNo)) {
        res.status(422).json({
            status: false,
            msg: "invalid mobile no."
        })
        return
    } else if (req.body.password !== req.body.confirmpassword) {
        res.status(422).json({
            status: false,
            msg: "password and confirm password are not same"
        })
        return
    }
    bcrypt.hash(registration['password'], saltRounds, function(err, hash) {
        registration.password = hash;
        coinmarket_db.query(`INSERT into registration set ?`, registration,
            function(err, result) {
                console.log(err)
                if (err) {
                    res.status(409).json({
                        status: false,
                        msg: "user already exist"
                    })
                } else {
                    mail.mailSend({ email: req.body.email, token: registration.token, url: 'http://localhost:8800/verify/' })
                    res.status(200).json({
                        user: result,
                        status: true,
                        msg: "Please verify your email",
                        result: result
                    })
                }
            })
    })

}


//<----------------------------------------------signin---------------------------------------------->//

function signin(req, res) {
    if (!validateEmail(req.body.email)) {
        res.status(422).json({
            status: 422,
            msg: "please enter the correct email"
        })
    } else if (!req.body.password) {
        res.status(422).json({
            status: 422,
            msg: "please enter the password"
        })
    }
    const token = uuidv4();
    const today = new Date().toMysqlFormat();

    coinmarket_db.query(`SELECT id,email,password,status from registration where email="${req.body.email}"`, (error, user) => {
        if (user.length == 0) {
            return res.status(412).json({
                status: 412,
                msg: "user not exist"

            })

        } else if (error) {
            return res.status(412).json({
                status: 412,
                msg: error.msg
            })

        } else if (user[0].status == 0) {
            var query = `UPDATE registration SET  token ="${token}", updated_at ="${today}" where email="${req.body.email}"`;
            coinmarket_db.query(query, (err, updatedUser) => {
                if (!err && updatedUser.affectedRows) {
                    mail.mailSend({ email: req.body.email, token: token, url: 'http://localhost:8800/verify/' })
                    res.status(401).json({
                        status: 401,
                        msg: "please verify your email"
                    })
                } else {
                    res.status(422).json({
                        status: 422,
                        msg: "Something went wrong ,Please try again."
                    })
                }

            })
        } else {
            bcrypt.compare(req.body.password, user[0].password, function(err, flag) {
                if (flag) {
                    let payload = { subject: user[0].email, id: user[0].id }

                    let jwt_token = jwt.sign({
                            payload
                        },
                        'SECRET', {
                            expiresIn: "1h"
                        }
                    );
                    return res.status(200).send({
                        message: "Succesfully login",
                        data: {
                            email: req.body.email,
                            jwt_token: jwt_token
                        }
                    })
                } else {
                    return res.status(422).send({
                        message: "Authentication failed"
                    })
                }

            })
        }

    })
}
//<------------------------------------------verify email---------------------------------------->//
function verifytoken(req, res) {

    let token = req.params.token;

    var today = new Date().getTime()

    coinmarket_db.query('select * from registration where ' + today + '<= (SELECT updated_at from registration where token= ? and status=0 )+120000 and token= ?  and status=0', [token, token], (err, data) => {
        console.log(data)
        if (!!err)
            console.log("Error in Query", err);

        else {

            if (data.length) {
                console.log("Query successfully executed.");
                coinmarket_db.query(`UPDATE registration set status= true, token=null WHERE id = ${data[0].id}`, (err, value) => {
                    if (!!err) console.log("Error in Query", err);
                    else {
                        res.status(200).json({
                            statusCode: 200,
                            status: "Success",
                            msg: "email verified",
                        })
                    }
                });
            } else {
                res.status(400).json({
                    statusCode: 400,
                    status: "Failed",
                    msg: "Token expired",
                })
            }
        }
    });
}
// <------------------------------------------forgot password----------------------------------------->

function forgotpassword(req, res) {

    const token = uuidv4();
    var today = new Date().toMysqlFormat();

    if (!validateEmail(req.body.email)) {
        res.status(422).json({
            msg: "invalid email",
        })
        return
    }
    var query = `SELECT email from registration where email = "${req.body.email}"`
    coinmarket_db.query(query, function(err, user) {
        if (!user) {
            return res.status(500).send({
                message: "user not exist"
            })
        } else if (err) {
            return res.status(500).send({
                message: err.message
            })
        } else if (user[0].email) {
            var email = user[0].email
            coinmarket_db.query(`UPDATE registration SET token =?, updated_at = ? WHERE email = ?`, [token, today, req.body.email], (err, user) => {
                if (!err && user.affectedRows) {
                    mail.mailSend({
                        email: email,
                        token: token,
                        url: 'http://localhost:4800/verify-resetpassword/'

                    })
                    res.status(401).json({
                        status: 401,
                        msg: "please verify your email for RESET password"
                    })
                } else {
                    res.status(422).json({
                        status: 422,
                        msg: 'SOMETHING WENT WRONG'
                    })
                }
            })
        }
    })


}
// <----------------------------------for change password------------------------------------------->
function changepassword(req, res) {
    let token = req.params.token
    var today = new Date().toMysqlFormat();

    var query = "select * from registration where token='" + token + "' and status=1";

    coinmarket_db.query(query, (err, data) => {
        if (!!err) {
            console.log("Error in Query", err);
        } else {
            if (data.length > 0) {
                var updatetime = new Date('"' + data[0].updated_at + '"');
                var currenttime = new Date();
                var timeDiff = Math.abs(currenttime.getTime() - updatetime.getTime())
                console.log(timeDiff);

                if (timeDiff > 120000) {
                    res.status(400).json({
                        status: 400,
                        msg: "TOKEN EXPIRE"
                    })
                } else {
                    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

                        req.body.password = hash;
                        if (data.length) {
                            console.log("Query successfully executed.");
                            coinmarket_db.query(`UPDATE registration set password = ? , token = null WHERE id =?`, [req.body.password, data[0].id], (err, value) => {
                                if (!!err) console.log("Error in Query", err);
                                else {
                                    res.status(200).json({
                                        statusCode: 200,
                                        status: "Success",
                                        msg: "password is successfully changed",
                                    })
                                }
                            });
                        } else {
                            res.status(400).json({
                                statusCode: 400,
                                status: "Failed",
                                msg: "SOMETHING WENT WRONG",
                            })
                        }
                    })
                }
            }
        }
    });
}

// <--------------------------------------------reset-password---------------------------------------->

function resetpassword(req, res) {

    if (!req.body.oldpassword) {
        res.status(500).json({
            status: 500,
            msg: "old password is required"
        })
    } else if (!req.body.newpassword) {
        res.status(500).json({
            status: 500,
            msg: "old password is required"
        })

    } else if (!req.body.confirmpassword) {
        res.status(500).json({
            status: 500,
            msg: "confirm password is required"
        })

    } else if (req.body.newpassword !== req.body.confirmpassword) {
        res.status(500).json({
            status: 500,
            msg: "password and comfirm password did not match"
        })

    }

    var query = `SELECT * FROM registration WHERE id = ${req.decoded.payload.id}`;
    coinmarket_db.query(query, (err, user) => {
        console.log("query:", query, user)
        if (!!err) {
            console.log("err in query", err)
        } else {
            if (user.length > 0) {
                bcrypt.compare(req.body.oldpassword, user[0].password, function(error, flag) {
                    console.log("req.body.password:", req.body.oldpassword, "\n\n user[0].password:", user[0].password)
                    if (flag) {
                        bcrypt.hash(req.body.newpassword, saltRounds, function(err, hash) {
                            req.body.newpassword = hash
                            coinmarket_db.query(`UPDATE registration SET password = "${req.body.newpassword}" WHERE id = ${req.decoded.payload.id}`, (err, value) => {
                                console.log("\n\npwd:", req.body.newpassword);

                                if (!!err) {
                                    res.status(400).json({
                                        statusCode: 400,
                                        msg: "query not executed successfully"
                                    })
                                } else {
                                    res.status(200).json({
                                        statusCode: 200,
                                        msg: "password is succesfully changed"
                                    })
                                }
                            })

                        })
                    } else {
                        return res.status(401).json({
                            status: 401,
                            msg: "old is incorrect"
                        })
                    }

                })
            }
        };
        // UPDATE `registration` SET `password`=  WHERE 1



    })
}