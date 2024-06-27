require('dotenv').config();

exports.uploadFile = async (req, res, next) => {
    res.json(req.file);

};