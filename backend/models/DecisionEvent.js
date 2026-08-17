const mongoose = require("mongoose");

// Persists the alerts already detected elsewhere in the app (low stock,
// out of stock, stalled orders) so an owner can act on them — Done, Snooze,
// or Ignore — and see a history of what was flagged and what happened,
// instead of the existing Notifications/Action Center which recompute
// fresh on every page load with no memory.
const decisionEventSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["out_of_stock", "low_stock", "stalled_order"],
      required: true,
    },

    entityType: {
      type: String,
      enum: ["Product", "Order"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    recommendation: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "snoozed", "done", "ignored"],
      default: "open",
    },

    snoozeUntil: {
      type: Date,
    },

    detectedAt: {
      type: Date,
      default: Date.now,
    },

    resolvedAt: {
      type: Date,
    },

    outcomeNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

decisionEventSchema.index({ owner: 1, type: 1, entityId: 1, status: 1 });

module.exports = mongoose.model("DecisionEvent", decisionEventSchema);
