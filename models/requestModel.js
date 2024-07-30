var mongoose = require("mongoose");
var Schema = mongoose.Schema;
//request to provider flights
var request = new Schema(
  {
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "flights",
    },
    ship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ships",
    },
    type: String,
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Pending",
    },
    state: String,
    verificationImage: String,
    isMakePayment: Boolean,
    paymentDue: Date,
    isverificationComplete: Boolean,
    isOtpVerified: Boolean,
    completionOtp: String,
    isProviderRead: {
      type: Boolean,
      default: true,
    },
    isCustomerRead: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("requests", request);
