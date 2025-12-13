import { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { StandardScaler } from "@/app/ml-pipeline/featureBuilder";

export function useLoadModel() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [scaler, setScaler] = useState<StandardScaler | null>(null);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    async function loadModelFromPublic() {
      try {
        const loadedModel = await tf.loadLayersModel(
          "/models/supervised-model.json"
        );
        setModel(loadedModel);
        console.log("✅ Model loaded from /public/models");

        const res = await fetch("/models/scaler.json");
        const scalerData = await res.json();

        const loadedScaler = StandardScaler.fromJSON({
          means: scalerData.means,
          stds: scalerData.stds,
        });
        setScaler(loadedScaler);

        setLabels(scalerData.labelNames);

        console.log("✅ Scaler + labels loaded:", {
          labelNames: scalerData.labelNames,
          meansLength: loadedScaler.means?.length,
          stdsLength: loadedScaler.stds?.length,
        });
      } catch (err) {
        console.error("❌ Error loading model/scaler:", err);
      }
    }

    loadModelFromPublic();
  }, []);

  return { model, scaler, labels };
}
