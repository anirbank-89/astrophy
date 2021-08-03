var multer = require("multer");
var fs = require("fs");

const uploadFile = async (req, folder) => {
    let file_name = "uploads/"+folder+"/"+req.file.originalname;
    fs.writeFileSync(file_name, req.file.buffer);
    return file_name;
}

module.exports = {
    uploadFile
};