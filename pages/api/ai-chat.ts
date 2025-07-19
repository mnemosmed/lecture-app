import { NextApiRequest, NextApiResponse } from "next";

// Configure Gemini API using Google AI API (works with API keys)
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

  try {
    const { question, videoTitle } = req.body;

    if (!question || !videoTitle) {
      return res
        .status(400)
        .json({ error: "Question and video title are required" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    console.log("Gemini API Key exists:", !!GEMINI_API_KEY);
    console.log("Video Title:", videoTitle);
    console.log("Question:", question);

    // Create the prompt for medical Q&A with RAG capabilities
    const prompt = `You are an expert medical AI assistant. The user is watching a medical lecture titled: "${videoTitle}".

Please answer the following medical question with detailed, accurate information. When possible, reference verified medical sources like PubMed, MedScape, or other peer-reviewed medical literature.

Question: ${question}

Please provide a comprehensive answer that:
1. Directly addresses the question
2. Includes relevant medical information
3. References verified sources when applicable
4. Is appropriate for medical education
5. Maintains professional medical terminology

Keep your answer concise and focused on the most important key points. Use bullet points or short paragraphs. Avoid unnecessary elaboration or repetition.

Format your response with:
- Use **bold** for section headers, but do NOT number the section headers (e.g., use **Infections:** not **1. Infections:**)
- Only use numbered references [1], [2], etc. for citations in the text
- At the end, provide a "References" section with clickable links to PubMed, MedScape, or other medical sources
- For PubMed references, use format: [1] Author et al. (Year). Title. Journal. PMID: [PubMed ID]
- For MedScape references, use format: [2] Article Title. MedScape. [URL]
- Do NOT include any disclaimer section

Answer:`;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
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
      console.error("Gemini API Response:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response.";

    res.status(200).json({ text: aiResponse });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
}
