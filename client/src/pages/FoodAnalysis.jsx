import { useEffect, useRef, useState } from "react";
import FoodImageUpload from "../components/FoodImageUpload";
import AnalyzeButton from "../components/AnalyzeButton";
import FoodAnalysisResult from "../components/FoodAnalysisResult";
import { analyzeFoodImage } from "../services/aiAnalysisService";
import "../styles/food-analysis.css";

// Roughly maps the stepper's 6 steps onto the mock service's delay.
const STEP_INTERVAL_MS = 280;

const FoodAnalysis = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [stepperStep, setStepperStep] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const stepIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [previewUrl]);

  const handleImageSelect = (file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus("idle");
    setResult(null);
  };

  const handleImageRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
    setStatus("idle");
    setResult(null);
  };

  const runAnalysis = async () => {
    if (!image) return;
    setStatus("loading");
    setErrorMessage("");
    setStepperStep(0);

    stepIntervalRef.current = setInterval(() => {
      setStepperStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, STEP_INTERVAL_MS);

    try {
      const analysis = await analyzeFoodImage(image);
      clearInterval(stepIntervalRef.current);
      setStepperStep(5);
      setResult(analysis);
      setStatus("success");
    } catch (err) {
      clearInterval(stepIntervalRef.current);
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="fa-page">
      <header className="fa-page__header">
        <h1 className="fa-page__title">AI Food Analysis</h1>
        <p className="fa-page__subtitle">
          Upload a photo of your food and let FoodSaver AI analyze its freshness and expiry.
        </p>
      </header>

      <section className="fa-page__upload-section">
        <FoodImageUpload
          image={image}
          previewUrl={previewUrl}
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
        />
        <AnalyzeButton
          status={status === "loading" ? "loading" : status === "success" ? "complete" : "idle"}
          hasImage={Boolean(image)}
          onClick={runAnalysis}
        />
      </section>

      <FoodAnalysisResult
        status={status}
        stepperStep={stepperStep}
        result={result}
        errorMessage={errorMessage}
        onRetry={runAnalysis}
      />
    </div>
  );
};

export default FoodAnalysis;
