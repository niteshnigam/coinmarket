const coinmarket_db = require('../database/coinmarket_db')

function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};

function createprofile(req, res) {
    var today = new Date().toMysqlFormat();

    var query = `INSERT into UserProfile (regisId, education, address, DOB, nickName, updatedAt) values (${req.decoded.payload.id},"${req.body.education}","${req.body.address}","${req.body.DOB}","${req.body.nickName}", "${today}")`;
    console.log("QUERY: ", query)
    coinmarket_db.query(query,
        function(err, result) {
            if (err) {
                res.status(400).json({
                    status: false,
                    msg: err
                })
            } else if (!result.affectedRows) {
                res.status(400).json({
                    status: false,
                    msg: "user already exist1"
                })
            } else {
                res.status(200).json({
                    user: result,
                    status: true,
                    msg: "user created there profile",
                    mobile: result.mobile
                })
            }
        })
}

function getprofile(req, res) {

    coinmarket_db.query('select DOB,address,education from UserProfile where regisId= ?', [req.decoded.payload.id], function(err, data) {
        if (err) {
            res.status(422).json({ status: false, message: "Something Went Wrong" })
        } else {
            res.status(200).json({ status: true, message: "Retrived Data Successfully", data: data })

        }
    })
}

//api for updating user profile //
function updateprofile(req, res) {
    var today = new Date().toMysqlFormat();

    var keys = Object.keys(req.body);
    var values = "";
    keys.map(x => {
        values += x + "='" + req.body[x] + "', ";
    })
    values = values.substring(0, values.length - 2);

    var query = `UPDATE UserProfile SET ${values} WHERE regisId = ${req.decoded.payload.id}`;
    console.log("QUERY: ", query)
    coinmarket_db.query(query,
        function(err, result) {
            if (err) {
                res.status(400).json({
                    status: false,
                    msg: err
                })
            } else if (!result.affectedRows) {
                res.status(400).json({
                    status: false,
                    msg: "Rows not affected"
                })
            } else {
                res.status(200).json({
                    user: result,
                    status: true,
                    msg: "user updated there profile",
                    mobile: result.mobile
                })
            }
        })

}

function deleteprofile(req, res) {

    coinmarket_db.query('DELETE FROM UserProfile where regisId= ?', [req.decoded.payload.id], function(err, data) {
        if (err) {
            res.status(422).json({ status: false, message: "Something Went Wrong" })
        } else {
            res.status(200).json({ status: true, message: "delete data successfully" })

        }
    })
}
module.exports = {
    createprofile: createprofile,
    getprofile: getprofile,
    updateprofile: updateprofile,
    deleteprofile: deleteprofile
}