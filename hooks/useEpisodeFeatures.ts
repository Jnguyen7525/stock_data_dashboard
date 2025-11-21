import {
  buildFeatureTensor,
  StandardScaler,
  EpisodeRow,
} from "@/app/ml-pipeline/featureBuilder";
import { buildEpisodes, RawRow } from "@/lib/episodeBuilder";
import * as tf from "@tensorflow/tfjs";

export type EpisodePrediction = {
  episode: EpisodeRow;
  label: string;
  confidence: number;
};

export async function getEpisodePredictions(
  enrichedBars: RawRow[],
  model: tf.LayersModel,
  scaler: StandardScaler,
  labels: string[]
): Promise<EpisodePrediction[]> {
  if (!enrichedBars || enrichedBars.length === 0) {
    console.warn("⚠️ No enriched data provided. Skipping predictions.");
    return [];
  }

  console.log("📍 Starting supervised inference...");

  // 1️⃣ Aggregate bars into episodes
  const episodes: EpisodeRow[] = buildEpisodes(
    enrichedBars,
    0.05
  ) as unknown as EpisodeRow[];

  console.log(`🔎 Built ${episodes.length} episodes`);

  // 2️⃣ Build feature tensor
  const Xnew = buildFeatureTensor(episodes);
  console.log("🔎 Feature tensor shape:", Xnew.shape);

  // 3️⃣ Normalize
  const Xnorm = scaler.transform(Xnew);
  console.log("🔎 Normalized tensor shape:", Xnorm.shape);

  // 4️⃣ Predict
  const preds = model.predict(Xnorm) as tf.Tensor;
  const yPred = (await preds.array()) as number[][];
  console.log("🔎 Raw prediction sample:", yPred.slice(0, 5));

  // 5️⃣ Map predictions to episodes
  const predictions: EpisodePrediction[] = yPred.map((row, i) => {
    const idx = row.indexOf(Math.max(...row));
    return {
      episode: episodes[i],
      label: labels[idx],
      confidence: Math.max(...row),
    };
  });

  console.log("✅ Predictions mapped to episodes:", predictions.slice(0, 2));
  return predictions;
}
