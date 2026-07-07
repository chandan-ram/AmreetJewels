import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client with standard telemetry headers as required
  const apiKey = process.env.GEMINI_API_KEY;
  let aiClient: GoogleGenAI | null = null;

  if (apiKey) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. AI features will fallback to offline rule-based recommendations.");
  }

  // API Route: AI Jewellery Stylist Endpoint
  app.post("/api/gemini/advisor", async (req, res) => {
    try {
      const { prompt, history, dressType, dressColor, occasion, budget, products } = req.body;

      if (!aiClient) {
        return res.status(503).json({
          error: "API key is missing",
          message: "The Gemini AI styling advisor is offline because the GEMINI_API_KEY is not configured in secrets. Please configure it in the Secrets panel."
        });
      }

      // Build structured context from available catalog products
      const catalogSummary = (products || []).map((p: any) => 
        `- ID: "${p.id}", Title: "${p.title}", Price: ₹${p.price}, Category: "${p.category}", Materials: "${p.materials}", Color/Style: "${p.color}", Occasion: "${p.occasion}", Tags: ${p.tags?.join(', ')}`
      ).join('\n');

      const systemPrompt = `You are "Sona", the luxury AI Jewellery Stylist for "Kanak Jewellery" (an elegant, premium artificial jewellery brand in India catering to modern women, festive shoppers, and wedding goers). 
Your goal is to provide exceptional, premium, and friendly jewellery styling consultation to help the customer find the perfect fashionable and affordable artificial jewellery matching their dress, occasion, and preferences.

The customer is consulting you with:
- Dress Style: ${dressType || 'Not specified'}
- Dress Color: ${dressColor || 'Not specified'}
- Occasion: ${occasion || 'Not specified'}
- Budget limit: ${budget ? '₹' + budget : 'Not specified'}

Here is the current available jewellery catalogue inventory:
${catalogSummary}

GUIDELINES FOR RESPONSE:
1. Speak in a warm, welcoming, and elegant tone, referencing Indian fashion contexts (e.g., weddings, sangeet, sangeet prep, sangeet night, diwali, office glam).
2. Give specific, professional styling recommendations (e.g., "Since you are wearing a sweetheart neckline crimson red Lehenga, a choker necklace set like the Vandana Royal Kundan Choker with hanging emerald beads will create a striking contrast while beautifully highlighting your collarbones...").
3. Suggest 1 to 3 actual products from the provided catalogue list. Always reference their EXACT title and state the product ID in a hidden-friendly markdown format or clearly inside brackets like: [Vandana Royal Kundan Choker Set](prod-1) so the UI can parse it and render the interactive product card.
4. Keep the advice concise, highly professional, structured, and visually stunning using elegant Markdown.
5. Do not use generic placeholders. Address the specific colors and dress types provided!`;

      // Construct messages in official Gemini API format
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: 'user', parts: [{ text: `SYSTEM_INSTRUCTIONS: ${systemPrompt}` }] },
          ...(history || []).map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          })),
          { role: 'user', parts: [{ text: prompt || `Recommend jewellery for a ${dressColor} ${dressType} for a ${occasion}.` }] }
        ]
      });

      const responseText = response.text || "I apologize, I am processing your style coordinates. Could you tell me more about your outfit?";
      
      // Parse recommended product IDs from the response text
      const recommendedProductIds: string[] = [];
      const prodMatches = responseText.match(/\((prod-\d+)\)/g) || responseText.match(/\[([^\]]+)\]\((prod-\d+)\)/g) || [];
      prodMatches.forEach(match => {
        const idMatch = match.match(/prod-\d+/);
        if (idMatch && !recommendedProductIds.includes(idMatch[0])) {
          recommendedProductIds.push(idMatch[0]);
        }
      });

      res.json({
        text: responseText,
        recommendedProductIds
      });

    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to call Gemini AI Stylist",
        message: "We encountered an issue styling your choice. Please try again or browse our traditional catalog!"
      });
    }
  });

  // Serve static assets in production, otherwise mount Vite in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
