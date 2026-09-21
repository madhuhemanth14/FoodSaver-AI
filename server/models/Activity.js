const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "created",
            "accepted",
            "scheduled",
            "completed",
            "delivered",
            "cancelled"
        ],
        default: "created"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model(
    "Activity",
    activitySchema
);