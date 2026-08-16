import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DonationStepper from "../components/DonationStepper";
import DonationForm from "../components/DonationForm";
import AIAnalysisCard from "../components/AIAnalysisCard";
import DonationReview from "../components/DonationReview";
import donationService from "../services/donationService";
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
  const [step, setStep] = useState(STEP_FOOD_DETAILS);
  const [formData, setFormData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Kick off the mock AI analysis once the user submits the food details form.
  useEffect(() => {
    if (step !== STEP_AI_ANALYSIS || !formData || aiAnalysis) return;

    let cancelled = false;
    setAiLoading(true);

    donationService
      .analyzeFoodImage(formData.imageFile, {
        foodName: formData.foodName,
        declaredExpiryDate: formData.expiryDate,
      })
      .then((result) => {
        if (!cancelled) {
          setAiAnalysis(result);
          setAiLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, formData]);

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
        navigate("/donations/success", { state: { donation: created } });
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
              <AIAnalysisCard loading={aiLoading} analysis={aiAnalysis} />
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
