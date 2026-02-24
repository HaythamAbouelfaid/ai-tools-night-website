const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

// 1. Manually parse .env without requiring 'dotenv' module
const envRaw = fs.readFileSync('.env', 'utf-8');
const env = {};
envRaw.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let val = match[2].trim();
        // Remove quotes and handle literal newlines in private key
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/\\n/g, '\n');
        }
        env[match[1].trim()] = val;
    }
});

const EMAIL = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = env.GOOGLE_PRIVATE_KEY;
const SHEET_ID = env.GOOGLE_SHEET_ID;
const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || '';

// Rate Limits
const chatRateLimits = new Map();

// 2. JWT helpers for ZERO-DEPENDENCY Google OAuth 
function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

async function getAccessToken() {
    const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    // Scopes needed for writing to Google Sheets
    const claimSet = JSON.stringify({
        iss: EMAIL,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: "https://oauth2.googleapis.com/token",
        exp,
        iat
    });

    const signatureInput = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;

    // Sign using crypto native core module
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(PRIVATE_KEY, 'base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const jwt = `${signatureInput}.${signature}`;

    // Request token via native fetch API
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    if (!res.ok) throw new Error(await res.text());
    return (await res.json()).access_token;
}

// 3. Mini HTTP server
const server = http.createServer(async (req, res) => {
    // Enable CORS to allow Vite app to call this server directly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/api/chat') {
        let bodyChunks = [];
        req.on('data', chunk => bodyChunks.push(chunk));

        req.on('end', async () => {
            try {
                const ip = req.socket.remoteAddress || "unknown";
                const now = Date.now();
                const userLimit = chatRateLimits.get(ip) || { count: 0, resetTime: now + 60000 };

                if (now > userLimit.resetTime) {
                    userLimit.count = 0;
                    userLimit.resetTime = now + 60000;
                }

                if (userLimit.count >= 15) {
                    res.writeHead(429, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: "Rate limit exceeded. Try again later." }));
                }

                userLimit.count++;
                chatRateLimits.set(ip, userLimit);

                if (!OPENROUTER_API_KEY) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: "OpenRouter API Key not configured." }));
                }

                const data = JSON.parse(Buffer.concat(bodyChunks).toString());
                const messages = data.messages || [];

                // Filter down to last 6 messages (truncate older ones)
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
                        "HTTP-Referer": "http://localhost:3000",
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

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response: textResponse }));
            } catch (err) {
                console.error("Chat API error:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Sorry, I am having trouble connecting to my brain right now." }));
            }
        });
        return;
    } else if (req.method === 'POST' && req.url === '/api/submit') {
        let bodyChunks = [];
        req.on('data', chunk => bodyChunks.push(chunk));

        req.on('end', async () => {
            try {
                const data = JSON.parse(Buffer.concat(bodyChunks).toString());

                // Format readable date
                const rawDate = data.timestamp ? new Date(data.timestamp) : new Date();
                const readableDate = `${rawDate.getMonth() + 1}/${rawDate.getDate()}/${rawDate.getFullYear()}`;

                let values = [];
                let actualSheetName = '';

                if (data.formType === 'hackathon') {
                    values = [
                        readableDate,
                        data.fullName || '',
                        data.project || '',
                        data.linkedin || '',
                        data.phone || '',
                        data.presenting || '',
                        data.tools || '',
                        data.favoriteLLM || ''
                    ];
                    actualSheetName = 'Hackathon Form';
                } else if (data.formType === 'member') {
                    values = [
                        readableDate,
                        data.fullName || '',
                        data.email || '',
                        data.ageRange || '',
                        data.role || '',
                        data.school || '',
                        data.linkedin || '',
                        data.source || '',
                        data.notes || ''
                    ];
                    actualSheetName = 'Main Form';
                } else if (data.formType === 'careers') {
                    values = [
                        readableDate,
                        data.role || '',
                        data.full_name || '',
                        data.email || '',
                        data.tools_used || '',
                        data.project_description || '',
                        data.working_style || '',
                        data.links || '',
                        data.location_timezone || ''
                    ];
                    actualSheetName = 'AI Tools Night - Applications';
                } else {
                    throw new Error("Invalid formType");
                }

                const token = await getAccessToken();

                // Call Google Sheets API directly with native fetch
                const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(actualSheetName)}!A1:append?valueInputOption=USER_ENTERED`;
                const sheetRes = await fetch(sheetUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ values: [values] })
                });

                if (!sheetRes.ok) throw new Error(await sheetRes.text());

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: "Added to Google Sheets properly." }));

            } catch (err) {
                console.error("Error writing data to Google Sheets:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(3001, () => {
    console.log("-> ✅ Zero-Dependency Secure Backend listening on port 3001");
});
