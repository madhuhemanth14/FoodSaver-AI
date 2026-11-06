// Automated tests for Ticket 4: Food Freshness Evaluation Experiment
// Verifies:
//   1. Evaluation dataset schema integrity, sample size, and cross-category representation
//   2. Evaluation metric calculation engine (accuracy, confusion matrix, MAE)
//   3. Detection and accounting of the critical False Safe Rate (Type II error)
//   4. Detection and accounting of the False Spoilage Rate (Type I error)

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { calculateMetrics, runEvaluation } = require("../eval/evaluate-freshness");

const DATASET_PATH = path.join(__dirname, "../eval/dataset.json");

test("Ticket 4 Dataset: contains >= 20 curated samples with all required fields", () => {
  assert.ok(fs.existsSync(DATASET_PATH), "dataset.json must exist in server/eval/");
  const samples = JSON.parse(fs.readFileSync(DATASET_PATH, "utf-8"));

  assert.ok(Array.isArray(samples));
  assert.ok(samples.length >= 20, `Dataset must have at least 20 samples, found ${samples.length}`);

  const requiredFields = [
    "id",
    "foodName",
    "category",
    "storageCondition",
    "elapsedHours",
    "visualObservations",
    "groundTruthFreshness",
    "groundTruthSafeToConsume",
    "groundTruthRemainingHours",
    "aiPredictedFreshness",
    "aiPredictedSafeToConsume",
    "aiPredictedRemainingHours",
  ];

  const categories = new Set();
  for (const item of samples) {
    for (const f of requiredFields) {
      assert.ok(item[f] !== undefined, `Sample ${item.id} missing field '${f}'`);
    }
    categories.add(item.category);
  }

  // Ensure broad food category coverage
  const expectedCategories = ["Cooked Meal", "Dairy", "Bakery", "Fruit", "Vegetable", "Meat/Seafood"];
  for (const cat of expectedCategories) {
    assert.ok(categories.has(cat), `Category '${cat}' must be represented in evaluation dataset`);
  }
});

test("Ticket 4 Evaluation Engine: computes accurate confusion matrix and safety rates", () => {
  const samples = JSON.parse(fs.readFileSync(DATASET_PATH, "utf-8"));
  const report = calculateMetrics(samples);

  assert.equal(typeof report.accuracy, "number");
  assert.ok(report.accuracy >= 70 && report.accuracy <= 100);
  assert.ok(report.maeHours >= 0);

  // Check confusion matrix totals
  let matrixTotal = 0;
  ["Fresh", "Ripe", "Moderate", "Spoiled"].forEach((row) => {
    ["Fresh", "Ripe", "Moderate", "Spoiled"].forEach((col) => {
      matrixTotal += report.confusionMatrix[row][col];
    });
  });
  assert.equal(matrixTotal, samples.length, "Confusion matrix sum must equal sample count");

  // Check safety risk metrics
  assert.ok(
    report.safetyAnalysis.falseSafeDetections >= 1,
    "Experiment must identify dangerous false safe predictions (Type II error)"
  );
  assert.ok(
    report.safetyAnalysis.falseSpoilageDetections >= 1,
    "Experiment must identify false spoilage waste predictions (Type I error)"
  );
  assert.ok(report.criticalFindings.length >= 2, "Report must document at least 2 vulnerability patterns");
});

test("Ticket 4 Runner: generates and persists evaluation-report.json", () => {
  const report = runEvaluation();
  const reportPath = path.join(__dirname, "../eval/evaluation-report.json");
  assert.ok(fs.existsSync(reportPath), "evaluation-report.json must be written");

  const loaded = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  assert.equal(loaded.totalSamples, report.totalSamples);
  assert.equal(loaded.accuracy, report.accuracy);
});
