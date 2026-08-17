const DecisionEvent = require("../models/DecisionEvent");
const Product = require("../models/Product");
const Order = require("../models/Order");
const catchAsync = require("../middleware/catchAsync");

const LOW_STOCK_THRESHOLD = 5;
const NEEDS_ATTENTION_STATUSES = ["pending", "processing"];

// Same detection rules already used client-side for Notifications and
// Today's Action Center, run here so they can be persisted.
const detectCurrentIssues = async (ownerId) => {
  const products = await Product.find({ user: ownerId });
  const orders = await Order.find({ owner: ownerId }).populate("customer");

  const issues = [];

  products.forEach((p) => {
    if (p.quantity === 0) {
      issues.push({
        type: "out_of_stock",
        entityType: "Product",
        entityId: p._id,
        title: `${p.name} is out of stock`,
        reason: "This product has zero units available — any new orders referencing it will fail.",
        recommendation: `Restock ${p.name} as soon as possible.`,
      });
    } else if (p.quantity <= LOW_STOCK_THRESHOLD) {
      issues.push({
        type: "low_stock",
        entityType: "Product",
        entityId: p._id,
        title: `${p.name} is running low`,
        reason: `Only ${p.quantity} unit${p.quantity !== 1 ? "s" : ""} left in stock.`,
        recommendation: `Consider reordering ${p.name} before it runs out.`,
      });
    }
  });

  orders.forEach((o) => {
    const status = (o.status || o.orderStatus || "Pending").toLowerCase();
    if (NEEDS_ATTENTION_STATUSES.includes(status)) {
      issues.push({
        type: "stalled_order",
        entityType: "Order",
        entityId: o._id,
        title: `Order from ${o.customer?.name || "a customer"} needs attention`,
        reason: `This order has been in "${o.status || o.orderStatus}" status and hasn't moved forward.`,
        recommendation: "Follow up on this order — update its status or contact the customer.",
      });
    }
  });

  return issues;
};

// Detects current issues, auto-resolves tracked events whose condition has
// cleared, and opens a fresh event for anything genuinely new — without
// duplicating an event that's already open or snoozed.
const syncDecisionEvents = async (ownerId) => {
  const issues = await detectCurrentIssues(ownerId);
  const issueKeys = new Set(issues.map((i) => `${i.type}:${i.entityId}`));

  const activeEvents = await DecisionEvent.find({
    owner: ownerId,
    status: { $in: ["open", "snoozed"] },
  });

  for (const event of activeEvents) {
    const key = `${event.type}:${event.entityId}`;

    if (!issueKeys.has(key)) {
      // The underlying condition cleared on its own (restocked, order moved on, etc.)
      event.status = "done";
      event.resolvedAt = new Date();
      event.outcomeNote = "Resolved automatically — condition no longer detected";
      await event.save();
      continue;
    }

    if (event.status === "snoozed" && event.snoozeUntil && event.snoozeUntil <= new Date()) {
      event.status = "open";
      event.snoozeUntil = undefined;
      await event.save();
    }
  }

  const stillActive = await DecisionEvent.find({
    owner: ownerId,
    status: { $in: ["open", "snoozed"] },
  });
  const activeKeys = new Set(stillActive.map((e) => `${e.type}:${e.entityId}`));

  const newEvents = issues
    .filter((issue) => !activeKeys.has(`${issue.type}:${issue.entityId}`))
    .map((issue) => ({ ...issue, owner: ownerId, status: "open", detectedAt: new Date() }));

  if (newEvents.length > 0) {
    await DecisionEvent.insertMany(newEvents);
  }
};

const getTimeline = catchAsync(async (req, res) => {
  await syncDecisionEvents(req.user.id);

  const events = await DecisionEvent.find({ owner: req.user.id }).sort({ updatedAt: -1 });

  res.status(200).json(events);
});

const updateEventStatus = catchAsync(async (req, res) => {
  const { status, snoozeUntil, outcomeNote } = req.body;

  if (!["open", "snoozed", "done", "ignored"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  if (status === "snoozed" && !snoozeUntil) {
    return res.status(400).json({ message: "snoozeUntil is required when snoozing" });
  }

  const event = await DecisionEvent.findOne({ _id: req.params.id, owner: req.user.id });

  if (!event) {
    return res.status(404).json({ message: "Decision event not found" });
  }

  event.status = status;
  event.snoozeUntil = status === "snoozed" ? new Date(snoozeUntil) : undefined;
  if (status === "done" || status === "ignored") {
    event.resolvedAt = new Date();
    if (outcomeNote) event.outcomeNote = outcomeNote;
  } else {
    event.resolvedAt = undefined;
  }
  await event.save();

  res.status(200).json({
    message: "Decision event updated",
    event,
  });
});

module.exports = {
  getTimeline,
  updateEventStatus,
};
