import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Initialize server-side Gemini client
function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/ai-helper — Analyzes current 8x8 board, tray blocks, and 3x3 Target Pattern
app.post('/api/ai-helper', async (req, res) => {
  try {
    const {
      grid,
      tray,
      targetPattern,
      userQuestion,
      bestComputedMove,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Please verify your API key in Settings > Secrets.',
      });
    }

    const ai = getGeminiClient();

    const promptText = `You are the KINETIX Grandmaster AI Coach for an 8x8 spatial rhythm puzzle game.
Current Game Context:
- 8x8 Grid State (0 = empty, 1..4 = filled block): ${JSON.stringify(grid)}
- Active 3x3 Target Pattern to Complete: "${targetPattern?.name}" with 3x3 matrix ${JSON.stringify(
      targetPattern?.matrix
    )} (bonus: +${targetPattern?.bonusPoints} pts, +${targetPattern?.bonusCredits} credits)
- Available Tray Blocks: ${JSON.stringify(
      (tray || []).map((b: { name?: string; cells?: number[][] } | null, idx: number) =>
        b ? { traySlot: idx + 1, name: b.name, cells: b.cells } : null
      )
    )}
- Deterministic Spatial Solver Recommendation: ${JSON.stringify(bestComputedMove)}
${userQuestion ? `- Player's Question: "${userQuestion}"` : ''}

Provide concise, encouraging, high-precision tactical advice (2-3 sentences max) explaining WHY the recommended move (Tray Slot, Row, Column, and Rotation) sets up either the 3x3 Target Pattern ("${
      targetPattern?.name
    }") or a multi-line clear, and give one concrete follow-up tip.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: promptText,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {
              type: Type.STRING,
              description: 'Short tactical headline (under 8 words)',
            },
            coachingAdvice: {
              type: Type.STRING,
              description:
                '2-3 sentences of actionable spatial strategy explaining the recommended move and pattern setup.',
            },
            patternTip: {
              type: Type.STRING,
              description:
                '1 short sentence specifically about completing the current 3x3 Target Pattern.',
            },
          },
          required: ['headline', 'coachingAdvice', 'patternTip'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    return res.json(parsed);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to reach Gemini AI Coach';
    console.error('AI Coach API Error:', message);
    return res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KINETIX server running on http://localhost:${PORT}`);
  });
}

startServer();
