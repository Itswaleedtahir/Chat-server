const mongoose = require("mongoose");

let organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    img_url: {
      type: mongoose.SchemaTypes.String,
      default: "",
    },
    created_by: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    pending_members: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
        default: [],
      },
    ],
    members: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
      },
    ],
    projects: [
      {
        project_id: { type: mongoose.SchemaTypes.ObjectId, ref: "project" },
        project_name: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("organization", organizationSchema);
