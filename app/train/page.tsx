"use client";
import { useState } from "react";
import * as tf from "@tensorflow/tfjs";
import UploadForm from "./UploadForm";
import Header from "../components/Header";
import { runUnsupervisedClusteringTF } from "../ml-pipeline/unsupervisedCluster";
import {
  trainSupervisedModel,
  trainClusterBasedModel,
  crossValidateSupervisedModel,
  exportModelAndScaler,
} from "../ml-pipeline/supervisedTrainer";

interface TrainOutput {
  model: tf.Sequential;
  scaler: any;
  history: tf.History;
  k?: number; // optional, only set for cluster-based training
  metrics: {
    perClass: { precision: number; recall: number; f1: number }[];
    weightedPrecision: number;
    weightedRecall: number;
    weightedF1: number;
    macroPrecision: number;
    macroRecall: number;
    macroF1: number;
    labelNames: string[];
    classCounts: number[];
    confusionMatrix: number[][];
    testAccuracy: number;
  };
}

interface CrossValidationResult {
  avg: {
    weightedPrecision: number;
    weightedRecall: number;
    weightedF1: number;
    macroPrecision: number;
    macroRecall: number;
    macroF1: number;
  };
  folds: {
    perClass: { precision: number; recall: number; f1: number }[];
    weightedPrecision: number;
    weightedRecall: number;
    weightedF1: number;
    macroPrecision: number;
    macroRecall: number;
    macroF1: number;
    confusionMatrix: number[][];
  }[];
}

export default function TrainPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [training, setTraining] = useState(false);
  const [trainOutput, setTrainOutput] = useState<TrainOutput | null>(null);
  const [cvResult, setCvResult] = useState<CrossValidationResult | null>(null);
  const [cvRunning, setCvRunning] = useState(false);

  // --- CSV parsing ---
  async function parseCSV(file: File) {
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const headers = lines[0].split(",");
    const episodes = lines.slice(1).map((line) => {
      const values = line.split(",");
      const ep: any = {};
      headers.forEach((h, i) => {
        ep[h] = values[i];
      });
      return ep;
    });
    return episodes;
  }

  // --- Supervised training by CSV ---
  async function handleTrainFromCSV(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    setTraining(true);
    const allEpisodes = await parseCSV(file);

    // Save parsed episodes for later use (CV, clustering, hybrid training)
    setRows(allEpisodes);

    const output = await trainSupervisedModel(allEpisodes, "direction");
    setTrainOutput(output as TrainOutput);
    setTraining(false);
  }

  // --- Run clustering (no auto-training) ---
  async function handleCluster() {
    if (rows.length === 0) return;
    const { results } = await runUnsupervisedClusteringTF(rows, [3, 4, 5, 6]);
    setResults(results);
  }

  // --- Train hybrid by chosen cluster ---
  async function handleTrainHybrid(k: number) {
    setTraining(true);
    const output = await trainClusterBasedModel(rows, [k]);
    setTrainOutput(output as TrainOutput);
    setTraining(false);
  }

  async function handleCrossValidation() {
    if (rows.length === 0) {
      alert("Please upload a CSV first.");
      return;
    }
    setCvRunning(true);
    const result = await crossValidateSupervisedModel(rows, "direction", 5);
    setCvResult(result);
    setCvRunning(false);
  }

  return (
    <div className="bg-[#1e1e1e] text-white max-w-screen min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <div className="flex flex-col w-full h-full items-start justify-start p-6 gap-8 overflow-x-hidden">
        <h1 className="text-3xl font-bold">Training</h1>
        {/* <UploadForm onUpload={setRows} /> */}

        {/* Step 2: Clustering */}
        {/* Step: Unsupervised / Hybrid */}
        <div className="bg-[#2c2c2c] rounded-lg shadow-md space-y-4 w-full p-6">
          <h2 className="text-xl font-semibold">
            Step: Unsupervised / Hybrid Training
          </h2>

          {/* Upload CSV */}
          <UploadForm onUpload={setRows} />

          {/* Run clustering */}
          <button
            onClick={handleCluster}
            className="mt-4 px-2 py-1 cursor-pointer hover:opacity-50 bg-blue-600 transition rounded text-white font-medium"
          >
            Run Clustering (k=3,4,5,6)
          </button>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-6 space-y-6">
              {results.map((res: any) => (
                <div key={res.k} className="border border-gray-700 rounded p-3">
                  <h3 className="text-lg font-semibold mb-2">
                    Results for k={res.k}
                  </h3>

                  {/* Cluster profiles table */}
                  <div className="overflow-x-auto">
                    <table className="table-auto border-collapse text-xs w-full">
                      <thead className="bg-gray-900 text-gray-300">
                        <tr>
                          {Object.keys(res.profiles[0]).map((header) => (
                            <th key={header} className="border px-2 py-1">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(res.profiles).map(
                          ([cluster, s]: any, i) => (
                            <tr
                              key={cluster}
                              className={
                                i % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                              }
                            >
                              {Object.values(s).map((val: any, j) => (
                                <td key={j} className="border px-2 py-1">
                                  {typeof val === "number"
                                    ? Number.isNaN(val)
                                      ? "-"
                                      : val.toFixed(2)
                                    : String(val)}
                                </td>
                              ))}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Train hybrid button */}
                  <button
                    onClick={() => handleTrainHybrid(res.k)}
                    className="mt-2 px-2 py-1 bg-green-600 hover:bg-green-700 transition rounded text-white font-medium"
                  >
                    Train Hybrid by Cluster (k={res.k})
                  </button>

                  {/* Results under train button */}
                  {/* Results under train button */}
                  {trainOutput && trainOutput.k === res.k && (
                    <div className="mt-4">
                      <h4 className="font-semibold">
                        Hybrid Training Results (k={res.k})
                      </h4>

                      <h5 className="mt-2 font-semibold">Confusion Matrix:</h5>
                      <table className="text-xs bg-gray-900 p-3 rounded mb-4">
                        <thead>
                          <tr>
                            <th>True \ Pred</th>
                            {trainOutput.metrics.labelNames.map((name, j) => (
                              <th key={j}>{name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {trainOutput.metrics.confusionMatrix.map((row, i) => (
                            <tr key={i}>
                              <td>{trainOutput.metrics.labelNames[i]}</td>
                              {row.map((val, j) => (
                                <td key={j}>{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <h5 className="mt-2 font-semibold">Weighted Metrics:</h5>
                      <p>
                        Precision:{" "}
                        {(trainOutput.metrics.weightedPrecision * 100).toFixed(
                          2
                        )}
                        %
                      </p>
                      <p>
                        Recall:{" "}
                        {(trainOutput.metrics.weightedRecall * 100).toFixed(2)}%
                      </p>
                      <p>
                        F1 Score:{" "}
                        {(trainOutput.metrics.weightedF1 * 100).toFixed(2)}%
                      </p>

                      <h5 className="mt-2 font-semibold">Macro Metrics:</h5>
                      <p>
                        Precision:{" "}
                        {(trainOutput.metrics.macroPrecision * 100).toFixed(2)}%
                      </p>
                      <p>
                        Recall:{" "}
                        {(trainOutput.metrics.macroRecall * 100).toFixed(2)}%
                      </p>
                      <p>
                        F1 Score:{" "}
                        {(trainOutput.metrics.macroF1 * 100).toFixed(2)}%
                      </p>

                      <h5 className="mt-2 font-semibold">Per-Class Metrics:</h5>
                      <table className="text-xs bg-gray-900 p-3 rounded mb-4">
                        <thead>
                          <tr>
                            <th>Class</th>
                            <th>Precision</th>
                            <th>Recall</th>
                            <th>F1</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainOutput.metrics.perClass.map((m, idx) => (
                            <tr key={idx}>
                              <td>{trainOutput.metrics.labelNames[idx]}</td>
                              <td>{(m.precision * 100).toFixed(2)}%</td>
                              <td>{(m.recall * 100).toFixed(2)}%</td>
                              <td>{(m.f1 * 100).toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Supervised Training */}
        <div className="w-full bg-[#2c2c2c] rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            Step 3: Run Supervised Training
          </h2>

          <input
            type="file"
            accept=".csv"
            onChange={handleTrainFromCSV}
            className="block cursor-pointer w-full text-sm text-gray-300
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-600 file:text-white
               hover:file:opacity-50"
          />

          {training && (
            <p className="mt-2 text-yellow-400">Training model...</p>
          )}

          {trainOutput && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Training Results</h3>

              {/* 🔽 New: Download button */}
              <button
                onClick={() => exportModelAndScaler(trainOutput)}
                className="mt-4 px-3 py-2 bg-green-600 hover:bg-green-700 transition rounded text-white font-medium"
              >
                Download Model + Scaler
              </button>

              {/* Training curves */}
              <h4 className="font-semibold mt-4">Training Curves:</h4>
              <pre className="text-xs bg-gray-900 p-3 rounded mb-4 overflow-x-auto">
                {JSON.stringify(trainOutput.history.history, null, 2)}
              </pre>

              {/* Confusion Matrix */}
              <h4 className="font-semibold mt-4">Confusion Matrix:</h4>
              <table className="text-xs bg-gray-900 p-3 rounded mb-4">
                <thead>
                  <tr>
                    <th>True \ Pred</th>
                    {trainOutput.metrics.labelNames.map((name, j) => (
                      <th key={j}>{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trainOutput.metrics.confusionMatrix.map((row, i) => (
                    <tr key={i}>
                      <td>{trainOutput.metrics.labelNames[i]}</td>
                      {row.map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Class counts */}
              <h4 className="font-semibold mt-4">Class Counts:</h4>
              <ul>
                {trainOutput.metrics.labelNames.map((name, idx) => (
                  <li key={idx}>
                    {name}: {trainOutput.metrics.classCounts[idx]} samples
                  </li>
                ))}
              </ul>

              {/* Weighted Metrics */}
              <h4 className="font-semibold mt-4">Weighted Metrics:</h4>
              <p>
                Precision:{" "}
                {(trainOutput.metrics.weightedPrecision * 100).toFixed(2)}%
              </p>
              <p>
                Recall: {(trainOutput.metrics.weightedRecall * 100).toFixed(2)}%
              </p>
              <p>
                F1 Score: {(trainOutput.metrics.weightedF1 * 100).toFixed(2)}%
              </p>

              {/* Macro Metrics */}
              <h4 className="font-semibold mt-4">Macro Metrics:</h4>
              <p>
                Precision:{" "}
                {(trainOutput.metrics.macroPrecision * 100).toFixed(2)}%
              </p>
              <p>
                Recall: {(trainOutput.metrics.macroRecall * 100).toFixed(2)}%
              </p>
              <p>F1 Score: {(trainOutput.metrics.macroF1 * 100).toFixed(2)}%</p>

              {/* Per-Class Metrics */}
              <h4 className="font-semibold mt-4">Per-Class Metrics:</h4>
              <table className="text-xs bg-gray-900 p-3 rounded mb-4">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1</th>
                  </tr>
                </thead>
                <tbody>
                  {trainOutput.metrics.perClass.map((m, idx) => (
                    <tr key={idx}>
                      <td>{trainOutput.metrics.labelNames[idx]}</td>
                      <td>{(m.precision * 100).toFixed(2)}%</td>
                      <td>{(m.recall * 100).toFixed(2)}%</td>
                      <td>{(m.f1 * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* cross validation */}
        <div className="bg-[#2c2c2c] rounded-lg shadow-md p-6 space-y-4 w-full">
          <h2 className="text-xl font-semibold">Cross-Validation</h2>
          <button
            onClick={handleCrossValidation}
            className="px-2 py-1 cursor-pointer hover:opacity-50 bg-blue-600 transition rounded text-white font-medium"
          >
            Run 5-Fold Cross Validation
          </button>

          {cvRunning && (
            <p className="mt-2 text-yellow-400">Running cross-validation...</p>
          )}

          {cvResult && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Average Metrics</h3>
              <p>
                Weighted Precision:{" "}
                {(cvResult.avg.weightedPrecision * 100).toFixed(2)}%
              </p>
              <p>
                Weighted Recall:{" "}
                {(cvResult.avg.weightedRecall * 100).toFixed(2)}%
              </p>
              <p>Weighted F1: {(cvResult.avg.weightedF1 * 100).toFixed(2)}%</p>
              <p>
                Macro Precision:{" "}
                {(cvResult.avg.macroPrecision * 100).toFixed(2)}%
              </p>
              <p>
                Macro Recall: {(cvResult.avg.macroRecall * 100).toFixed(2)}%
              </p>
              <p>Macro F1: {(cvResult.avg.macroF1 * 100).toFixed(2)}%</p>

              <h3 className="text-lg font-semibold mt-4">Per-Fold Metrics</h3>
              {cvResult.folds.map((fold, idx) => (
                <div key={idx} className="mb-4">
                  <h4 className="font-semibold">Fold {idx + 1}</h4>
                  <p>
                    Weighted Precision:{" "}
                    {(fold.weightedPrecision * 100).toFixed(2)}%
                  </p>
                  <p>
                    Weighted Recall: {(fold.weightedRecall * 100).toFixed(2)}%
                  </p>
                  <p>Weighted F1: {(fold.weightedF1 * 100).toFixed(2)}%</p>
                  <p>
                    Macro Precision: {(fold.macroPrecision * 100).toFixed(2)}%
                  </p>
                  <p>Macro Recall: {(fold.macroRecall * 100).toFixed(2)}%</p>
                  <p>Macro F1: {(fold.macroF1 * 100).toFixed(2)}%</p>
                  <pre className="text-xs bg-gray-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(fold.confusionMatrix, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
