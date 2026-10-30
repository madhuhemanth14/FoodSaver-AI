import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rolePrefix } from "../utils/roles";
import DonationStepper from "../components/DonationStepper";
import DonationForm from "../components/DonationForm";
import AIAnalysisCard from "../components/AIAnalysisCard";
import DonationReview from "../components/DonationReview";
import donationService from "../services/donationService";
import { analyzeFoodImage } from "../services/aiAnalysisService";
import { Sparkles, Heart, ArrowLeft, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Check } from "lucide-react";
import BackButton from "../components/common/BackButton";
import "../styles/donation-theme.css";
import "../styles/donation-components.css";
import "../styles/DonateFood.css";

const STEP_FOOD_DETAILS = 1;
const STEP_AI_ANALYSIS = 2;
const STEP_REVIEW = 3;

function buildAnalysisSignature(data) {
  const name = (data?.foodName || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!data?.category || !name) {
    return "";
  }

  // The AI result depends only on food type + food name (+ the photo, if one
  // is attached). Preparation date/time, quantity, unit and description are
  // deliberately excluded: they never need another AI call. Preparation
  // date/time only move the already-known shelf
  // -life on the calendar.
  const image = data.imageFile
    ? [data.imageFile.name, data.imageFile.size, data.imageFile.lastModified].join(":")
    : "no-image";

  return [data.category, name, image].join("|");
}

function addHoursToPreparation(preparationDate, preparationTime, hours) {
  if (!preparationDate || !preparationTime || !Number.isFinite(Number(hours))) {
    return { date: "", time: "", iso: "" };
  }

  const start = new Date(`${preparationDate}T${preparationTime}:00`);
  if (Number.isNaN(start.getTime())) {
    return { date: "", time: "", iso: "" };
  }

  const expiry = new Date(start.getTime() + Number(hours) * 60 * 60 * 1000);
  const pad = (value) => String(value).padStart(2, "0");

  const date = `${expiry.getFullYear()}-${pad(expiry.getMonth() + 1)}-${pad(expiry.getDate())}`;
  const time = `${pad(expiry.getHours())}:${pad(expiry.getMinutes())}`;

  return {
    date,
    time,
    iso: expiry.toISOString(),
  };
}

export default function DonateFood() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);

  const [step, setStep] = useState(STEP_FOOD_DETAILS);
  const [formData, setFormData] = useState(null);
  const [liveFormData, setLiveFormData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  // Raw AI result: identification, freshness and shelf-life DURATION only.
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");
  const [confirming, setConfirming] = useState(false);
  // Signature of the analysis whose photo/entry mismatch the donor confirmed.
  const [conflictConfirmedFor, setConflictConfirmedFor] = useState("");
  // Human-in-the-loop donor confirmation: AI provides an advisory hint, donor verifies.
  const [donorConfirmedFreshness, setDonorConfirmedFreshness] = useState(false);
  const [physicalChecks, setPhysicalChecks] = useState({
    appearanceNormal: true,
    odorNormal: true,
    temperatureMaintained: true,
  });

  const analysisSignatureRef = useRef("");
  const aiRequestIdRef = useRef(0);
  const latestFormRef = useRef(null);

  const current = liveFormData || formData;
  latestFormRef.current = current;

  // Expiry = preparation date/time + AI shelf-life. Pure local arithmetic, so
  // changing the preparation date/time updates it instantly with no AI call.
  const aiAnalysis = useMemo(() => {
    if (!aiResult) return null;
    const expiry = addHoursToPreparation(
      current?.preparationDate,
      current?.preparationTime,
      aiResult.remainingHours
    );
    return {
      ...aiResult,
      predictedExpiry: expiry.iso || null,
      predictedExpiryDate: expiry.date,
      predictedExpiryTime: expiry.time,
    };
  }, [aiResult, current?.preparationDate, current?.preparationTime]);

  const enrichedAiAnalysis = useMemo(() => {
    if (!aiAnalysis) return null;
    return {
      ...aiAnalysis,
      donorConfirmedFreshness,
      donorConfirmedAt: donorConfirmedFreshness ? (aiAnalysis.donorConfirmedAt || new Date().toISOString()) : null,
      donorPhysicalCheck: physicalChecks,
    };
  }, [aiAnalysis, donorConfirmedFreshness, physicalChecks]);

  const expiry = {
    date: aiAnalysis?.predictedExpiryDate || "",
    time: aiAnalysis?.predictedExpiryTime || "",
  };

  const runAnalysis = async (data, force = false) => {
    const signature = buildAnalysisSignature(data);
    if (!signature || (!force && signature === analysisSignatureRef.current)) {
      return;
    }

    analysisSignatureRef.current = signature;
    const requestId = ++aiRequestIdRef.current;

    setAiLoading(true);
    setAiError("");

    try {
      const result = await analyzeFoodImage(
        data.imageFile || null,
        data.preparationDate,
        data.preparationTime,
        { foodName: data.foodName, category: data.category }
      );

      if (requestId !== aiRequestIdRef.current) return;

      setAiResult({ ...result, signature });
      setAiLoading(false);
    } catch (err) {
      if (requestId !== aiRequestIdRef.current) return;

      // Allow a retry for the same inputs.
      analysisSignatureRef.current = "";
      setAiError(err.message || "AI analysis failed. Please try again.");
      setAiLoading(false);
    }
  };

  // Automatic analysis: as soon as food type, food name, preparation date and
  // preparation time are all filled in (debounced while the donor types).
  // Re-runs only when the food type / name / photo change, never for a
  // preparation date/time, quantity, unit or description edit.
  const liveSignature = buildAnalysisSignature(liveFormData);
  const hasPrepTimestamp = !!(liveFormData?.preparationDate && liveFormData?.preparationTime);

  useEffect(() => {
    if (!liveSignature || !hasPrepTimestamp) return undefined;

    const timer = setTimeout(() => {
      runAnalysis(latestFormRef.current);
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSignature, hasPrepTimestamp]);

  const handleLiveFormChange = (data) => {
    setLiveFormData(data);

    const signature = buildAnalysisSignature(data);

    // Food type / name / photo changed (or were cleared): the previous result
    // no longer applies. Drop it and cancel any request still in flight.
    if (signature !== analysisSignatureRef.current) {
      aiRequestIdRef.current += 1;
      analysisSignatureRef.current = "";
      setAiResult(null);
      setAiError("");
      setAiLoading(false);
    }
  };

  const conflictPending =
    !!aiAnalysis &&
    aiAnalysis.hasImage &&
    aiAnalysis.imageMatchesEntry === false &&
    conflictConfirmedFor !== aiAnalysis.signature;

  const handleFormSubmit = (data) => {
    setFormData(data);
    setLiveFormData(data);
    setStep(STEP_AI_ANALYSIS);
  };

  const handleContinueToReview = () => {
    if (!aiAnalysis || !donorConfirmedFreshness) return;
    setStep(STEP_REVIEW);
  };

  const handleEditDetails = () => {
    setStep(STEP_FOOD_DETAILS);
  };

  const handleConfirmDonation = () => {
    setConfirming(true);
    donationService
      .createDonation({ ...formData, aiAnalysis: enrichedAiAnalysis })
      .then((created) => {
        setConfirming(false);
        try {
          sessionStorage.setItem("fs_last_donation", JSON.stringify(created));
        } catch {}
        navigate(`${base}/donations/success`, { state: { donation: created } });
      })
      .catch(() => setConfirming(false));
  };

  const retryAnalysis = () => {
    const data = latestFormRef.current;
    if (!data) return;
    analysisSignatureRef.current = "";
    setAiResult(null);
    setAiError("");
    runAnalysis(data, true);
  };

  const stepperValue = step === STEP_REVIEW ? 3 : step;

  return (
    <div className="fs-module fs-donate-page">
      <div className="fs-container">
        <BackButton
          to={`${base}/dashboard`}
          onClick={
            step === STEP_REVIEW
              ? handleEditDetails
              : step === STEP_AI_ANALYSIS
                ? handleEditDetails
                : undefined
          }
        />

        <div className="fs-page-header">
          <div className="fs-header-badge">
            <Sparkles size={14} className="fs-sparkle-gold" />
            <span>Smart Food Sharing Platform</span>
          </div>
          <h1>Share Food. Spread Hope.</h1>
          <p className="fs-subtitle">
            Your extra food can become someone's next meal — safe, verified, and timely.
          </p>
          <span className="fs-impact-note">
            <Heart size={14} className="fs-impact-heart" />
            Every donation helps reduce food waste and feed local communities.
          </span>
        </div>

        <DonationStepper currentStep={stepperValue} />

        <div className="fs-donate-step-panel">
          {step === STEP_FOOD_DETAILS && (
            <DonationForm
              initialData={liveFormData || formData || undefined}
              onSubmit={handleFormSubmit}
              onLiveChange={handleLiveFormChange}
              aiLoading={aiLoading}
              aiError={aiError}
              aiAnalysis={aiAnalysis}
              expiry={expiry}
              conflictPending={conflictPending}
              onKeepEntry={() => aiAnalysis && setConflictConfirmedFor(aiAnalysis.signature)}
              onRetry={retryAnalysis}
            />
          )}

          {step === STEP_AI_ANALYSIS && (
            <div className="fs-ai-step-view fs-fade-in">
              {aiLoading && (
                <div className="fs-ai-step-loading" aria-live="polite">
                  <div className="fs-spinner fs-spinner-green" />
                  <p>FoodSaver AI is estimating freshness &amp; safe shelf life…</p>
                </div>
              )}

              <AIAnalysisCard
                result={aiAnalysis}
                preparationDate={formData?.preparationDate}
                preparationTime={formData?.preparationTime}
              />

              {/* Human-in-the-Loop Donor Freshness Confirmation Card */}
              {!aiLoading && aiAnalysis && (
                <div className="fs-donor-conf-card fs-fade-in" role="region" aria-label="Donor Freshness Confirmation">
                  <div className="fs-donor-conf-header">
                    <div className="fs-donor-conf-pill">
                      <ShieldCheck size={15} />
                      <span>Human-in-the-Loop Verification</span>
                    </div>
                    <h3>Physical Inspection &amp; Freshness Confirmation</h3>
                    <p className="fs-donor-conf-desc">
                      AI freshness is an advisory hint. In accordance with food safety practices, please verify your physical inspection before publishing to NGOs:
                    </p>
                  </div>

                  <div className="fs-physical-checks-list">
                    <label className="fs-check-item">
                      <input
                        type="checkbox"
                        checked={physicalChecks.appearanceNormal}
                        onChange={(e) =>
                          setPhysicalChecks((prev) => ({ ...prev, appearanceNormal: e.target.checked }))
                        }
                      />
                      <span>
                        <strong>Visual Appearance:</strong> Natural color, no visible mold, discoloration, slime, or drying.
                      </span>
                    </label>

                    <label className="fs-check-item">
                      <input
                        type="checkbox"
                        checked={physicalChecks.odorNormal}
                        onChange={(e) =>
                          setPhysicalChecks((prev) => ({ ...prev, odorNormal: e.target.checked }))
                        }
                      />
                      <span>
                        <strong>Odor &amp; Scent:</strong> Clean and characteristic smell; free from sour, pungent, or rancid odors.
                      </span>
                    </label>

                    <label className="fs-check-item">
                      <input
                        type="checkbox"
                        checked={physicalChecks.temperatureMaintained}
                        onChange={(e) =>
                          setPhysicalChecks((prev) => ({ ...prev, temperatureMaintained: e.target.checked }))
                        }
                      />
                      <span>
                        <strong>Safe Storage:</strong> Stored and handled under safe temperature conditions (hot or chilled).
                      </span>
                    </label>
                  </div>

                  <div className="fs-donor-confirm-agree">
                    <label className="fs-donor-agree-label">
                      <input
                        type="checkbox"
                        id="donor-confirm-freshness-input"
                        checked={donorConfirmedFreshness}
                        onChange={(e) => setDonorConfirmedFreshness(e.target.checked)}
                      />
                      <span className="fs-donor-agree-text">
                        I confirm that I have physically inspected this food and verify it is fresh, hygienic, and safe for human consumption.
                      </span>
                    </label>
                  </div>

                  {!donorConfirmedFreshness && (
                    <p className="fs-donor-required-note">
                      * Please complete the physical inspection confirmation above to unlock review and submission.
                    </p>
                  )}
                </div>
              )}

              {!aiLoading && aiError && (
                <div className="fs-ai-step-actions fs-ai-step-actions--error" role="alert">
                  <div className="fs-ai-error-banner">
                    <AlertCircle size={18} />
                    <p className="fs-ai-error">{aiError}</p>
                  </div>
                  <div className="fs-ai-error-btns">
                    <button type="button" className="fs-btn fs-btn-secondary" onClick={handleEditDetails}>
                      <ArrowLeft size={16} /> Edit Details
                    </button>
                    <button type="button" className="fs-btn fs-btn-primary" onClick={retryAnalysis}>
                      <RefreshCw size={16} /> Try Again
                    </button>
                  </div>
                </div>
              )}

              {!aiLoading && conflictPending && (
                <div className="fs-ai-step-actions fs-ai-step-actions--conflict" role="alert">
                  <p className="fs-ai-error">
                    Your photo looks like "{aiAnalysis.identifiedFoodName}", but you entered "{formData?.foodName}". Please confirm which is correct.
                  </p>
                  <button type="button" className="fs-btn fs-btn-secondary" onClick={handleEditDetails}>
                    <ArrowLeft size={16} /> Review food details
                  </button>
                </div>
              )}

              {!aiLoading && aiAnalysis && (
                <div className="fs-ai-step-nav-bar">
                  <button
                    type="button"
                    className="fs-btn fs-btn-secondary"
                    onClick={handleEditDetails}
                  >
                    <ArrowLeft size={16} /> Back to Details
                  </button>
                  <button
                    type="button"
                    className="fs-btn fs-btn-primary"
                    onClick={handleContinueToReview}
                    disabled={conflictPending || !donorConfirmedFreshness}
                    title={!donorConfirmedFreshness ? "Please confirm your physical inspection before proceeding" : ""}
                  >
                    <span>Continue to Review</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === STEP_REVIEW && formData && (
            <DonationReview
              donation={{ ...formData, aiAnalysis: enrichedAiAnalysis }}
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
