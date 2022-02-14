var fs = require("fs");

const uploadFile = async (req, folder) => {
    let file_name = "uploads/"+folder+"/"+req.file.originalname;
    fs.writeFileSync(file_name, req.file.buffer);
    return file_name;
}

const uploadDocFile = async (req, folder) => {
    var upl_file = req.file.originalname;

    let file_name = "uploads/" + folder + "/" + upl_file.replace(/\s+/g, '');
    fs.writeFileSync(file_name, req.file.buffer);
    return file_name;
}

module.exports = {
    uploadFile,
    uploadDocFile
};