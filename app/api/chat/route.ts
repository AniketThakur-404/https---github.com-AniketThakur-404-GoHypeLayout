import { DATA as goHypeData } from "@/lib/data";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// Build a helpful fallback response from local data when the external API is unavailable.
function generateFallbackResponse(history: any[]) {
  const last = history && history.length ? String(history[history.length - 1].content).toLowerCase() : "";

  // If user asks about services, return a short list.
  if (/service|services|what do you do|offer|offerings/.test(last)) {
    const services = goHypeData.services
      .map(s => `- ${s.title}: ${s.description}`)
      .join("\n");
    return `GoHype Media offers the following services:\n${services}`;
  }

  // If user asks about contact, return contact info.
  if (/contact|phone|email|address/.test(last)) {
    const c = goHypeData.contact;
    return `Contact GoHype Media:\nPhone: ${c.phone}\nEmail: ${c.email}\nAddress: ${c.address}\nHours: ${c.hours} (${c.hoursClosed})`;
  }

  // Default: short site summary
  return `${goHypeData.siteName} — ${goHypeData.tagline}\n\n${goHypeData.subTagline}\n\nServices:\n${goHypeData.services.map(s => `- ${s.title}: ${s.description}`).join("\n")}`;
}

async function runChat(chatHistory: any[]) {
  // If OpenAI key is present, use OpenAI's Chat Completions API first.
  if (OPENAI_API_KEY) {
    try {
      const messages = chatHistory.map((m: any) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content }));
      const payload = {
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      };

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        console.error('OpenAI response not OK', await resp.text());
        // fall through to other providers/fallback
      } else {
        const j = await resp.json();
        const text = j.choices?.[0]?.message?.content || j.choices?.[0]?.text || '';
        if (text) return String(text).trim();
      }
    } catch (openErr: any) {
      console.error('OpenAI request error:', openErr?.message || openErr);
      // fall back to other providers or local
    }
  }

  // If OpenRouter API key is present, try OpenRouter next
  if (OPENROUTER_API_KEY) {
    try {
      const messages = chatHistory.map((m: any) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content }));
      const payload = {
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages,
      };

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        console.error('OpenRouter response not OK', await resp.text());
      } else {
        const j = await resp.json();
        const text = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text || '';
        if (text) return String(text).trim();
      }
    } catch (orErr: any) {
      console.error('OpenRouter request error:', orErr?.message || orErr);
    }
  }

  // If Google API key is not configured, use fallback
  if (!GOOGLE_API_KEY) {
    console.warn('No API keys set — using local fallback response for /api/chat');
    return generateFallbackResponse(chatHistory);
  }

  try {
    // Dynamically import the Google SDK
    const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest", systemInstruction: `You are "GoHype Bot", a friendly and professional AI assistant for GoHype Media. Answer only from the provided data.` });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: chatHistory.map((msg: any) => ({ role: msg.sender === "user" ? "user" : "model", parts: [{ text: msg.content }] })),
    });

    const lastMessage = chatHistory[chatHistory.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = result.response;
    return response.text();
  } catch (err: any) {
    console.error("Error using Google Generative AI SDK:", err?.message || err);
    // Fall back to local data if anything goes wrong.
    return generateFallbackResponse(chatHistory);
  }
}

export async function POST(req: Request) {
  try {
    const { history } = await req.json();
    if (!history) {
      return new Response("Error: Chat history is required.", { status: 400 });
    }
    const aiResponse = await runChat(history);
    return new Response(aiResponse, { status: 200 });
  } catch (error: any) {
    console.error("/api/chat error:", error?.message || error);
    return new Response(`Error processing your request: ${error?.message || String(error)}`, { status: 500 });
  }
}

