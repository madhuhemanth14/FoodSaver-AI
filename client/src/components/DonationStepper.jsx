import React from "react";

const DEFAULT_STEPS = ["Food Details", "AI Analysis", "Review", "Complete"];

/**
 * DonationStepper
 * Visual multi-step progress indicator used at the top of the Donate Food
 * flow. `currentStep` is 1-indexed.
 *
 * Props:
 *  - currentStep: number (1-based index of the active step)
 *  - steps: string[] (optional, defaults to the 4 donation flow steps)
 */
export default function DonationStepper({ currentStep = 1, steps = DEFAULT_STEPS }) {
  return (
    <nav className="fs-stepper" aria-label="Donation progress">
      {steps.map((label, index) => {
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
            <span className="fs-step-circle">{isDone ? "✓" : stepNumber}</span>
            <span className="fs-step-label">{label}</span>
          </div>
        );
      })}
    </nav>
  );
}
