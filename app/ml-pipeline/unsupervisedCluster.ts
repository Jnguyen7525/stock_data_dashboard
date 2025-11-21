import * as tf from "@tensorflow/tfjs";
import {
  EpisodeRow,
  buildFeatureTensor,
  StandardScaler,
} from "./featureBuilder";

// ---------- K-means result type ----------
export type KMeansResult = {
  centroids: tf.Tensor2D;
  assignments: Int32Array;
  inertia: number;
};

// ---------- K-means helpers ----------
function initCentroidsKMeansPP(X: tf.Tensor2D, k: number): tf.Tensor2D {
  console.log(`[initCentroidsKMeansPP] Initializing centroids with k=${k}`);
  const n = X.shape[0];
  const d = X.shape[1];
  const Xdata = X.arraySync() as number[][];
  const centroids: number[][] = [];

  // Pick first centroid randomly
  centroids.push(Xdata[Math.floor(Math.random() * n)]);

  // Pick remaining centroids
  while (centroids.length < k) {
    const distances = Xdata.map((x) => {
      let minD = Infinity;
      for (const c of centroids) {
        let sum = 0;
        for (let j = 0; j < d; j++) {
          const diff = x[j] - c[j];
          sum += diff * diff;
        }
        if (sum < minD) minD = sum;
      }
      return minD;
    });
    const total = distances.reduce((a, b) => a + b, 0);
    const r = Math.random() * total;
    let acc = 0;
    let idx = 0;
    for (let i = 0; i < n; i++) {
      acc += distances[i];
      if (acc >= r) {
        idx = i;
        break;
      }
    }
    centroids.push(Xdata[idx]);
  }

  return tf.tensor2d(centroids, [k, d], "float32");
}

function assignClusters(X: tf.Tensor2D, C: tf.Tensor2D): Int32Array {
  const Xsq = tf.sum(tf.square(X), 1).expandDims(1);
  const Csq = tf.sum(tf.square(C), 1).expandDims(0);
  const XC = tf.matMul(X, C.transpose());
  const dists = tf.add(tf.sub(Xsq, tf.mul(2, XC)), Csq);
  const assignments = dists.argMin(1);
  const assigned = assignments.dataSync() as Int32Array;

  Xsq.dispose();
  Csq.dispose();
  XC.dispose();
  dists.dispose();
  assignments.dispose();
  return assigned;
}

function recomputeCentroids(
  X: tf.Tensor2D,
  assignments: Int32Array,
  k: number
): tf.Tensor2D {
  const n = X.shape[0],
    d = X.shape[1];
  const sums = Array.from({ length: k }, () => new Float32Array(d));
  const counts = new Int32Array(k);
  const Xdata = X.dataSync() as Float32Array;

  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    counts[c] += 1;
    for (let j = 0; j < d; j++) {
      sums[c][j] += Xdata[i * d + j];
    }
  }
  const centroids = new Float32Array(k * d);
  for (let c = 0; c < k; c++) {
    const cnt = counts[c] || 1;
    for (let j = 0; j < d; j++) {
      centroids[c * d + j] = sums[c][j] / cnt;
    }
  }
  return tf.tensor2d(centroids, [k, d], "float32");
}

function computeInertia(
  X: tf.Tensor2D,
  C: tf.Tensor2D,
  assignments: Int32Array
): number {
  const n = X.shape[0],
    d = X.shape[1];
  const Xdata = X.dataSync() as Float32Array;
  const Cdata = C.dataSync() as Float32Array;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    let s = 0;
    for (let j = 0; j < d; j++) {
      const diff = Xdata[i * d + j] - Cdata[c * d + j];
      s += diff * diff;
    }
    sum += s;
  }
  return sum;
}

// ---------- K-means main ----------
export function kmeansTf(
  X: tf.Tensor2D,
  k: number,
  maxIterations = 100
): KMeansResult {
  console.log(
    `[kmeansTf] Starting k-means with k=${k}, maxIterations=${maxIterations}`
  );
  let centroids = initCentroidsKMeansPP(X, k);
  let assignments = assignClusters(X, centroids);

  for (let iter = 0; iter < maxIterations; iter++) {
    const newCentroids = recomputeCentroids(X, assignments, k);
    const newAssignments = assignClusters(X, newCentroids);

    let changed = 0;
    for (let i = 0; i < assignments.length; i++) {
      if (assignments[i] !== newAssignments[i]) changed++;
    }

    centroids.dispose();
    centroids = newCentroids;
    assignments = newAssignments;

    console.log(`[kmeansTf] Iteration ${iter}, changed=${changed}`);
    if (changed / assignments.length < 0.01) break; // stop if <1% changed
  }

  const inertia = computeInertia(X, centroids, assignments);
  console.log(`[kmeansTf] Finished. Inertia=${inertia}`);
  return { centroids, assignments, inertia };
}

// ---------- Cluster summarization ----------
export function summarizeClusters(
  clustered: (EpisodeRow & { cluster: number })[]
) {
  const summaries: Record<string, any> = {};
  for (const row of clustered) {
    const c = String(row.cluster);
    if (!summaries[c])
      summaries[c] = {
        count: 0,
        total_return_sum: 0,
        avg_rsi_sum: 0,
        avg_rsi_count: 0,
      };
    summaries[c].count++;
    summaries[c].total_return_sum += row.total_return ?? 0;
    if (row.avg_rsi != null) {
      summaries[c].avg_rsi_sum += row.avg_rsi;
      summaries[c].avg_rsi_count++;
    }
  }
  Object.entries(summaries).forEach(([c, s]) => {
    summaries[c].total_return_avg = s.total_return_sum / s.count;
    summaries[c].avg_rsi =
      s.avg_rsi_count > 0 ? s.avg_rsi_sum / s.avg_rsi_count : null;
    console.log(
      `[summarizeClusters] Cluster ${c}: count=${
        s.count
      }, avg_return=${summaries[c].total_return_avg.toFixed(4)}, avg_rsi=${
        summaries[c].avg_rsi
      }`
    );
  });
  return summaries;
}

// ---------- Public API ----------
export async function runUnsupervisedClusteringTF(
  data: EpisodeRow[],
  kValues: number[] = [3, 4, 5],
  strategy: "sentinel" | "zero" | "mean" = "sentinel"
) {
  console.log(`[runUnsupervisedClusteringTF] episodes=${data.length}`);
  if (!data.length) return { results: [] };

  // Build raw feature tensor
  const X = buildFeatureTensor(data, strategy);

  // Normalize features
  const scaler = new StandardScaler();
  scaler.fit(X);
  const Xnorm = scaler.transform(X);

  const results: {
    k: number;
    inertia: number;
    clustered: (EpisodeRow & { cluster: number })[];
    profiles: Record<string, any>;
    centroids: number[][];
    scaler: { means: number[]; stds: number[] };
  }[] = [];

  for (const k of kValues) {
    if (data.length <= k) continue;
    const { centroids, assignments, inertia } = kmeansTf(Xnorm, k, 100);
    const clustered = data.map((row, i) => ({
      ...row,
      cluster: assignments[i],
    }));
    const profiles = summarizeClusters(clustered);

    results.push({
      k,
      inertia,
      clustered,
      profiles,
      centroids: (await centroids.array()) as number[][],
      scaler: scaler.toJSON(),
    });

    centroids.dispose();
  }

  X.dispose();
  Xnorm.dispose();

  return { results };
}
