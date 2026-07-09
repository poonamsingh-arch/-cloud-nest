const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  totalRequests: { type: Number, default: 0 },
  aiQuestions: { type: Number, default: 0 },
  documentsUploaded: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Analytics", AnalyticsSchema);