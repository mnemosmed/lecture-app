import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "No API key found" });
  }

  // Test different endpoints
  const endpoints = [
    {
      name: "Google AI Studio - gemini-1.5-flash",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    },
    {
      name: "Google AI Studio - gemini-pro",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
    },
    {
      name: "Vertex AI - gemini-pro",
      url: `https://us-central1-aiplatform.googleapis.com/v1/projects/gen-lang-client-0405653694/locations/us-central1/publishers/google/models/gemini-pro:generateContent?key=${API_KEY}`,
    },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello",
                },
              ],
            },
          ],
        }),
      });

      results.push({
        name: endpoint.name,
        status: response.status,
        ok: response.ok,
        error: response.ok ? null : await response.text(),
      });
    } catch (error) {
      results.push({
        name: endpoint.name,
        status: "ERROR",
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  res.json({ results });
}
