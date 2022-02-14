var PDFGenerator = require('pdfkit');
var fs = require('fs');

// TO DO create a pretty header...
function generateHeader(address_lines,state,country,zip) {
    var billingAddress = address_lines + " , " + state + " , " + country + " , " + zip;
}

module.exports = {
    generateHeader
}