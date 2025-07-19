import { NextApiRequest, NextApiResponse } from "next";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoTitle } = req.body;
  if (!videoTitle) {
    return res.status(400).json({ error: "Missing videoTitle" });
  }
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  const prompt = `You are an expert medical educator. Generate 3 high-quality multiple-choice questions (MCQs) for the topic: "${videoTitle}". Each MCQ should have:
- A clear question
- 5 answer options (A, B, C, D, E)
- The correct answer (as the index: 0 for A, 1 for B, etc.)
- A concise explanation for the answer
- A reference (PubMed or MedScape style, with a clickable URL if possible)

Format your response as a JSON array, like this:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "...", "..."],
    "answer": 2,
    "explanation": "...",
    "reference": "[1] Author. Title. Journal. PMID: 12345678"
  },
  ...
]
Do not include any text before or after the JSON array.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Try to parse the JSON array from the response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("Gemini MCQ raw response:", text);
      return res.status(500).json({
        error: "Failed to parse MCQ JSON from Gemini response",
        raw: text,
      });
    }
    const mcqs = JSON.parse(match[0]);
    res.status(200).json({ mcqs });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : String(error) });
  }
}
