
const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

router.post("/plan", async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, interests } = req.body;

    if (!destination || !startDate || !endDate || budget === undefined || budget === "") {
      return res.status(400).json({
        message: "Destination, dates and budget are required."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is not configured on the server."
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const budgetAmount = Number(budget);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start ||
      !Number.isFinite(budgetAmount) ||
      budgetAmount <= 0
    ) {
      return res.status(400).json({
        message: "Please provide valid dates and a positive budget."
      });
    }

    const numberOfDays =
      Math.round(
        (
          Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()) -
          Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
        ) / 86400000
      ) + 1;

    if (numberOfDays > 15) {
      return res.status(400).json({
        message: "Please select a trip of 15 days or less."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const safeInterests = Array.isArray(interests)
      ? interests.slice(0, 10).map((item) => String(item).slice(0, 60)).join(", ")
      : "General sightseeing";

    const prompt = `
Create a concise, practical travel itinerary.

TRIP DETAILS
Destination: ${String(destination).slice(0, 150)}
Start date: ${startDate}
End date: ${endDate}
Total days: ${numberOfDays}
Total budget: ₹${budgetAmount}
Interests: ${safeInterests}

STRICT OUTPUT RULES
1. Keep the complete response short and easy to scan.
2. Include exactly one section per trip day.
3. For each day, provide only:
   - Morning: one activity.
   - Afternoon: one activity.
   - Evening: one activity.
4. Each activity must have a short description of no more than one sentence.
5. Prefer nearby places on the same day to reduce travel time and costs.
6. Include an estimated daily cost for each day.
7. End with a compact budget breakdown: accommodation, food, transport,
   activities and total estimated cost.
8. Add at most three short practical travel tips at the end.
9. Avoid long introductions, repeated information, lengthy paragraphs,
   multiple alternatives and unnecessary explanations.
10. Use valid Markdown headings, bullet lists and bold labels.
11. Keep the estimated total within the user's budget where reasonably possible.
12. If the budget is unrealistic for the destination, clearly say so briefly.
13. Do not claim live availability or exact current prices.
14. Mention that prices and costs are estimates.
15. Do not invent bookings or claim that places are open without verification.

Use this compact format:

# [Destination] Trip Plan
[Dates] | [Number of days] days | Budget: ₹[budget]

## Day 1 — [Short title]
- **Morning:** [Activity]
- **Afternoon:** [Activity]
- **Evening:** [Activity]
- **Estimated cost:** ₹[amount]

Repeat for each day.

## Budget Breakdown
- Accommodation: ₹[amount]
- Food: ₹[amount]
- Transport: ₹[amount]
- Activities: ₹[amount]
- **Estimated total: ₹[amount]**

## Quick Tips
- [Short tip]
- [Short tip]

Generate the itinerary for exactly ${numberOfDays} days.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt
    });

    if (!response.text) {
      return res.status(502).json({
        message: "The AI could not generate an itinerary. Please try again."
      });
    }

    return res.json({
      destination,
      itinerary: response.text
    });
  } catch (error) {
    console.error("AI itinerary generation failed:", error.message);

    return res.status(500).json({
      message: "Failed to generate itinerary. Please try again."
    });
  }
});

module.exports = router;
