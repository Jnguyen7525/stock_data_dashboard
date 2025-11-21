import * as tf from "@tensorflow/tfjs";
import {
  EpisodeRow,
  buildFeatureTensor,
  StandardScaler,
  rowToDirectionLabel,
  rowToTrendQualityLabel,
} from "./featureBuilder";
import { runUnsupervisedClusteringTF } from "./unsupervisedCluster";

// ---------- Utility: build label tensor ----------
function buildLabelTensor(
  rows: EpisodeRow[],
  mode: "direction" | "trend_quality"
): tf.Tensor2D {
  const labels = rows.map((row) =>
    mode === "direction"
      ? rowToDirectionLabel(row)
      : rowToTrendQualityLabel(row)
  );
  const flat = new Float32Array(labels.length * labels[0].length);
  labels.forEach((v, i) => flat.set(v, i * v.length));
  return tf.tensor2d(flat, [labels.length, labels[0].length], "float32");
}

// ---------- Utility: build cluster label tensor ----------
function buildClusterLabelTensor(
  clustered: (EpisodeRow & { cluster: number })[],
  k: number
): tf.Tensor2D {
  const labels = clustered.map((row) => {
    const oneHot = new Array(k).fill(0);
    oneHot[row.cluster] = 1;
    return oneHot;
  });
  const flat = new Float32Array(labels.length * k);
  labels.forEach((v, i) => flat.set(v, i * k));
  return tf.tensor2d(flat, [labels.length, k], "float32");
}

// ---------- Build MLP model ----------
function buildMLP(inputDim: number, outputDim: number): tf.Sequential {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 64, activation: "relu", inputShape: [inputDim] })
  );
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: outputDim, activation: "softmax" }));
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });
  return model;
}

// ---------- Evaluation helpers ----------
function confusionMatrix(yTrue: number[][], yPred: number[][]) {
  const nClasses = yTrue[0].length;
  const matrix = Array.from({ length: nClasses }, () =>
    new Array(nClasses).fill(0)
  );
  yTrue.forEach((trueRow, i) => {
    const trueIdx = trueRow.findIndex((v) => v === 1);
    const predIdx = yPred[i].indexOf(Math.max(...yPred[i]));
    matrix[trueIdx][predIdx]++;
  });
  return matrix;
}

function precisionRecallF1(matrix: number[][]) {
  const nClasses = matrix.length;
  const perClass = [];
  let totalTP = 0,
    totalFP = 0,
    totalFN = 0;

  for (let c = 0; c < nClasses; c++) {
    const tp = matrix[c][c];
    const fp = matrix
      .map((row, i) => (i !== c ? row[c] : 0))
      .reduce((a, b) => a + b, 0);
    const fn = matrix[c].reduce((a, b, j) => (j !== c ? a + b : a), 0);
    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    const f1 = (2 * precision * recall) / (precision + recall || 1);
    perClass.push({ precision, recall, f1 });
    totalTP += tp;
    totalFP += fp;
    totalFN += fn;
  }

  const weightedPrecision = totalTP / (totalTP + totalFP || 1);
  const weightedRecall = totalTP / (totalTP + totalFN || 1);
  const weightedF1 =
    (2 * weightedPrecision * weightedRecall) /
    (weightedPrecision + weightedRecall || 1);

  return { perClass, weightedPrecision, weightedRecall, weightedF1 };
}

function computeMacro(
  perClass: { precision: number; recall: number; f1: number }[]
) {
  const n = perClass.length || 1;
  const sum = perClass.reduce(
    (acc, m) => ({
      precision: acc.precision + m.precision,
      recall: acc.recall + m.recall,
      f1: acc.f1 + m.f1,
    }),
    { precision: 0, recall: 0, f1: 0 }
  );
  return {
    macroPrecision: sum.precision / n,
    macroRecall: sum.recall / n,
    macroF1: sum.f1 / n,
  };
}

// ---------- Train supervised model ----------

export async function trainSupervisedModel(
  rows: EpisodeRow[],
  mode: "direction" | "trend_quality"
) {
  console.log(
    `[trainSupervisedModel] Training supervised model on ${mode} labels...`
  );

  // Build features
  const X = buildFeatureTensor(rows);
  const scaler = new StandardScaler();
  scaler.fit(X);
  const Xnorm = scaler.transform(X);

  // Build labels
  const Y = buildLabelTensor(rows, mode);

  // Split train/test
  const split = Math.floor(rows.length * 0.8);
  const Xtrain = Xnorm.slice([0, 0], [split, Xnorm.shape[1]]);
  const Ytrain = Y.slice([0, 0], [split, Y.shape[1]]);
  const Xtest = Xnorm.slice([split, 0], [rows.length - split, Xnorm.shape[1]]);
  const Ytest = Y.slice([split, 0], [rows.length - split, Y.shape[1]]);

  // Build model
  const model = buildMLP(Xnorm.shape[1], Y.shape[1]);

  // Train
  const history = await model.fit(Xtrain, Ytrain, {
    epochs: 20,
    batchSize: 32,
    validationSplit: 0.2,
    shuffle: true,
  });

  // Evaluate
  const evalResult = model.evaluate(Xtest, Ytest) as tf.Scalar[];
  const testAcc = (await evalResult[1].data())[0];
  console.log(`Test Accuracy: ${(testAcc * 100).toFixed(2)}%`);

  // Predictions
  const preds = model.predict(Xtest) as tf.Tensor;
  const yPred = (await preds.array()) as number[][];
  const yTrue = (await Ytest.array()) as number[][];

  // Confusion matrix + metrics
  const matrix = confusionMatrix(yTrue, yPred);
  const metrics = precisionRecallF1(matrix);
  const macro = computeMacro(metrics.perClass);

  // Map indices back to human-readable labels
  const labelNames =
    mode === "direction" ? ["Up", "Down", "Flat"] : ["Strong", "Weak", "Noise"];

  // Count samples per class
  const classCounts = labelNames.map(
    (_, idx) => yTrue.filter((row) => row[idx] === 1).length
  );

  return {
    model,
    scaler,
    history,
    metrics: {
      ...metrics,
      macroPrecision: macro.macroPrecision,
      macroRecall: macro.macroRecall,
      macroF1: macro.macroF1,
      labelNames,
      classCounts,
      confusionMatrix: matrix,
      testAccuracy: testAcc,
    },
  };
}

// ---------- Export helpers ----------
export async function exportModelAndScaler(
  trainOutput: Awaited<ReturnType<typeof trainSupervisedModel>>
) {
  // Save model files (JSON + weights.bin)
  await trainOutput.model.save("downloads://supervised-model");

  // Save scaler parameters safely
  const scalerData = {
    means: trainOutput.scaler.means ? Array.from(trainOutput.scaler.means) : [],
    stds: trainOutput.scaler.stds ? Array.from(trainOutput.scaler.stds) : [],
    labelNames: trainOutput.metrics.labelNames,
  };

  const blob = new Blob([JSON.stringify(scalerData)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "scaler.json";
  a.click();
}

// ---------- Cross-validation ----------
export async function crossValidateSupervisedModel(
  rows: EpisodeRow[],
  mode: "direction" | "trend_quality",
  kFolds: number = 5
) {
  console.log(`[crossValidateSupervisedModel] Running ${kFolds}-fold CV...`);

  const X = buildFeatureTensor(rows);
  const scaler = new StandardScaler();
  scaler.fit(X);
  const Xnorm = scaler.transform(X);

  const Y = tf.tensor2d(
    rows.flatMap((row) =>
      mode === "direction"
        ? rowToDirectionLabel(row)
        : rowToTrendQualityLabel(row)
    ),
    [rows.length, mode === "direction" ? 3 : 3],
    "float32"
  );

  const foldSize = Math.floor(rows.length / kFolds);
  const foldMetrics: any[] = [];

  for (let fold = 0; fold < kFolds; fold++) {
    const start = fold * foldSize;
    const end = start + foldSize;

    const Xtest = Xnorm.slice([start, 0], [foldSize, Xnorm.shape[1]]);
    const Ytest = Y.slice([start, 0], [foldSize, Y.shape[1]]);

    const XtrainParts = [
      Xnorm.slice([0, 0], [start, Xnorm.shape[1]]),
      Xnorm.slice([end, 0], [rows.length - end, Xnorm.shape[1]]),
    ];
    const YtrainParts = [
      Y.slice([0, 0], [start, Y.shape[1]]),
      Y.slice([end, 0], [rows.length - end, Y.shape[1]]),
    ];
    const Xtrain = tf.concat(XtrainParts, 0);
    const Ytrain = tf.concat(YtrainParts, 0);

    const model = buildMLP(Xnorm.shape[1], Y.shape[1]);
    await model.fit(Xtrain, Ytrain, {
      epochs: 20,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
    });

    const preds = model.predict(Xtest) as tf.Tensor;
    const yPred = (await preds.array()) as number[][];
    const yTrue = (await Ytest.array()) as number[][];

    const matrix = confusionMatrix(yTrue, yPred);
    const metrics = precisionRecallF1(matrix);
    const macro = computeMacro(metrics.perClass);

    foldMetrics.push({
      ...metrics,
      macroPrecision: macro.macroPrecision,
      macroRecall: macro.macroRecall,
      macroF1: macro.macroF1,
      confusionMatrix: matrix,
    });
  }

  // Average metrics across folds
  const avg = {
    weightedPrecision:
      foldMetrics.reduce((a, m) => a + m.weightedPrecision, 0) / kFolds,
    weightedRecall:
      foldMetrics.reduce((a, m) => a + m.weightedRecall, 0) / kFolds,
    weightedF1: foldMetrics.reduce((a, m) => a + m.weightedF1, 0) / kFolds,
    macroPrecision:
      foldMetrics.reduce((a, m) => a + m.macroPrecision, 0) / kFolds,
    macroRecall: foldMetrics.reduce((a, m) => a + m.macroRecall, 0) / kFolds,
    macroF1: foldMetrics.reduce((a, m) => a + m.macroF1, 0) / kFolds,
  };

  return { avg, folds: foldMetrics };
}

/// ---------- Train cluster-based supervised model ----------
export async function trainClusterBasedModel(
  rows: EpisodeRow[],
  kValues: number[] = [3, 4, 5]
) {
  console.log("[trainClusterBasedModel] Running clustering first...");
  const { results } = await runUnsupervisedClusteringTF(rows, kValues);

  const best = results[0]; // pick first k (could add logic to choose best inertia)
  const clustered = best.clustered;
  const k = best.k;

  console.log(
    `[trainClusterBasedModel] Training supervised model on cluster IDs (k=${k})...`
  );

  // Build features
  const X = buildFeatureTensor(clustered);
  const scaler = new StandardScaler();
  scaler.fit(X);
  const Xnorm = scaler.transform(X);

  // Build cluster labels
  const Y = buildClusterLabelTensor(clustered, k);

  // Split train/test
  const split = Math.floor(clustered.length * 0.8);
  const Xtrain = Xnorm.slice([0, 0], [split, Xnorm.shape[1]]);
  const Ytrain = Y.slice([0, 0], [split, Y.shape[1]]);
  const Xtest = Xnorm.slice(
    [split, 0],
    [clustered.length - split, Xnorm.shape[1]]
  );
  const Ytest = Y.slice([split, 0], [clustered.length - split, Y.shape[1]]);

  // Build model
  const model = buildMLP(Xnorm.shape[1], Y.shape[1]);

  // Train
  const history = await model.fit(Xtrain, Ytrain, {
    epochs: 20,
    batchSize: 32,
    validationSplit: 0.2,
    shuffle: true,
  });

  // Evaluate
  const evalResult = model.evaluate(Xtest, Ytest) as tf.Scalar[];
  const testAcc = (await evalResult[1].data())[0];

  // Predictions
  const preds = model.predict(Xtest) as tf.Tensor;
  const yPred = (await preds.array()) as number[][];
  const yTrue = (await Ytest.array()) as number[][];

  // Confusion matrix + metrics
  const matrix = confusionMatrix(yTrue, yPred);
  const metrics = precisionRecallF1(matrix);
  const macro = computeMacro(metrics.perClass);

  // Label names for clusters
  const labelNames = Array.from({ length: k }, (_, i) => `Cluster ${i}`);
  const classCounts = labelNames.map(
    (_, idx) => yTrue.filter((row) => row[idx] === 1).length
  );

  return {
    model,
    scaler,
    k,
    history,
    metrics: {
      ...metrics,
      macroPrecision: macro.macroPrecision,
      macroRecall: macro.macroRecall,
      macroF1: macro.macroF1,
      labelNames,
      classCounts,
      confusionMatrix: matrix,
      testAccuracy: testAcc,
    },
  };
}
