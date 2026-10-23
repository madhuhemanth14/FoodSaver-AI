import React from "react";
import { Check } from "lucide-react";

const DEFAULT_STEPS = [
  { label: "Food Details", hint: "Items & quantities" },
  { label: "AI Analysis", hint: "Shelf-life estimate" },
  { label: "Review", hint: "Verify details" },
  { label: "Complete", hint: "Donation confirmed" },
];

/**
 * DonationStepper
 * Visual multi-step progress indicator used at the top of the Donate Food
 * flow. `currentStep` is 1-indexed.
 *
 * Props:
 *  - currentStep: number (1-based index of the active step)
 *  - steps: (string | { label: string, hint?: string })[] (optional)
 */
export default function DonationStepper({ currentStep = 1, steps = DEFAULT_STEPS }) {
  return (
    <nav className="fs-stepper" aria-label="Donation progress">
      {steps.map((item, index) => {
        const label = typeof item === "string" ? item : item.label;
        const hint = typeof item === "object" ? item.hint : undefined;
        const stepNumber = index + 1;
        const isDone = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div
            key={label}
            className={[
              "fs-step",
              isActive ? "fs-step-active" : "",
              isDone ? "fs-step-done" : "",
            ].join(" ").trim()}
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className={`fs-step-connector ${isDone ? "fs-step-connector-done" : ""}`}
              aria-hidden="true"
            />
            <div className="fs-step-circle-wrapper">
              <span className="fs-step-circle">
                {isDone ? <Check size={16} strokeWidth={2.5} /> : stepNumber}
              </span>
            </div>
            <div className="fs-step-text">
              <span className="fs-step-label">{label}</span>
              {hint && <span className="fs-step-hint">{hint}</span>}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
