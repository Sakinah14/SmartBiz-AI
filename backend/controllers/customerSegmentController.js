const Customer = require("../models/Customer");
const Order = require("../models/Order");
const catchAsync = require("../middleware/catchAsync");

// RFM (Recency, Frequency, Monetary) customer segmentation via k-means
// clustering. The model is trained fresh, on this user's own order history,
// on every request — there is no pre-trained or external model involved.
const K = 3;
const SEGMENT_LABELS = ["At-risk", "Regular", "VIP"]; // ranked low -> high combined RFM score

function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

// Deterministic seeding: sort points by combined score and pick k evenly
// spaced ones as starting centroids. Keeps results reproducible (no random
// seed) and avoids the "all centroids land on the same point" failure mode
// random initialization can hit on small datasets.
function initializeCentroids(points, k) {
  const orderedIdx = points
    .map((p, i) => ({ i, score: p[0] + p[1] + p[2] }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.i);

  const centroids = [];
  for (let c = 0; c < k; c++) {
    const idx = Math.floor((c * (orderedIdx.length - 1)) / Math.max(k - 1, 1));
    centroids.push([...points[orderedIdx[idx]]]);
  }
  return centroids;
}

// Standard Lloyd's algorithm: assign each point to its nearest centroid,
// recompute centroids as the mean of their assigned points, repeat until
// assignments stop changing.
function kmeans(points, k, maxIterations = 50) {
  let centroids = initializeCentroids(points, k);
  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    for (let i = 0; i < points.length; i++) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let c = 0; c < k; c++) {
        const dist = euclideanDistance(points[i], centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          minIdx = c;
        }
      }
      if (assignments[i] !== minIdx) changed = true;
      assignments[i] = minIdx;
    }

    const sums = Array.from({ length: k }, () => [0, 0, 0]);
    const counts = new Array(k).fill(0);
    for (let i = 0; i < points.length; i++) {
      const c = assignments[i];
      sums[c][0] += points[i][0];
      sums[c][1] += points[i][1];
      sums[c][2] += points[i][2];
      counts[c]++;
    }
    centroids = centroids.map((old, c) =>
      counts[c] > 0 ? [sums[c][0] / counts[c], sums[c][1] / counts[c], sums[c][2] / counts[c]] : old
    );

    if (!changed && iter > 0) break;
  }

  return { assignments, centroids };
}

// Min-max normalize so Recency/Frequency/Monetary (very different scales)
// contribute equally to distance instead of Monetary dominating.
function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}

const getCustomerSegments = catchAsync(async (req, res) => {
  const [customers, orders] = await Promise.all([
    Customer.find({ owner: req.user.id }),
    Order.find({ owner: req.user.id }),
  ]);

  const ordersByCustomer = {};
  orders.forEach((o) => {
    const key = o.customer.toString();
    if (!ordersByCustomer[key]) ordersByCustomer[key] = [];
    ordersByCustomer[key].push(o);
  });

  const now = Date.now();
  const withOrders = [];
  const results = [];

  customers.forEach((c) => {
    const custOrders = ordersByCustomer[c._id.toString()];
    if (!custOrders || custOrders.length === 0) {
      // No purchase history yet — nothing to cluster on.
      results.push({ _id: c._id, name: c.name, segment: "New", stats: null });
      return;
    }
    const mostRecent = Math.max(...custOrders.map((o) => new Date(o.createdAt).getTime()));
    const recencyDays = (now - mostRecent) / (1000 * 60 * 60 * 24);
    const frequency = custOrders.length;
    const monetary = custOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    withOrders.push({ customer: c, recencyDays, frequency, monetary });
  });

  if (withOrders.length >= K) {
    // Bought-more-recently is better, so invert recency before normalizing
    // — all three features then point the same direction ("higher = more valuable").
    const rNorm = normalize(withOrders.map((w) => -w.recencyDays));
    const fNorm = normalize(withOrders.map((w) => w.frequency));
    const mNorm = normalize(withOrders.map((w) => w.monetary));

    const points = withOrders.map((_, i) => [rNorm[i], fNorm[i], mNorm[i]]);
    const { assignments, centroids } = kmeans(points, K);

    // Rank the resulting clusters by combined score so the label always
    // matches the actual data, regardless of which cluster index k-means
    // happened to assign it.
    const rankedClusterIdx = centroids
      .map((c, idx) => ({ idx, score: c[0] + c[1] + c[2] }))
      .sort((a, b) => a.score - b.score)
      .map((x) => x.idx);

    const labelByClusterIdx = {};
    rankedClusterIdx.forEach((clusterIdx, rank) => {
      labelByClusterIdx[clusterIdx] = SEGMENT_LABELS[rank];
    });

    withOrders.forEach((w, i) => {
      results.push({
        _id: w.customer._id,
        name: w.customer.name,
        segment: labelByClusterIdx[assignments[i]],
        stats: {
          recencyDays: Math.round(w.recencyDays),
          frequency: w.frequency,
          monetary: w.monetary,
        },
      });
    });
  } else {
    // Too few customers with order history to cluster meaningfully.
    withOrders.forEach((w) => {
      results.push({
        _id: w.customer._id,
        name: w.customer.name,
        segment: "Regular",
        stats: {
          recencyDays: Math.round(w.recencyDays),
          frequency: w.frequency,
          monetary: w.monetary,
        },
      });
    });
  }

  res.status(200).json(results);
});

module.exports = { getCustomerSegments };
