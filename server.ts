import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' })); // We might send base64 images

  // AI proxy endpoint
  app.post("/api/gemini", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('Using API Key of length:', apiKey ? apiKey.length : 'undefined');
      if (!apiKey) {
        return res.status(500).json({ error: "API Key no configurada en el servidor." });
      }

      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const response = await ai.models.generateContent(req.body);
      
      // Send back the necessary parts of the response
      res.json({
        text: response.text,
        functionCalls: response.functionCalls,
        candidates: response.candidates,
      });
    } catch (error: any) {
      const apiKeyPrefix = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : 'none';
      console.error("Server API Error:", error);
      res.status(500).json({ error: error.message || "Unknown proxy error", keyPrefix: apiKeyPrefix });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
