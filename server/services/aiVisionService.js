/**
 * Real food-image analysis via Google Gemini's vision-capable
 * generateContent endpoint. This is the ONLY place that talks to the AI
 * provider — the API key lives here, server-side, and is never sent to
 * the browser.
 *
 * Contract: analyzeFoodImage(buffer, mimeType) resolves to a validated
 * object matching ANALYSIS_SCHEMA's properties, or throws. It NEVER
 * fabricates a fallback result — a thrown error means the caller must
 * surface a genuine "analysis failed" state, per the product spec.
 */

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    isFood: { type: "boolean" },
    foodType: { type: "string" },
    category: {
      type: "string",
      enum: ["Fruit", "Vegetable", "Dairy", "Bakery", "Cooked Meal", "Grain", "Meat/Seafood", "Beverage", "Other"],
    },
    freshness: { type: "string", enum: ["Fresh", "Ripe", "Moderate", "Spoiled"] },
    freshnessScore: { type: "integer" },
    confidence: { type: "number" },
    remainingDays: { type: "integer" },
    safeToConsume: { type: "boolean" },
    warnings: { type: "array", items: { type: "string" } },
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
    "safeToConsume",
    "warnings",
    "recommendation",
  ],
};

const PROMPT = `You are a food-safety inspection assistant for a food-donation platform.
Look at the attached image and assess the food shown.

Rules:
- If the image does not clearly show food, set isFood to false and explain why in recommendation; still fill other fields with your best-effort neutral values (freshnessScore 0, confidence low).
- freshnessScore is 0-100 (100 = perfectly fresh).
- confidence is 0-1, your genuine confidence in this assessment from a single photo.
- remainingDays is your best estimate of days of safe edibility remaining if stored normally, 0 if already spoiled/unsafe.
- safeToConsume/donatable should be false if there are visible signs of mold, rot, spoilage, or contamination.
- warnings should list specific visible concerns (e.g. "mold visible on surface"), or be an empty array if none.
- recommendation is one short, concrete sentence a food-bank volunteer could act on.
Respond ONLY with JSON matching the required schema — no extra commentary.`;

async function analyzeFoodImage(buffer, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "AI analysis is not configured on the server (missing GEMINI_API_KEY)."
    );
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: buffer.toString("base64") } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
      temperature: 0.2,
    },
  };

  let response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    const err = new Error("Could not reach the AI analysis service. Please try again.");
    err.code = "AI_UNAVAILABLE";
    throw err;
  }

  if (!response.ok) {
    // Never fabricate a result on failure — surface a genuine error.
    let details = "";
    try {
      const errJson = await response.json();
      details = errJson?.error?.message || "";
    } catch {
      /* ignore parse failure */
    }
    const err = new Error(
      `AI analysis service returned an error${details ? `: ${details}` : ""}.`
    );
    err.code = "AI_PROVIDER_ERROR";
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const textPart = data?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
  if (!textPart) {
    const err = new Error("AI analysis service returned an empty response.");
    err.code = "AI_EMPTY_RESPONSE";
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(textPart);
  } catch {
    const err = new Error("AI analysis service returned a malformed response.");
    err.code = "AI_MALFORMED_RESPONSE";
    throw err;
  }

  // Minimal shape validation — don't trust the provider blindly either.
  for (const field of ANALYSIS_SCHEMA.required) {
    if (!(field in parsed)) {
      const err = new Error(`AI analysis response is missing required field "${field}".`);
      err.code = "AI_SCHEMA_MISMATCH";
      throw err;
    }
  }

  return parsed;
}

module.exports = { analyzeFoodImage };
