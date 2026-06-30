const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    filename: String,
    filepath: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Document",
  DocumentSchema
);