// import * as tf from "@tensorflow/tfjs";

// type SignalInput = {
//   rsi: number;
//   ema: number;
//   bb_lower: number;
//   vwap: number;
//   obv: number;
//   bb_upper: number;
//   close: number;
// };

// type SignalPrediction = {
//   label: number;
//   probs: number[];
//   confidence: number;
// };

// let cachedModel: tf.LayersModel | null = null;
// let cachedNormStats: { mean: number[]; variance: number[] } | null = null;

// export async function predictSignalFromRow(
//   row: SignalInput,
//   threshold = 0.6
// ): Promise<SignalPrediction> {
//   // Load model
//   if (!cachedModel) {
//     cachedModel = await tf.loadLayersModel("/models/signal-model.json");
//     console.log("✅ Loaded model from /models/signal-model.json");
//   }

//   // Load normalization stats
//   if (!cachedNormStats) {
//     const res = await fetch("/models/signal-normalization.json");
//     cachedNormStats = await res.json();
//     console.log("📥 Loaded normalization stats:", cachedNormStats);
//   }

//   const raw = [
//     row.rsi,
//     row.ema,
//     row.bb_lower,
//     row.vwap,
//     row.obv,
//     row.bb_upper,
//     row.close,
//   ];

//   const { mean, variance } = cachedNormStats;

//   // Validate raw input
//   if (raw.some((v) => typeof v !== "number" || isNaN(v))) {
//     console.warn("⚠️ Raw input contains invalid values:", raw);
//     return { label: 1, probs: [0, 1, 0], confidence: 1 };
//   }

//   // Validate normalization stats
//   if (
//     !mean ||
//     !variance ||
//     mean.length !== raw.length ||
//     variance.length !== raw.length
//   ) {
//     console.warn("⚠️ Normalization stats mismatch. Falling back to Hold.");
//     return { label: 1, probs: [0, 1, 0], confidence: 1 };
//   }

//   // Safe normalization
//   const scaled = raw.map((v, i) => {
//     const m = mean[i];
//     const varVal = variance[i];
//     const std = Math.sqrt(varVal);

//     if (!isFinite(v) || !isFinite(m) || !isFinite(std) || std === 0) {
//       console.warn(`⚠️ Invalid normalization at index ${i}:`, {
//         value: v,
//         mean: m,
//         variance: varVal,
//       });
//       return 0;
//     }

//     return (v - m) / std;
//   });

//   // Log scaled input
//   console.log("📦 Scaled input:", scaled);
//   if (scaled.some((v) => isNaN(v))) {
//     console.warn("⚠️ Scaled input contains NaN. Skipping prediction.");
//     return { label: 1, probs: [0, 1, 0], confidence: 1 };
//   }

//   const inputTensor = tf.tensor2d([scaled]);
//   const prediction = cachedModel.predict(inputTensor) as tf.Tensor;

//   const probs = Array.from(prediction.dataSync());
//   const label = prediction.argMax(-1).dataSync()[0];
//   const confidence = probs[label];

//   console.log("🔮 Prediction:", { label, probs, confidence });

//   return { label, probs, confidence };
// }
