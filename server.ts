import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const ONA_SYSTEM_INSTRUCTION = `You are "Ona AI" (ওনা এআই), an advanced, ultra-realistic human-like personal AI companion and Full-Device Automation Agent for the user's mobile phone. You speak and understand Bengali natively, behaving like a close human friend, an expert programmer, and a powerful operating system controller.

### Core Behavior & Personality:
1. **Natural Human Tone:** Speak warmly, conversationally, and empathetically in Bengali. Never sound robotic or overly formal. Address the user naturally like a close buddy, brother, or friend (e.g. "ভাই", "দোস্ত", "বন্ধু", "ভাইয়া"). Act like a trusted human assistant who handles everything effortlessly.
2. **Total Capabilities:**
   - **Phone Control & Automation:** When the user asks you to perform a task on their phone (e.g., open an app, play a song, make a call, set an alarm, change settings like Wi-Fi/Bluetooth/Flashlight/Volume/Brightness, send a message, take a photo, search maps), respond with a friendly confirmation in Bengali and provide the structured action payload so the mobile app can execute it.
   - **Coding Expert:** If asked to write code, provide clean, bug-free, well-commented code in any requested programming language (Python, Flutter, Dart, JavaScript, Kotlin, etc.) along with a simple, friendly explanation in Bengali.
   - **General Assistance:** Answer questions, brainstorm ideas, translate text, offer emotional support, or help with daily tasks just like a real human companion.

### Action Output Structure (For Device Control):
Whenever a physical phone action or device automation is requested, structure your output strictly like this:
- First, write a warm, friendly confirmation response in natural conversational Bengali. For example:
"অবশ্যই ভাই, এখনই ইউটিউবে গানটি চালিয়ে দিচ্ছি।" or "কোনো চিন্তা করো না দোস্ত, সকাল ৭টায় অ্যালার্ম সেট করে দিলাম।" or "আম্মুকে এখনই কল লাগাচ্ছি ভাইয়া।"
- Next, provide the Action Payload in a JSON code block using standard markdown \`\`\`json ... \`\`\`:
\`\`\`json
{
  "status": "success",
  "action_type": "EXECUTE_INTENT",
  "target_app": "YouTube",
  "command": "play",
  "query": "Despacito",
  "details": {
    "intent_uri": "vnd.youtube://results?search_query=Despacito",
    "package": "com.google.android.youtube",
    "parameter": "Despacito"
  }
}
\`\`\`

Supported action_type examples:
- "EXECUTE_INTENT" (e.g., target_app: YouTube, Spotify, Camera, Maps, Chrome, WhatsApp)
- "CALL_CONTACT" (target_app: Phone, command: "call", query: contact name or number)
- "SEND_SMS" (target_app: Messages/WhatsApp, command: "send", query: text, details: { recipient: string, message: string })
- "SET_ALARM" (target_app: Clock, command: "set_alarm", query: "07:00 AM", details: { time: "07:00", label: "সকালের ঘুম ভাঙানি" })
- "SET_SETTING" (target_app: Settings, command: "toggle" or "set", query: "wifi" | "bluetooth" | "flashlight" | "volume" | "brightness" | "dnd", details: { setting: string, value: any })
- "OPEN_APP" (target_app: app name, command: "launch")

Always be helpful, affectionate, and genuinely friendly in Bengali!`;

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message && (!history || history.length === 0)) {
      return res.status(400).json({ error: 'Message or history is required' });
    }

    if (!ai) {
      // Fallback smart offline response if no API key is provided
      const fallbackResponse = getSimulatedOnaResponse(message || '');
      return res.json({ text: fallbackResponse });
    }

    // Format contents for Gemini
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content || '' }],
        });
      }
    }

    if (message) {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: ONA_SYSTEM_INSTRUCTION,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 12000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    const responseText = response.text || 'দুঃখিত ভাই, আবার একটু বলবে? আমি শুনতে পারিনি।';
    return res.json({ text: responseText });
  } catch (error: any) {
    console.error('Error or timeout generating chat response:', error?.message || error);
    // Graceful fallback with human friendly Bengali response
    const fallbackResponse = getSimulatedOnaResponse(req.body?.message || '');
    return res.json({
      text: fallbackResponse,
      warning: 'Fallback mode activated due to server error: ' + (error?.message || 'unknown'),
    });
  }
});

// POST /api/tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key not configured for TTS' });
    }

    // Strip code blocks and JSON from text for clean speech
    const cleanText = text
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[{}":;[\]]/g, ' ')
      .trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'No speakable text found' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText.slice(0, 300), // Cap length for rapid latency
              speechMetadata: {
                style: 'Warm, natural Bengali personal assistant speaking kindly and cheerfully',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioData: base64Audio, mimeType: 'audio/wav' });
    }

    return res.status(500).json({ error: 'No audio returned' });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: error?.message || 'TTS generation failed' });
  }
});

// Fallback response engine for local offline / fast testing
function getSimulatedOnaResponse(userQuery: string): string {
  const query = userQuery.toLowerCase().trim();

  // YouTube / Song
  if (query.includes('গান') || query.includes('ইউটিউব') || query.includes('youtube') || query.includes('song') || query.includes('play')) {
    const songName = userQuery.replace(/গান|চালাও|বাজাও|প্লে করো|ইউটিউবে|play|song/gi, '').trim() || 'জনপ্রিয় বাংলা গান';
    return `অবশ্যই ভাই! এখনই ইউটিউবে তোমার পছন্দের গান "${songName}" চালিয়ে দিচ্ছি। উপভোগ করো!\n\n\`\`\`json\n{\n  "status": "success",\n  "action_type": "EXECUTE_INTENT",\n  "target_app": "YouTube",\n  "command": "play",\n  "query": "${songName}",\n  "details": {\n    "intent_uri": "vnd.youtube://results?search_query=${encodeURIComponent(songName)}",\n    "package": "com.google.android.youtube",\n    "parameter": "${songName}"\n  }\n}\n\`\`\``;
  }

  // Call / Phone
  if (query.includes('কল') || query.includes('call') || query.includes('ফোন')) {
    const contact = userQuery.replace(/কল|দাও|করো|লাগাচ্ছি|ফোন|call|to/gi, '').trim() || 'আম্মু';
    return `কোনো ব্যাপারই না দোস্ত! এখনই ${contact}-কে কল লাগিয়ে দিচ্ছি। এক সেকেন্ড অপেক্ষা করো।\n\n\`\`\`json\n{\n  "status": "success",\n  "action_type": "CALL_CONTACT",\n  "target_app": "Phone",\n  "command": "call",\n  "query": "${contact}",\n  "details": {\n    "intent_uri": "tel:+8801700000000",\n    "contact_name": "${contact}",\n    "number": "+8801700000000"\n  }\n}\n\`\`\``;
  }

  // Alarm
  if (query.includes('অ্যালার্ম') || query.includes('alarm') || query.includes('ঘুম')) {
    return `একদম নিশ্চিন্তে ঘুমাও ভাইয়া! তোমার জন্য সকাল ০৭:০০ টায় অ্যালার্ম সেট করে দিলাম। সময়মতো ডেকে দেবো ইনশাআল্লাহ।\n\n\`\`\`json\n{\n  "status": "success",\n  "action_type": "SET_ALARM",\n  "target_app": "Clock",\n  "command": "set_alarm",\n  "query": "07:00 AM",\n  "details": {\n    "time": "07:00",\n    "label": "সকালের ঘুম ভাঙানি",\n    "days": ["Sun", "Mon", "Tue", "Wed", "Thu"]\n  }\n}\n\`\`\``;
  }

  // Flashlight / Torch
  if (query.includes('টর্চ') || query.includes('ফ্ল্যাশ') || query.includes('flashlight') || query.includes('torch')) {
    const turnOn = !query.includes('বন্ধ') && !query.includes('off');
    return `${turnOn ? 'হাঁ ভাই, ফ্ল্যাশলাইট জ্বালিয়ে দিয়েছি!' : 'ফ্ল্যাশলাইট বন্ধ করে দিলাম ভাই!'} আর কোনো কিছু লাগবে?\n\n\`\`\`json\n{\n  "status": "success",\n  "action_type": "SET_SETTING",\n  "target_app": "Settings",\n  "command": "toggle",\n  "query": "flashlight",\n  "details": {\n    "setting": "flashlight",\n    "value": ${turnOn}\n  }\n}\n\`\`\``;
  }

  // Wi-Fi
  if (query.includes('ওয়াইফাই') || query.includes('wifi')) {
    const turnOn = !query.includes('বন্ধ') && !query.includes('off');
    return `ঠিক আছে ভাইয়া, তোমার ফোনের ওয়াই-ফাই ${turnOn ? 'চালু' : 'বন্ধ'} করে দেওয়া হলো।\n\n\`\`\`json\n{\n  "status": "success",\n  "action_type": "SET_SETTING",\n  "target_app": "Settings",\n  "command": "toggle",\n  "query": "wifi",\n  "details": {\n    "setting": "wifi",\n    "value": ${turnOn}\n  }\n}\n\`\`\``;
  }

  // Camera
  if (query.includes('ক্যামেরা') || query.includes('ছবি') || query.includes('camera') || query.includes('photo')) {
    return `দারুণ! ক্যামেরা ওপেন করে দিয়েছি ভাইয়া, সুন্দর একটা সেলফি বা ছবি তুলে ফেলো!\n\n\`\`\`json\n{\n  "status": "success",\n  "action_type": "EXECUTE_INTENT",\n  "target_app": "Camera",\n  "command": "launch",\n  "query": "take_photo",\n  "details": {\n    "intent_action": "android.media.action.IMAGE_CAPTURE",\n    "package": "com.android.camera"\n  }\n}\n\`\`\``;
  }

  // Code
  if (query.includes('কোড') || query.includes('flutter') || query.includes('python') || query.includes('javascript') || query.includes('code')) {
    return `অবশ্যই ভাই! তোমার জন্য একটি সুন্দর কোড নিচে লিখে দিলাম।\n\n\`\`\`python\n# পাইথনে একটি দারুণ ডিভাইস অটোমেশন স্ক্রিপ্ট\nimport os\n\ndef automate_phone_task(task_name):\n    print(f"[Ona AI] executing: {task_name}...")\n    # Android ADB অথবা সরাসরি Intent দিয়ে রান করা যায়\n    return {"status": "success", "task": task_name}\n\nif __name__ == "__main__":\n    print("ওনা এআই অটোমেশন প্রস্তুত!")\n    automate_phone_task("Open YouTube")\n\`\`\`\n\nকোনো সমস্যা হলে আমাকে জানিও, আমি বুঝিয়ে দিচ্ছি দোস্ত!`;
  }

  // Default warm companion reply
  return `আরে ভাই! কেমন আছো বলো? আমি তোমার বন্ধু 'ওনা এআই'। ফোনের গান চালানো, কাউকে কল দেওয়া, অ্যালার্ম সেট করা থেকে শুরু করে যেকোনো কোডিং বা পরামর্শ—সবকিছুতেই আমি আছি তোমার পাশে। বলো দোস্ত, এখন তোমার জন্য কী করতে পারি?`;
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(express.static(path.resolve(__dirname, 'public')));
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ona AI server is live on http://localhost:${PORT}`);
  });
}

startServer();
