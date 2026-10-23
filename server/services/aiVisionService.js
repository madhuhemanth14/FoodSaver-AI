/**
 * Food shelf-life estimation (text, optionally with a photo) using Google Gemini 3.8 Flash.
 *
 * This service is the only place that talks to Gemini. The API key stays
 * server-side and is never sent to the browser.
 *
 * The model identifies the food and estimates a conservative shelf-life
 * duration. The backend then combines that duration with the donor's
 * preparation date/time to calculate the expiry timestamp.
 */

require("dotenv").config();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    isFood: { type: "boolean" },
    foodType: { type: "string" },
    category: {
      type: "string",
      enum: [
        "Fruit",
        "Vegetable",
        "Dairy",
        "Bakery",
        "Cooked Meal",
        "Grain",
        "Meat/Seafood",
        "Beverage",
        "Other",
      ],
    },
    freshness: {
      type: "string",
      enum: ["Fresh", "Ripe", "Moderate", "Spoiled"],
    },
    freshnessScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    remainingDays: {
      type: "integer",
      minimum: 0,
    },
    remainingHours: {
      type: "integer",
      minimum: 0,
    },
    identifiedFoodName: { type: "string" },
    imageMatchesEntry: { type: "boolean" },
    safeToConsume: { type: "boolean" },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
    recommendation: { type: "string" },
  },
  required: [
    "isFood",
    "foodType",
    "category",
    "freshness",
    "freshnessScore",
    "confidence",
    "remainingDays",
    "remainingHours",
    "safeToConsume",
    "warnings",
    "recommendation",
  ],
};

function buildPrompt(preparationDate, preparationTime, foodDetails = {}, hasImage = false) {
  const preparationContext = preparationDate
    ? `Preparation: ${preparationDate}${preparationTime ? ` at ${preparationTime}` : ""} (for context only).`
    : "No preparation timestamp was provided.";

  const donationContext = [
    foodDetails.category ? `Food type selected by donor: ${foodDetails.category}` : "",
    foodDetails.foodName ? `Food name entered by donor: ${foodDetails.foodName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const nameGiven = !!(foodDetails.foodName || "").trim();
  const imageRules = hasImage && !nameGiven
    ? `
IMAGE (provided, no name entered)
- Identify the food from the photo and set foodType and identifiedFoodName to that name.
- imageMatchesEntry = true. Judge visible freshness (mold, rot, discoloration, wilting, drying).`
    : hasImage
    ? `
IMAGE (provided)
- Use the photo to verify the donor's food and to judge VISIBLE freshness (mold, rot, discoloration, wilting, drying, contamination).
- The donor's entered food type and name are authoritative. Do NOT replace them. Set foodType to the donor's food name.
- identifiedFoodName = what the photo actually shows.
- imageMatchesEntry = false ONLY if the photo strongly conflicts with the entered food (e.g. entered "Cooked Rice", photo shows a pizza). Minor differences or ambiguity => true.
- If imageMatchesEntry is false, add a warning that says what the photo appears to show.
- Lower confidence for blur, poor lighting, or obstruction.`
    : `
NO IMAGE
- Base the estimate only on the donor's food type and food name.
- Set foodType to the donor's food name, identifiedFoodName to the same, imageMatchesEntry to true.
- Freshness is "Fresh" unless the food name itself implies otherwise (e.g. "spoiled", "stale").`;

  return `
You are FoodSaver-AI's conservative shelf-life estimation system for donated food.

TASK
Estimate how many hours the food stays safe to eat AFTER IT IS PREPARED, assuming normal storage (cooked food at room temperature unless stated).
${preparationContext}
${donationContext ? `\n${donationContext}` : ""}
${imageRules}

category: choose exactly one of Fruit, Vegetable, Dairy, Bakery, Cooked Meal, Grain, Meat/Seafood, Beverage, Other. Use the donor's selected food type when it fits.

SHELF LIFE
remainingHours is a DURATION counted from the preparation time, NOT from the current moment. The application adds it to the preparation timestamp itself.
- Be conservative and food-safety minded (e.g. cooked rice ~8 h, cooked curry ~8-12 h, bread ~72 h, cut fruit ~24 h).
- If clearly spoiled or unsafe: remainingHours = 0, remainingDays = 0, safeToConsume = false.
- remainingDays = complete 24-hour periods in remainingHours.
- Never claim microbiological safety; the result is an estimate.

freshnessScore: 90-100 very fresh, 75-89 fresh, 50-74 moderate, 1-49 deteriorated, 0 spoiled.
warnings: specific concerns, or [] if none.
recommendation: one short practical sentence for a food-bank volunteer.

Be deterministic: the same inputs must give the same answer.
Return ONLY valid JSON matching the schema.
`;
}

function validateAnalysis(parsed) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI analysis returned an invalid object.");
  }

  for (const field of ANALYSIS_SCHEMA.required) {
    if (!(field in parsed)) {
      throw new Error(
        `AI analysis response is missing required field "${field}".`
      );
    }
  }

  if (typeof parsed.isFood !== "boolean") {
    throw new Error("AI analysis returned an invalid isFood value.");
  }

  if (typeof parsed.foodType !== "string" || !parsed.foodType.trim()) {
    throw new Error("AI analysis returned an invalid foodType value.");
  }

  if (!ANALYSIS_SCHEMA.properties.category.enum.includes(parsed.category)) {
    throw new Error("AI analysis returned an invalid food category.");
  }

  if (!ANALYSIS_SCHEMA.properties.freshness.enum.includes(parsed.freshness)) {
    throw new Error("AI analysis returned an invalid freshness value.");
  }

  if (
    !Number.isInteger(parsed.freshnessScore) ||
    parsed.freshnessScore < 0 ||
    parsed.freshnessScore > 100
  ) {
    throw new Error("AI analysis returned an invalid freshness score.");
  }

  if (
    typeof parsed.confidence !== "number" ||
    parsed.confidence < 0 ||
    parsed.confidence > 1
  ) {
    throw new Error("AI analysis returned an invalid confidence value.");
  }

  if (!Number.isInteger(parsed.remainingHours) || parsed.remainingHours < 0) {
    throw new Error("AI analysis returned an invalid remainingHours value.");
  }

  if (!Number.isInteger(parsed.remainingDays) || parsed.remainingDays < 0) {
    throw new Error("AI analysis returned an invalid remainingDays value.");
  }

  if (typeof parsed.imageMatchesEntry !== "boolean") {
    parsed.imageMatchesEntry = true;
  }
  if (typeof parsed.identifiedFoodName !== "string" || !parsed.identifiedFoodName.trim()) {
    parsed.identifiedFoodName = parsed.foodType;
  }

  if (typeof parsed.safeToConsume !== "boolean") {
    throw new Error("AI analysis returned an invalid safeToConsume value.");
  }

  if (!Array.isArray(parsed.warnings)) {
    throw new Error("AI analysis returned an invalid warnings value.");
  }

  if (typeof parsed.recommendation !== "string") {
    throw new Error("AI analysis returned an invalid recommendation value.");
  }

  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Shown to the user whenever Gemini is temporarily unavailable. The raw
// provider error is only ever logged on the server.
const TEMPORARY_UNAVAILABLE_MESSAGE =
  "AI analysis service is temporarily unavailable. Please try again in a few seconds.";

const MAX_GEMINI_ATTEMPTS = 3;

// 429 / 502 / 503 / 504 are always temporary. 500 is retried only when the
// provider's message says it's overload / unavailability / a transient fault,
// so permanent 500s aren't hammered.
function isTemporaryGeminiError(status, details) {
  if ([429, 502, 503, 504].includes(status)) return true;
  if (status === 500) {
    return /overload|unavailable|busy|temporar|try again|internal error|high demand|capacity/i.test(
      details || ""
    );
  }
  return false;
}

function temporaryUnavailableError(status, technical, originalError) {
  const err = new Error(TEMPORARY_UNAVAILABLE_MESSAGE);
  err.code = "AI_TEMPORARILY_UNAVAILABLE";
  err.status = status || 503;
  err.temporary = true;
  err.technicalMessage = technical;
  if (originalError) err.originalError = originalError;
  return err;
}

async function requestGemini(body, apiKey) {
  const maxAttempts = MAX_GEMINI_ATTEMPTS;
  let lastStatus = 0;
  let lastDetails = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response;

    try {
      response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey.trim(),
        },
        body: JSON.stringify(body),
      });
    } catch (networkErr) {
      // Temporary network failure: retry with a short backoff.
      console.error(
        `Gemini network error (attempt ${attempt}/${maxAttempts}):`,
        networkErr.message
      );
      if (attempt < maxAttempts) {
        await sleep(1000 * attempt);
        continue;
      }

      throw temporaryUnavailableError(
        503,
        `Network failure reaching Gemini: ${networkErr.message}`,
        networkErr
      );
    }

    if (response.ok) {
      return response.json();
    }

    lastStatus = response.status;

    try {
      const errJson = await response.json();
      lastDetails = errJson?.error?.message || "";
    } catch {
      lastDetails = "";
    }

    const temporary = isTemporaryGeminiError(response.status, lastDetails);

    // Technical detail goes to the server log only.
    console.error(
      `Gemini request failed (HTTP ${response.status}, attempt ${attempt}/${maxAttempts}, ${
        temporary ? "temporary" : "permanent"
      }): ${lastDetails}`
    );

    // Short backoff between attempts (1.2s, then 2.4s), honouring a
    // Retry-After header but never waiting more than 5s.
    if (temporary && attempt < maxAttempts) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const delayMs =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 1200 * Math.pow(2, attempt - 1);

      await sleep(Math.min(delayMs, 5000));
      continue;
    }

    if (temporary) {
      // Retries exhausted: clean message for the user, details logged above.
      throw temporaryUnavailableError(
        lastStatus,
        `Gemini AI request failed (HTTP ${lastStatus})${lastDetails ? `: ${lastDetails}` : "."}`
      );
    }

    break;
  }

  const err = new Error(
    `Gemini AI request failed (HTTP ${lastStatus})${
      lastDetails ? `: ${lastDetails}` : "."
    }`
  );
  err.code = "AI_PROVIDER_ERROR";
  err.status = lastStatus;
  throw err;
}

async function analyzeFoodImage(
  buffer,
  mimeType,
  preparationDate,
  preparationTime,
  foodDetails = {}
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    const err = new Error(
      "AI analysis is not configured on the server (missing GEMINI_API_KEY)."
    );
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  const hasImage = !!buffer;

  if (hasImage && (!Buffer.isBuffer(buffer) || !mimeType)) {
    const err = new Error("The food image is invalid.");
    err.code = "AI_INVALID_IMAGE";
    throw err;
  }

  if (!hasImage && !(foodDetails.foodName || "").trim()) {
    const err = new Error("A food name is required when no image is provided.");
    err.code = "AI_INVALID_INPUT";
    throw err;
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: buildPrompt(
              preparationDate,
              preparationTime,
              foodDetails,
              hasImage
            ),
          },
          ...(hasImage
            ? [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: buffer.toString("base64"),
                  },
                },
              ]
            : []),
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
      temperature: 0,
      thinkingConfig: {
        thinkingLevel: "medium",
      },
    },
  };

  const data = await requestGemini(body, apiKey);

  const textPart = data?.candidates?.[0]?.content?.parts?.find(
    (part) => typeof part?.text === "string"
  )?.text;

  if (!textPart) {
    const err = new Error("Gemini returned an empty food-analysis response.");
    err.code = "AI_EMPTY_RESPONSE";
    throw err;
  }

  let parsed;

  try {
    parsed = JSON.parse(textPart);
  } catch {
    const err = new Error("Gemini returned malformed JSON for food analysis.");
    err.code = "AI_MALFORMED_RESPONSE";
    throw err;
  }

  try {
    return validateAnalysis(parsed);
  } catch (validationError) {
    const err = new Error(validationError.message);
    err.code = "AI_SCHEMA_MISMATCH";
    throw err;
  }
}

module.exports = { analyzeFoodImage };
