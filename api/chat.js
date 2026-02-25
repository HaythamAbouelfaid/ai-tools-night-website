const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Rate Limits - WARNING: In-memory store won't strictly persist across Vercel invocations perfectly
// but applies basic limits per container.
const chatRateLimits = new Map();

module.exports = async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "unknown";
        const now = Date.now();
        const userLimit = chatRateLimits.get(ip) || { count: 0, resetTime: now + 60000 };

        if (now > userLimit.resetTime) {
            userLimit.count = 0;
            userLimit.resetTime = now + 60000;
        }

        if (userLimit.count >= 15) {
            return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
        }

        userLimit.count++;
        chatRateLimits.set(ip, userLimit);

        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ error: "OpenRouter API Key not configured." });
        }

        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const messages = data.messages || [];

        const recentHistory = messages.slice(-6);

        const systemPrompt = `You are the AI Tools Explorers Night assistant.
You help users navigate the site, understand prompts, learn about AI tools, and apply for roles.
Be concise, clear, and builder-focused. Avoid formatting with markdown bullet points if possible to keep responses clean in chat, unless necessary.
If a user asks something unrelated to AI or the site, respond briefly and redirect to helpful content.
Encourage exploration and experimentation.

Context:
Routes: Home (/), Events (/events.html), Prompt Library (/prompt-library), Careers (/careers.html), Hackathon (/hackathon.html), About (/about.html)
Prompts: "Meta LinkedIn Outreach", "Efficiency LinkedIn Outreach", "Outcome-Focused LinkedIn Outreach", "Challenger LinkedIn Outreach".
Careers Roles: "Web-Based Development Tools", "AI-Powered Coding Assistants", "Image Generation & Design Tools", "Video Generation Tools", "Audio Generation Tools", "Productivity & Automation Tools", "Avatar Tools".`;

        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...recentHistory
        ];

        const chatReq = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": req.headers.origin || "http://localhost:3000",
                "X-Title": "AI Tools Explores Night Assistant"
            },
            body: JSON.stringify({
                model: "anthropic/claude-3-haiku",
                messages: apiMessages,
                max_tokens: 400
            })
        });

        if (!chatReq.ok) {
            const errText = await chatReq.text();
            throw new Error(errText);
        }

        const json = await chatReq.json();
        const textResponse = (json.choices && json.choices.length > 0)
            ? json.choices[0].message.content
            : "I didn't quite catch that. Please try again.";

        return res.status(200).json({ response: textResponse });

    } catch (err) {
        console.error("Chat API error:", err);
        return res.status(500).json({ error: "Sorry, I am having trouble connecting to my brain right now." });
    }
};
