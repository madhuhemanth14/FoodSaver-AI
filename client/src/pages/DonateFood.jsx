import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rolePrefix } from "../utils/roles";
import DonationStepper from "../components/DonationStepper";
import DonationForm from "../components/DonationForm";
import AIAnalysisCard from "../components/AIAnalysisCard";
import DonationReview from "../components/DonationReview";
import donationService from "../services/donationService";
import { analyzeFoodImage } from "../services/aiAnalysisService";
import "../styles/donation-theme.css";
import "../styles/donation-components.css";
import "../styles/DonateFood.css";

const STEP_FOOD_DETAILS = 1;
const STEP_AI_ANALYSIS = 2;
const STEP_REVIEW = 3;

/**
 * DonateFood (Member 3)
 * Orchestrates the donor-side donation flow:
 *   Food Details → AI Analysis → Review → Confirm → redirects to
 *   /donations/success with the created donation.
 *
 * This page owns the flow state; each step is a presentational
 * component. All persistence goes through donationService (mocked).
 */
export default function DonateFood() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);
  const [step, setStep] = useState(STEP_FOOD_DETAILS);
  const [formData, setFormData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState("");
  const [aiAttempt, setAiAttempt] = useState(0);
  const [confirming, setConfirming] = useState(false);

  // Real AI analysis (Google Gemini, via the backend) once the donor
  // submits the food details form and moves to this step. aiAttempt lets
  // the "Try Again" button re-run this without changing formData.
  useEffect(() => {
    if (step !== STEP_AI_ANALYSIS || !formData || aiAnalysis) return;

    let cancelled = false;
    setAiLoading(true);
    setAiError("");

    analyzeFoodImage(formData.imageFile)
      .then((result) => {
        if (!cancelled) {
          setAiAnalysis(result);
          setAiLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAiError(err.message || "AI analysis failed. Please try again.");
          setAiLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, formData, aiAttempt]);

  const handleFormSubmit = (data) => {
    setFormData(data);
    setAiAnalysis(null);
    setStep(STEP_AI_ANALYSIS);
  };

  const handleContinueToReview = () => {
    setStep(STEP_REVIEW);
  };

  const handleEditDetails = () => {
    setStep(STEP_FOOD_DETAILS);
  };

  const handleConfirmDonation = () => {
    setConfirming(true);
    donationService
      .createDonation({ ...formData, aiAnalysis })
      .then((created) => {
        setConfirming(false);
        navigate(`${base}/donations/success`, { state: { donation: created } });
      })
      .catch(() => setConfirming(false));
  };

  const stepperValue = step === STEP_REVIEW ? 3 : step;

  return (
    <div className="fs-module fs-donate-page">
      <div className="fs-container">
        <div className="fs-page-header">
          <h1>Share Food. Spread Hope.</h1>
          <p className="fs-subtitle">Your extra food can become someone's next meal.</p>
          <span className="fs-impact-note">
            🌱 Every donation helps reduce food waste and feed communities.
          </span>
        </div>

        <DonationStepper currentStep={stepperValue} />

        <div className="fs-donate-step-panel">
          {step === STEP_FOOD_DETAILS && (
            <DonationForm
              initialData={formData || undefined}
              onSubmit={handleFormSubmit}
            />
          )}

          {step === STEP_AI_ANALYSIS && (
            <>
              {aiLoading && (
                <div className="fs-ai-step-actions" aria-live="polite">
                  <p>Analyzing your food photo…</p>
                </div>
              )}
              <AIAnalysisCard result={aiAnalysis} />
              {!aiLoading && aiError && (
                <div className="fs-ai-step-actions" role="alert">
                  <p className="fs-ai-error">{aiError}</p>
                  <button
                    type="button"
                    className="fs-btn fs-btn-secondary"
                    onClick={() => {
                      setAiError("");
                      setAiAnalysis(null);
                      setAiAttempt((n) => n + 1);
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}
              {!aiLoading && aiAnalysis && (
                <div className="fs-ai-step-actions">
                  <button type="button" className="fs-btn fs-btn-primary" onClick={handleContinueToReview}>
                    Continue to Review
                  </button>
                </div>
              )}
            </>
          )}

          {step === STEP_REVIEW && formData && (
            <DonationReview
              donation={{ ...formData, aiAnalysis }}
              onEdit={handleEditDetails}
              onConfirm={handleConfirmDonation}
              submitting={confirming}
            />
          )}
        </div>
      </div>
    </div>
  );
}
