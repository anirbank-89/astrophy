const mongoose = require("mongoose");
var moment = require("moment-timezone");
const { Double } = require("bson");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const TotalcomissionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  seller_id:mongoose.Schema.Types.ObjectId,
  comission_total: {
    type: Number
  },
  comission_all: {
    type: Number
  },
  comission_paid: {
    type: Number
  },
  created_on: {
    type: Date,
    default: dateKolkata,
}
});

module.exports = mongoose.model("Totalcomission", TotalcomissionSchema);
